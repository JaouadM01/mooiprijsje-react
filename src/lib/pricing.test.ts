import type { Product, ProductVariant } from '@/types/shop'
import { money } from './money'
import {
  defaultVariant,
  findVariant,
  isOnSale,
  isOptionValueAvailable,
  savingsPercent,
  selectionFromVariant,
  stockLevel,
} from './pricing'

function variant(overrides: Partial<ProductVariant> & { selectedOptions: ProductVariant['selectedOptions'] }): ProductVariant {
  return {
    id: 'v',
    title: 'v',
    available: true,
    quantityAvailable: null,
    price: money(1000),
    compareAtPrice: null,
    image: null,
    ...overrides,
  }
}

const black1m = variant({ id: 'b1', selectedOptions: [{ name: 'Kleur', value: 'Zwart' }, { name: 'Lengte', value: '1m' }] })
const white1m = variant({ id: 'w1', available: false, selectedOptions: [{ name: 'Kleur', value: 'Wit' }, { name: 'Lengte', value: '1m' }] })
const white2m = variant({ id: 'w2', selectedOptions: [{ name: 'Kleur', value: 'Wit' }, { name: 'Lengte', value: '2m' }] })

const product = { variants: [white1m, black1m, white2m] } as unknown as Product

describe('isOnSale / savingsPercent', () => {
  it('detects a compare-at price above the price', () => {
    expect(isOnSale(money(800), money(1000))).toBe(true)
    expect(savingsPercent(money(800), money(1000))).toBe(20)
  })

  it('is not on sale without a compare-at price or when it is not higher', () => {
    expect(isOnSale(money(800), null)).toBe(false)
    expect(isOnSale(money(800), money(800))).toBe(false)
    expect(savingsPercent(money(800), money(500))).toBe(0)
  })

  it('rounds to a whole percentage', () => {
    expect(savingsPercent(money(6667), money(10000))).toBe(33)
  })
})

describe('stockLevel', () => {
  it('reports out of stock for unavailable variants', () => {
    expect(stockLevel({ available: false, quantityAvailable: 0 })).toBe('out')
  })

  it('reports low stock up to the threshold', () => {
    expect(stockLevel({ available: true, quantityAvailable: 5 })).toBe('low')
    expect(stockLevel({ available: true, quantityAvailable: 6 })).toBe('in')
  })

  it('treats unknown quantities as in stock', () => {
    expect(stockLevel({ available: true, quantityAvailable: null })).toBe('in')
  })
})

describe('variant helpers', () => {
  it('prefers the first available variant as default', () => {
    expect(defaultVariant(product)?.id).toBe('b1')
  })

  it('falls back to the first variant when nothing is available', () => {
    expect(defaultVariant({ variants: [white1m] })?.id).toBe('w1')
  })

  it('returns null for products without variants', () => {
    expect(defaultVariant({ variants: [] })).toBeNull()
  })

  it('finds a variant by full option selection', () => {
    expect(findVariant(product, { Kleur: 'Wit', Lengte: '2m' })?.id).toBe('w2')
    expect(findVariant(product, { Kleur: 'Zwart', Lengte: '2m' })).toBeNull()
  })

  it('builds a selection from a variant', () => {
    expect(selectionFromVariant(black1m)).toEqual({ Kleur: 'Zwart', Lengte: '1m' })
  })

  it('marks option values that only exist as sold out combinations as unavailable', () => {
    expect(isOptionValueAvailable(product, { Kleur: 'Wit', Lengte: '2m' }, 'Lengte', '1m')).toBe(false)
    expect(isOptionValueAvailable(product, { Kleur: 'Wit', Lengte: '1m' }, 'Lengte', '2m')).toBe(true)
  })
})
