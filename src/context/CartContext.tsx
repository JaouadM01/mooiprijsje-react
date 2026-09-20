import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { toUserMessage } from '@/data/errors'
import { readStorage, removeStorage, writeStorage } from '@/lib/storage'
import type { Cart } from '@/types/shop'
import { useServices } from './ServicesContext'

const CART_ID_KEY = 'mp-cart-id'

interface CartContextValue {
  readonly cart: Cart | null
  readonly totalQuantity: number
  readonly isOpen: boolean
  /** true zolang een wijziging onderweg is; knoppen horen dan uitgeschakeld te zijn. */
  readonly isBusy: boolean
  readonly error: string | null
  readonly openCart: () => void
  readonly closeCart: () => void
  /** Voegt toe en opent het winkelwagenpaneel. Geeft terug of het gelukt is. */
  readonly addItem: (variantId: string, quantity?: number) => Promise<boolean>
  /** Voegt toe en gaat direct naar afrekenen (in demo-modus: opent het paneel). */
  readonly buyNow: (variantId: string, quantity?: number) => Promise<boolean>
  readonly updateQuantity: (lineId: string, quantity: number) => Promise<void>
  readonly removeItem: (lineId: string) => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { readonly children: ReactNode }) {
  const { cart: repository } = useServices()
  const [cart, setCart] = useState<Cart | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isBusy, setIsBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cartIdRef = useRef<string | null>(null)

  useEffect(() => {
    const storedId = readStorage('local', CART_ID_KEY)
    if (storedId === null) return

    let isCancelled = false
    repository
      .getCart(storedId)
      .then((loaded) => {
        // Is er intussen al iets aan de winkelwagen toegevoegd, dan is dat de nieuwste stand.
        if (isCancelled || cartIdRef.current !== null) return
        if (loaded === null) {
          removeStorage('local', CART_ID_KEY)
          return
        }
        cartIdRef.current = loaded.id
        setCart(loaded)
      })
      .catch((cause: unknown) => {
        if (!isCancelled) setError(toUserMessage(cause))
      })
    return () => {
      isCancelled = true
    }
  }, [repository])

  const run = useCallback(async (operation: () => Promise<Cart>): Promise<Cart | null> => {
    setIsBusy(true)
    setError(null)
    try {
      const next = await operation()
      cartIdRef.current = next.id
      writeStorage('local', CART_ID_KEY, next.id)
      setCart(next)
      return next
    } catch (cause) {
      setError(toUserMessage(cause))
      return null
    } finally {
      setIsBusy(false)
    }
  }, [])

  const addItem = useCallback(
    async (variantId: string, quantity = 1) => {
      const next = await run(() => repository.addLine(cartIdRef.current, variantId, quantity))
      if (next !== null) setIsOpen(true)
      return next !== null
    },
    [repository, run],
  )

  const buyNow = useCallback(
    async (variantId: string, quantity = 1) => {
      const next = await run(() => repository.addLine(cartIdRef.current, variantId, quantity))
      if (next === null) return false
      if (next.checkoutUrl) window.location.assign(next.checkoutUrl)
      else setIsOpen(true)
      return true
    },
    [repository, run],
  )

  const updateQuantity = useCallback(
    async (lineId: string, quantity: number) => {
      const cartId = cartIdRef.current
      if (cartId === null) return
      await run(() => repository.updateLine(cartId, lineId, quantity))
    },
    [repository, run],
  )

  const removeItem = useCallback(
    async (lineId: string) => {
      const cartId = cartIdRef.current
      if (cartId === null) return
      await run(() => repository.removeLine(cartId, lineId))
    },
    [repository, run],
  )

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      totalQuantity: cart?.totalQuantity ?? 0,
      isOpen,
      isBusy,
      error,
      openCart,
      closeCart,
      addItem,
      buyNow,
      updateQuantity,
      removeItem,
    }),
    [cart, isOpen, isBusy, error, openCart, closeCart, addItem, buyNow, updateQuantity, removeItem],
  )

  return <CartContext value={value}>{children}</CartContext>
}

export function useCart(): CartContextValue {
  const value = useContext(CartContext)
  if (value === null) throw new Error('useCart moet binnen een CartProvider worden gebruikt.')
  return value
}
