import { ShopApiError } from '../errors'
import { MAX_LINE_QUANTITY } from '../repositories'
import { MOCK_PRODUCTS } from './catalog'
import { createMockCartRepository, MOCK_CART_ID } from './mockCartRepository'

const inStock = MOCK_PRODUCTS.find((p) => p.handle === 'snellader-20w-usb-c')!.variants[0]!
const other = MOCK_PRODUCTS.find((p) => p.handle === 'batterij-iphone-12')!.variants[0]!
const soldOut = MOCK_PRODUCTS.find((p) => p.handle === 'samsung-galaxy-a54-scherm')!.variants[0]!

describe('mock cart repository', () => {
  it('starts empty', async () => {
    const cart = await createMockCartRepository().getCart(MOCK_CART_ID)
    expect(cart).toMatchObject({ totalQuantity: 0, lines: [], subtotal: { amount: 0 }, checkoutUrl: null })
  })

  it('returns null for an unknown cart id', async () => {
    expect(await createMockCartRepository().getCart('other')).toBeNull()
  })

  it('adds a line and calculates totals from the catalogue', async () => {
    const repo = createMockCartRepository()
    const cart = await repo.addLine(null, inStock.id, 2)
    expect(cart.totalQuantity).toBe(2)
    expect(cart.lines[0]).toMatchObject({ quantity: 2, productTitle: 'Snellader 20W USB-C', variantTitle: null })
    expect(cart.subtotal.amount).toBe(inStock.price.amount * 2)
  })

  it('merges repeated adds into one line and caps the quantity', async () => {
    const repo = createMockCartRepository()
    await repo.addLine(null, inStock.id, 60)
    const cart = await repo.addLine(MOCK_CART_ID, inStock.id, 60)
    expect(cart.lines).toHaveLength(1)
    expect(cart.lines[0]?.quantity).toBe(MAX_LINE_QUANTITY)
  })

  it('sums several lines', async () => {
    const repo = createMockCartRepository()
    await repo.addLine(null, inStock.id, 1)
    const cart = await repo.addLine(MOCK_CART_ID, other.id, 1)
    expect(cart.subtotal.amount).toBe(inStock.price.amount + other.price.amount)
  })

  it('rejects unavailable and unknown variants', async () => {
    const repo = createMockCartRepository()
    await expect(repo.addLine(null, soldOut.id, 1)).rejects.toBeInstanceOf(ShopApiError)
    await expect(repo.addLine(null, 'nope', 1)).rejects.toBeInstanceOf(ShopApiError)
  })

  it('updates and removes lines', async () => {
    const repo = createMockCartRepository()
    await repo.addLine(null, inStock.id, 1)
    expect((await repo.updateLine(MOCK_CART_ID, inStock.id, 5)).totalQuantity).toBe(5)
    expect((await repo.updateLine(MOCK_CART_ID, inStock.id, 0)).lines).toEqual([])

    await repo.addLine(MOCK_CART_ID, inStock.id, 1)
    expect((await repo.removeLine(MOCK_CART_ID, inStock.id)).totalQuantity).toBe(0)
  })

  it('rejects updates for lines that are not in the cart', async () => {
    await expect(createMockCartRepository().updateLine(MOCK_CART_ID, 'x', 1)).rejects.toBeInstanceOf(ShopApiError)
  })

  it('persists across repository instances', async () => {
    await createMockCartRepository().addLine(null, inStock.id, 3)
    const cart = await createMockCartRepository().getCart(MOCK_CART_ID)
    expect(cart?.totalQuantity).toBe(3)
  })

  it('ignores corrupted or tampered stored data', async () => {
    window.localStorage.setItem('mp-mock-cart', '{not json')
    expect((await createMockCartRepository().getCart(MOCK_CART_ID))?.lines).toEqual([])

    window.localStorage.setItem('mp-mock-cart', JSON.stringify([{ variantId: inStock.id, quantity: -5 }]))
    expect((await createMockCartRepository().getCart(MOCK_CART_ID))?.lines).toEqual([])

    window.localStorage.setItem('mp-mock-cart', JSON.stringify([{ variantId: 'gone', quantity: 1 }]))
    expect((await createMockCartRepository().getCart(MOCK_CART_ID))?.lines).toEqual([])
  })

  it('rejects a foreign cart id on mutations', async () => {
    await expect(createMockCartRepository().addLine('other', inStock.id, 1)).rejects.toBeInstanceOf(ShopApiError)
  })
})
