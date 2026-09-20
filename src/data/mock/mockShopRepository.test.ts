import type { CollectionQuery } from '@/types/shop'
import { MOCK_PRODUCTS } from './catalog'
import { createMockShopRepository, paginate, toProductSummary } from './mockShopRepository'

const repo = createMockShopRepository({ latencyMs: 0 })

function query(overrides: Partial<CollectionQuery> = {}): CollectionQuery {
  return {
    handle: 'all',
    sort: 'manual',
    filters: [],
    priceMin: null,
    priceMax: null,
    after: null,
    before: null,
    pageSize: 24,
    ...overrides,
  }
}

describe('getCollection', () => {
  it('returns null for an unknown collection', async () => {
    expect(await repo.getCollection(query({ handle: 'bestaat-niet' }))).toBeNull()
  })

  it('returns only the products of the requested collection', async () => {
    const result = await repo.getCollection(query({ handle: 'schermen' }))
    expect(result?.collection.title).toBe('Schermen')
    expect(result?.products.length).toBeGreaterThan(0)
    expect(result?.products.every((product) => product.productType === 'Schermen')).toBe(true)
  })

  it('sorts by price ascending and descending', async () => {
    const asc = await repo.getCollection(query({ sort: 'price-ascending' }))
    const desc = await repo.getCollection(query({ sort: 'price-descending' }))
    const ascPrices = asc?.products.map((product) => product.price.amount) ?? []
    expect(ascPrices).toEqual([...ascPrices].sort((a, b) => a - b))
    expect(desc?.products.map((product) => product.price.amount)).toEqual([...ascPrices].reverse())
  })

  it('sorts by title', async () => {
    const result = await repo.getCollection(query({ sort: 'title-ascending' }))
    const titles = result?.products.map((product) => product.title) ?? []
    expect(titles).toEqual([...titles].sort((a, b) => a.localeCompare(b, 'nl')))
  })

  it('shows newest first for created-descending', async () => {
    const result = await repo.getCollection(query({ sort: 'created-descending' }))
    expect(result?.products[0]?.handle).toBe(MOCK_PRODUCTS.at(-1)?.handle)
  })

  it('filters by price range', async () => {
    const result = await repo.getCollection(query({ priceMin: 10, priceMax: 20 }))
    expect(result?.products.length).toBeGreaterThan(0)
    for (const product of result?.products ?? []) {
      expect(product.price.amount).toBeGreaterThanOrEqual(1000)
      expect(product.price.amount).toBeLessThanOrEqual(2000)
    }
  })

  it('ORs values within a filter group and ANDs across groups', async () => {
    const vendors = ['{"productVendor":"Apple"}', '{"productVendor":"Samsung"}']
    const either = await repo.getCollection(query({ filters: vendors }))
    const appleOnly = await repo.getCollection(query({ filters: [vendors[0] ?? ''] }))
    expect((either?.totalCount ?? 0)).toBeGreaterThan(appleOnly?.totalCount ?? 0)

    const inStockApple = await repo.getCollection(query({ filters: [vendors[0] ?? '', '{"available":true}'] }))
    expect(inStockApple?.products.every((product) => product.available)).toBe(true)
    expect(inStockApple?.totalCount).toBeLessThanOrEqual(appleOnly?.totalCount ?? 0)
  })

  it('ignores malformed or unsupported filters', async () => {
    const all = await repo.getCollection(query())
    const result = await repo.getCollection(query({ filters: ['nope', '{"tag":"x"}', '[]'] }))
    expect(result?.totalCount).toBe(all?.totalCount)
  })

  it('offers availability, brand and price filters', async () => {
    const result = await repo.getCollection(query({ handle: 'accessoires' }))
    expect(result?.filters.map((filter) => filter.label)).toEqual(['Beschikbaarheid', 'Merk', 'Prijs'])
    const price = result?.filters.find((filter) => filter.type === 'PRICE_RANGE')
    expect(price?.priceRangeMax).toBeGreaterThan(0)
  })

  it('pages forward and backward with cursors', async () => {
    const first = await repo.getCollection(query({ pageSize: 5 }))
    expect(first?.products).toHaveLength(5)
    expect(first?.pageInfo).toMatchObject({ hasPreviousPage: false, hasNextPage: true })

    const second = await repo.getCollection(query({ pageSize: 5, after: first?.pageInfo.endCursor ?? null }))
    expect(second?.products[0]?.handle).toBe(MOCK_PRODUCTS[5]?.handle)
    expect(second?.pageInfo.hasPreviousPage).toBe(true)

    const back = await repo.getCollection(query({ pageSize: 5, before: second?.pageInfo.startCursor ?? null }))
    expect(back?.products.map((p) => p.handle)).toEqual(first?.products.map((p) => p.handle))
  })
})

describe('paginate', () => {
  const items = [0, 1, 2, 3, 4, 5, 6]

  it('handles the last partial page', () => {
    const { page, pageInfo } = paginate(items, { after: '4', before: null, pageSize: 5 })
    expect(page).toEqual([5, 6])
    expect(pageInfo).toMatchObject({ hasNextPage: false, hasPreviousPage: true, startCursor: '5', endCursor: '6' })
  })

  it('ignores invalid cursors', () => {
    expect(paginate(items, { after: 'x', before: null, pageSize: 3 }).page).toEqual([0, 1, 2])
    expect(paginate(items, { after: '-2', before: null, pageSize: 3 }).page).toEqual([0, 1, 2])
  })

  it('returns empty cursors for an empty list', () => {
    expect(paginate([], { after: null, before: null, pageSize: 3 }).pageInfo).toEqual({
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    })
  })
})

describe('getProduct', () => {
  it('finds a product by handle', async () => {
    const product = await repo.getProduct('snellader-20w-usb-c')
    expect(product?.title).toBe('Snellader 20W USB-C')
    expect(product?.images).toHaveLength(3)
  })

  it('returns null for an unknown handle', async () => {
    expect(await repo.getProduct('nope')).toBeNull()
  })

  it('models variants with per-combination availability', async () => {
    const cable = await repo.getProduct('usb-c-kabel-gevlochten')
    expect(cable?.variants).toHaveLength(4)
    const whiteTwoMeter = cable?.variants.find((v) => v.title === 'Wit / 2m')
    expect(whiteTwoMeter?.available).toBe(false)
  })
})

describe('toProductSummary', () => {
  it('uses the first available variant and exposes sale data', async () => {
    const product = await repo.getProduct('iphone-13-oled-scherm')
    const summary = toProductSummary(product!)
    expect(summary.compareAtPrice?.amount).toBeGreaterThan(summary.price.amount)
    expect(summary.available).toBe(true)
    expect(summary.defaultVariantId).toBe(product?.variants[0]?.id)
  })

  it('marks sold-out products as unavailable', async () => {
    const product = await repo.getProduct('samsung-galaxy-a54-scherm')
    expect(toProductSummary(product!).available).toBe(false)
  })
})

describe('searchProducts', () => {
  const search = (term: string) => repo.searchProducts({ term, after: null, before: null, pageSize: 24 })

  it('matches all words across title, vendor and type', async () => {
    const result = await search('samsung batterij')
    expect(result.products.map((p) => p.handle)).toEqual(['batterij-samsung-galaxy-s21'])
    expect(result.totalCount).toBe(1)
  })

  it('is case-insensitive', async () => {
    expect((await search('IPHONE')).totalCount).toBeGreaterThan(0)
  })

  it('returns nothing for empty or unmatched terms', async () => {
    expect((await search('   ')).products).toEqual([])
    expect((await search('zzzz')).totalCount).toBe(0)
  })
})
