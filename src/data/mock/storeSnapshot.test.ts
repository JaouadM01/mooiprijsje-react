import { brandFor, STORE_COLLECTIONS, STORE_PRODUCTS } from './storeSnapshot'
import { createMockShopRepository } from './mockShopRepository'

describe('store snapshot (demo catalogue)', () => {
  it('turns every product into a sellable product with a photo and a price', () => {
    expect(STORE_PRODUCTS.length).toBeGreaterThan(40)
    for (const product of STORE_PRODUCTS) {
      expect(product.images[0]?.url).toMatch(/^https:\/\/cdn\.shopify\.com\//)
      expect(product.variants[0]?.price.amount).toBeGreaterThan(0)
      expect(product.variants[0]?.id).toMatch(/^gid:\/\/shopify\/ProductVariant\/\d+$/)
    }
  })

  it('only keeps a compare-at price when it is higher than the price', () => {
    for (const variant of STORE_PRODUCTS.flatMap((product) => product.variants)) {
      if (variant.compareAtPrice) expect(variant.compareAtPrice.amount).toBeGreaterThan(variant.price.amount)
    }
  })

  it('offers the four menu categories plus the spotlight and "all" collections', () => {
    const handles = STORE_COLLECTIONS.map((collection) => collection.handle)
    expect(handles).toEqual(['schermen', 'laadpoorten', 'accessoires', 'onderdelen', 'frontpage', 'all'])
    const known = new Set(STORE_PRODUCTS.map((product) => product.handle))
    for (const collection of STORE_COLLECTIONS) {
      expect(collection.productHandles.length).toBeGreaterThan(0)
      expect(collection.productHandles.every((handle) => known.has(handle))).toBe(true)
    }
  })

  it('files screens under Schermen and screen protectors under Accessoires', () => {
    const typeOf = (fragment: string) => STORE_PRODUCTS.find((product) => product.title.includes(fragment))?.productType
    expect(typeOf('Scherm voor iPhone 13')).toBe('Schermen')
    expect(typeOf('Privacy Screenprotector')).toBe('Accessoires')
    expect(typeOf('Dock Connector')).toBe('Laadpoorten')
    expect(typeOf('Batterij')).toBe('Onderdelen')
  })

  it('works with the demo repository, including search', async () => {
    const shop = createMockShopRepository({ products: STORE_PRODUCTS, collections: STORE_COLLECTIONS, latencyMs: 0 })
    const spotlight = await shop.getCollection({
      handle: 'frontpage',
      sort: 'manual',
      filters: [],
      priceMin: null,
      priceMax: null,
      after: null,
      before: null,
      pageSize: 8,
    })
    expect(spotlight?.products).toHaveLength(8)

    const found = await shop.searchProducts({ term: 'iphone 13', after: null, before: null, pageSize: 6 })
    expect(found.products.some((product) => product.title.includes('iPhone 13'))).toBe(true)
  })
})

describe('brandFor', () => {
  it('uses the brand at the start of the title', () => {
    expect(brandFor('NOVANL MagLock Wireless', 'mooiprijsje.nl')).toBe('NOVANL')
    expect(brandFor('Swissten X-Boom Bluetooth Speaker', 'mooiprijsje.nl')).toBe('Swissten')
  })

  it('falls back to the Shopify vendor', () => {
    expect(brandFor('Scherm voor iPhone 13', 'mooiprijsje.nl')).toBe('mooiprijsje.nl')
  })
})
