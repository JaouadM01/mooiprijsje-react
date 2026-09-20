import { z } from 'zod'
import { money, multiplyMoney, sumMoney } from '@/lib/money'
import { readStorage, writeStorage } from '@/lib/storage'
import type { Cart, CartLine, Product } from '@/types/shop'
import { ShopApiError } from '../errors'
import { MAX_LINE_QUANTITY, type CartRepository } from '../repositories'
import { MOCK_PRODUCTS } from './catalog'

export const MOCK_CART_ID = 'mock-cart'
const DEFAULT_STORAGE_KEY = 'mp-mock-cart'

const storedLinesSchema = z.array(
  z.object({ variantId: z.string(), quantity: z.number().int().min(1).max(MAX_LINE_QUANTITY) }),
)

type StoredLine = z.infer<typeof storedLinesSchema>[number]

export interface MockCartOptions {
  readonly products?: readonly Product[]
  readonly storageKey?: string
}

/**
 * Demo-winkelwagen die in localStorage bewaard blijft. Alleen variant-id's en aantallen
 * worden opgeslagen; prijzen en titels komen altijd uit de catalogus.
 */
export function createMockCartRepository(options: MockCartOptions = {}): CartRepository {
  const products = options.products ?? MOCK_PRODUCTS
  const storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY

  const variants = new Map(
    products.flatMap((product) => product.variants.map((variant) => [variant.id, { product, variant }] as const)),
  )

  function load(): readonly StoredLine[] {
    const raw = readStorage('local', storageKey)
    if (raw === null) return []
    try {
      const parsed = storedLinesSchema.safeParse(JSON.parse(raw))
      return parsed.success ? parsed.data : []
    } catch {
      return []
    }
  }

  function save(lines: readonly StoredLine[]): void {
    writeStorage('local', storageKey, JSON.stringify(lines))
  }

  function build(lines: readonly StoredLine[]): Cart {
    const cartLines = lines.flatMap((line): CartLine[] => {
      const entry = variants.get(line.variantId)
      if (!entry) return []
      const { product, variant } = entry
      return [
        {
          id: variant.id,
          quantity: line.quantity,
          variantId: variant.id,
          productHandle: product.handle,
          productTitle: product.title,
          variantTitle: variant.title === 'Default Title' ? null : variant.title,
          image: variant.image ?? product.images[0] ?? null,
          unitPrice: variant.price,
          total: multiplyMoney(variant.price, line.quantity),
        },
      ]
    })

    return {
      id: MOCK_CART_ID,
      checkoutUrl: null,
      totalQuantity: cartLines.reduce((sum, line) => sum + line.quantity, 0),
      subtotal: cartLines.length > 0 ? sumMoney(cartLines.map((line) => line.total)) : money(0),
      lines: cartLines,
    }
  }

  function persist(lines: readonly StoredLine[]): Cart {
    save(lines)
    return build(lines)
  }

  function assertCart(cartId: string): void {
    if (cartId !== MOCK_CART_ID) throw new ShopApiError('Deze winkelwagen bestaat niet meer.')
  }

  return {
    async getCart(cartId) {
      return cartId === MOCK_CART_ID ? build(load()) : null
    },

    async addLine(cartId, variantId, quantity) {
      if (cartId !== null) assertCart(cartId)
      const entry = variants.get(variantId)
      if (!entry?.variant.available) throw new ShopApiError('Dit product is helaas niet beschikbaar.')

      const lines = load()
      const existing = lines.find((line) => line.variantId === variantId)
      const nextQuantity = Math.min(MAX_LINE_QUANTITY, (existing?.quantity ?? 0) + Math.max(1, Math.floor(quantity)))
      const next = existing
        ? lines.map((line) => (line.variantId === variantId ? { ...line, quantity: nextQuantity } : line))
        : [...lines, { variantId, quantity: nextQuantity }]
      return persist(next)
    },

    async updateLine(cartId, lineId, quantity) {
      assertCart(cartId)
      const lines = load()
      if (!lines.some((line) => line.variantId === lineId)) throw new ShopApiError('Deze regel staat niet in je winkelwagen.')
      const next =
        quantity <= 0
          ? lines.filter((line) => line.variantId !== lineId)
          : lines.map((line) =>
              line.variantId === lineId ? { ...line, quantity: Math.min(MAX_LINE_QUANTITY, Math.floor(quantity)) } : line,
            )
      return persist(next)
    },

    async removeLine(cartId, lineId) {
      assertCart(cartId)
      return persist(load().filter((line) => line.variantId !== lineId))
    },
  }
}
