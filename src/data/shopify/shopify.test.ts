import { ShopApiError } from '../errors'
import { createStorefrontClient, type StorefrontClient } from './client'
import {
  collectionSortArgs,
  firstParagraphHtml,
  mapCart,
  mapFilters,
  mapProduct,
  mapProductCard,
  metafieldToHtml,
  pagingArgs,
  toProductFilters,
  type ApiCart,
  type ApiProduct,
  type ApiProductCard,
} from './mappers'
import { createShopifyCartRepository } from './shopifyCartRepository'
import { createShopifyShopRepository } from './shopifyShopRepository'

const config = { storeDomain: 'shop.myshopify.com', storefrontToken: 'tok', apiVersion: '2025-07', readInventory: false }
const eur = (amount: string) => ({ amount, currencyCode: 'EUR' })

const card: ApiProductCard = {
  id: 'gid://shopify/Product/1',
  handle: 'kabel',
  title: 'Kabel',
  productType: 'Accessoires',
  featuredImage: { url: 'https://cdn/1.jpg', altText: 'een' },
  images: { nodes: [{ url: 'https://cdn/1.jpg', altText: 'een' }, { url: 'https://cdn/2.jpg', altText: null }] },
  variants: {
    nodes: [
      { id: 'v1', availableForSale: false, price: eur('5.00'), compareAtPrice: null },
      { id: 'v2', availableForSale: true, price: eur('7.99'), compareAtPrice: eur('9.99') },
    ],
  },
}

function stubClient(response: unknown): StorefrontClient & { calls: { query: string; variables: unknown }[] } {
  const calls: { query: string; variables: unknown }[] = []
  return {
    calls,
    query: async <T>(query: string, variables?: unknown) => {
      calls.push({ query, variables })
      return response as T
    },
  }
}

describe('createStorefrontClient', () => {
  it('posts the query with the token to the versioned endpoint', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ data: { ok: true } }), { status: 200 }),
    )
    const data = await createStorefrontClient(config, fetchImpl).query<{ ok: boolean }>('query { x }', { a: 1 })

    expect(data).toEqual({ ok: true })
    const [url, init] = fetchImpl.mock.calls[0]!
    expect(url).toBe('https://shop.myshopify.com/api/2025-07/graphql.json')
    expect((init?.headers as Record<string, string>)['X-Shopify-Storefront-Access-Token']).toBe('tok')
    expect(JSON.parse(init?.body as string)).toEqual({ query: 'query { x }', variables: { a: 1 } })
  })

  it.each([
    ['network failure', () => Promise.reject(new TypeError('offline')), /niet bereiken/],
    ['http error', () => Promise.resolve(new Response('', { status: 503 })), /503/],
    ['invalid json', () => Promise.resolve(new Response('<html>', { status: 200 })), /Onverwacht/],
    ['graphql errors', () => Promise.resolve(new Response(JSON.stringify({ errors: [{ message: 'Boom' }] }))), /niet verwerken/],
    ['missing data', () => Promise.resolve(new Response(JSON.stringify({}))), /geen gegevens/],
  ])('throws a ShopApiError on %s', async (_name, respond, message) => {
    const client = createStorefrontClient(config, vi.fn<typeof fetch>().mockImplementation(respond))
    const error = await client.query('query { x }').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ShopApiError)
    expect((error as Error).message).toMatch(message)
  })

  it('does not expose raw GraphQL error text to users', async () => {
    const respond = () => Promise.resolve(new Response(JSON.stringify({ errors: [{ message: 'Field x on ProductVariant' }] })))
    const client = createStorefrontClient(config, vi.fn<typeof fetch>().mockImplementation(respond))
    const error = (await client.query('query { x }').catch((e: unknown) => e)) as ShopApiError
    expect(error.message).not.toContain('ProductVariant')
    expect(error.cause).toEqual([{ message: 'Field x on ProductVariant' }])
  })
})

describe('mappers', () => {
  it('maps a product card using the first available variant', () => {
    expect(mapProductCard(card)).toMatchObject({
      handle: 'kabel',
      price: { amount: 799, currencyCode: 'EUR' },
      compareAtPrice: { amount: 999 },
      available: true,
      defaultVariantId: 'v2',
      image: { url: 'https://cdn/1.jpg' },
      hoverImage: { url: 'https://cdn/2.jpg' },
    })
  })

  it('handles cards without variants or images', () => {
    const empty = mapProductCard({ ...card, featuredImage: null, images: { nodes: [] }, variants: { nodes: [] } })
    expect(empty).toMatchObject({ image: null, hoverImage: null, available: false, defaultVariantId: null })
  })

  it('maps a full product including inventory, metafields and collection', () => {
    const node: ApiProduct = {
      id: 'p',
      handle: 'h',
      title: 'T',
      vendor: 'V',
      productType: 'Type',
      descriptionHtml: '<p>Eerste</p><p>Tweede</p>',
      images: { nodes: [{ url: 'u', altText: null }] },
      options: [{ name: 'Kleur', values: ['Zwart'] }],
      variants: {
        nodes: [
          {
            id: 'v',
            title: 'Zwart',
            availableForSale: true,
            quantityAvailable: 3,
            price: eur('1.50'),
            compareAtPrice: null,
            selectedOptions: [{ name: 'Kleur', value: 'Zwart' }],
            image: null,
          },
        ],
      },
      collections: { nodes: [{ handle: 'accessoires', title: 'Accessoires' }] },
      shortDescription: null,
      specifications: { value: 'Gewicht: 10g' },
      faq: null,
    }
    const product = mapProduct(node)
    expect(product.shortDescriptionHtml).toBe('<p>Eerste</p>')
    expect(product.specificationsHtml).toBe('<p>Gewicht: 10g</p>')
    expect(product.faqHtml).toBeNull()
    expect(product.variants[0]).toMatchObject({ quantityAvailable: 3, price: { amount: 150 } })
    expect(product.collection).toEqual({ handle: 'accessoires', title: 'Accessoires' })
  })

  it('treats a missing quantityAvailable as unknown', () => {
    const node = { variants: { nodes: [{ id: 'v', title: 't', availableForSale: true, price: eur('1'), compareAtPrice: null, selectedOptions: [], image: null }] } }
    const product = mapProduct({ ...node, id: 'p', handle: 'h', title: 'T', vendor: '', productType: '', descriptionHtml: '', images: { nodes: [] }, options: [], collections: { nodes: [] }, shortDescription: null, specifications: null, faq: null })
    expect(product.variants[0]?.quantityAvailable).toBeNull()
    expect(product.collection).toBeNull()
  })

  it('extracts the first paragraph', () => {
    expect(firstParagraphHtml('<h2>x</h2><p class="a">Hoi</p>')).toBe('<p class="a">Hoi</p>')
    expect(firstParagraphHtml('geen alinea')).toBeNull()
  })

  it.each([['javascript:alert(1)'], ['http://shop.example/checkout'], ['niet een url']])(
    'drops the unsafe checkout url %s',
    (checkoutUrl) => {
      const api: ApiCart = {
        id: 'c',
        checkoutUrl,
        totalQuantity: 0,
        cost: { subtotalAmount: eur('0.00') },
        lines: { nodes: [] },
      }
      expect(mapCart(api).checkoutUrl).toBeNull()
    },
  )

  it('maps carts, hiding the default variant title', () => {
    const api: ApiCart = {
      id: 'gid://shopify/Cart/1',
      checkoutUrl: 'https://shop/checkout/abc',
      totalQuantity: 2,
      cost: { subtotalAmount: eur('15.98') },
      lines: {
        nodes: [
          {
            id: 'l1',
            quantity: 2,
            cost: { totalAmount: eur('15.98'), amountPerQuantity: eur('7.99') },
            merchandise: { id: 'v2', title: 'Default Title', image: null, product: { handle: 'kabel', title: 'Kabel' } },
          },
        ],
      },
    }
    const cart = mapCart(api)
    expect(cart).toMatchObject({ checkoutUrl: 'https://shop/checkout/abc', subtotal: { amount: 1598 } })
    expect(cart.lines[0]).toMatchObject({ variantTitle: null, unitPrice: { amount: 799 }, total: { amount: 1598 } })
  })
})

describe('metafieldToHtml', () => {
  it('returns null for empty values', () => {
    expect(metafieldToHtml(undefined)).toBeNull()
    expect(metafieldToHtml('   ')).toBeNull()
  })

  it('escapes plain text and keeps line breaks', () => {
    expect(metafieldToHtml('a <b>\nregel 2\n\nnieuwe alinea')).toBe('<p>a &lt;b&gt;<br>regel 2</p><p>nieuwe alinea</p>')
  })

  it('passes HTML through', () => {
    expect(metafieldToHtml('<ul><li>x</li></ul>')).toBe('<ul><li>x</li></ul>')
  })

  it('converts rich text JSON', () => {
    const doc = {
      type: 'root',
      children: [
        { type: 'heading', level: 3, children: [{ type: 'text', value: 'Kop' }] },
        { type: 'paragraph', children: [{ type: 'text', value: 'Vet & schuin', bold: true, italic: true }] },
        { type: 'list', listType: 'ordered', children: [{ type: 'list-item', children: [{ type: 'text', value: 'een' }] }] },
        { type: 'paragraph', children: [{ type: 'link', url: 'https://x.nl?a="1"', children: [{ type: 'text', value: 'link' }] }] },
      ],
    }
    expect(metafieldToHtml(JSON.stringify(doc))).toBe(
      '<h3>Kop</h3><p><em><strong>Vet &amp; schuin</strong></em></p><ol><li>een</li></ol><p><a href="https://x.nl?a=&quot;1&quot;">link</a></p>',
    )
  })

  it('falls back to text for invalid JSON', () => {
    expect(metafieldToHtml('{kapot')).toBe('<p>{kapot</p>')
  })
})

describe('query argument helpers', () => {
  it('maps sorts differently for collections and the all-products list', () => {
    expect(collectionSortArgs('manual', 'collection')).toEqual({ sortKey: 'COLLECTION_DEFAULT', reverse: false })
    expect(collectionSortArgs('manual', 'all')).toEqual({ sortKey: 'BEST_SELLING', reverse: false })
    expect(collectionSortArgs('created-descending', 'collection').sortKey).toBe('CREATED')
    expect(collectionSortArgs('created-descending', 'all').sortKey).toBe('CREATED_AT')
    expect(collectionSortArgs('price-descending', 'all')).toEqual({ sortKey: 'PRICE', reverse: true })
  })

  it('pages backwards only with a before cursor', () => {
    expect(pagingArgs({ after: null, before: null, pageSize: 24 })).toEqual({ first: 24, after: null })
    expect(pagingArgs({ after: 'a', before: null, pageSize: 24 })).toEqual({ first: 24, after: 'a' })
    expect(pagingArgs({ after: null, before: 'b', pageSize: 24 })).toEqual({ last: 24, before: 'b' })
  })

  it('builds product filters including the price range', () => {
    expect(toProductFilters({ filters: ['{"available":true}', 'kapot'], priceMin: null, priceMax: null })).toEqual([
      { available: true },
    ])
    expect(toProductFilters({ filters: [], priceMin: 5, priceMax: null })).toEqual([{ price: { min: 5 } }])
    expect(toProductFilters({ filters: [], priceMin: 5, priceMax: 20 })).toEqual([{ price: { min: 5, max: 20 } }])
  })

  it('maps filters, dropping empty ones and reading the price maximum', () => {
    const filters = mapFilters([
      { id: 'a', label: 'Merk', type: 'LIST', values: [{ id: 'a.1', label: 'Apple', count: 3, input: '{"productVendor":"Apple"}' }] },
      { id: 'b', label: 'Leeg', type: 'LIST', values: [] },
      { id: 'c', label: 'Prijs', type: 'PRICE_RANGE', values: [{ id: 'c.1', label: '', count: 0, input: '{"price":{"min":0,"max":149.5}}' }] },
      { id: 'd', label: 'Aan', type: 'BOOLEAN', values: [{ id: 'd.1', label: 'Ja', count: 1, input: '{"available":true}' }] },
    ])
    expect(filters.map((f) => [f.label, f.type])).toEqual([['Merk', 'LIST'], ['Prijs', 'PRICE_RANGE'], ['Aan', 'LIST']])
    expect(filters[1]?.priceRangeMax).toBe(150)
  })
})

describe('Shopify shop repository', () => {
  const page = { hasNextPage: true, hasPreviousPage: false, startCursor: 's', endCursor: 'e' }
  const query = { handle: 'schermen', sort: 'price-ascending' as const, filters: [], priceMin: 5, priceMax: null, after: null, before: null, pageSize: 12 }

  it('fetches a collection with sorting, paging and filters', async () => {
    const client = stubClient({
      collection: { handle: 'schermen', title: 'Schermen', descriptionHtml: '', products: { nodes: [card], pageInfo: page, filters: [] } },
    })
    const result = await createShopifyShopRepository(client, { readInventory: false }).getCollection(query)

    expect(result?.products[0]?.handle).toBe('kabel')
    expect(result?.pageInfo).toEqual(page)
    expect(client.calls[0]?.variables).toMatchObject({
      handle: 'schermen',
      first: 12,
      sortKey: 'PRICE',
      reverse: false,
      filters: [{ price: { min: 5 } }],
    })
  })

  it('returns null for an unknown collection', async () => {
    const client = stubClient({ collection: null })
    expect(await createShopifyShopRepository(client, { readInventory: false }).getCollection(query)).toBeNull()
  })

  it('uses the products query for the all collection', async () => {
    const client = stubClient({ products: { nodes: [card], pageInfo: page } })
    const result = await createShopifyShopRepository(client, { readInventory: false }).getCollection({ ...query, handle: 'all', sort: 'manual' })
    expect(result?.collection.title).toBe('Alle producten')
    expect(client.calls[0]?.query).toContain('query AllProducts')
    expect(client.calls[0]?.variables).toMatchObject({ sortKey: 'BEST_SELLING' })
  })

  it('requests inventory only when enabled', async () => {
    const product = { product: null }
    const without = stubClient(product)
    const withInventory = stubClient(product)
    await createShopifyShopRepository(without, { readInventory: false }).getProduct('x')
    await createShopifyShopRepository(withInventory, { readInventory: true }).getProduct('x')
    expect(without.calls[0]?.query).not.toContain('quantityAvailable')
    expect(withInventory.calls[0]?.query).toContain('quantityAvailable')
  })

  it('returns null for an unknown product', async () => {
    const client = stubClient({ product: null })
    expect(await createShopifyShopRepository(client, { readInventory: false }).getProduct('x')).toBeNull()
  })

  it('searches and skips non-product results', async () => {
    const client = stubClient({ search: { totalCount: 1, nodes: [card, {}], pageInfo: page } })
    const result = await createShopifyShopRepository(client, { readInventory: false }).searchProducts({
      term: 'kabel',
      after: null,
      before: 'b',
      pageSize: 10,
    })
    expect(result.products).toHaveLength(1)
    expect(result.totalCount).toBe(1)
    expect(client.calls[0]?.variables).toMatchObject({ term: 'kabel', last: 10, before: 'b' })
  })
})

describe('Shopify cart repository', () => {
  const apiCart: ApiCart = {
    id: 'c1',
    checkoutUrl: 'https://shop/checkout',
    totalQuantity: 1,
    cost: { subtotalAmount: eur('5.00') },
    lines: { nodes: [] },
  }
  const payload = (key: string, overrides: object = {}) => ({ [key]: { cart: apiCart, userErrors: [], ...overrides } })

  it('creates a cart when there is no id yet', async () => {
    const client = stubClient(payload('cartCreate'))
    const cart = await createShopifyCartRepository(client).addLine(null, 'v1', 2)
    expect(cart.id).toBe('c1')
    expect(client.calls[0]?.query).toContain('mutation CartCreate')
    expect(client.calls[0]?.variables).toEqual({ lines: [{ merchandiseId: 'v1', quantity: 2 }] })
  })

  it('adds to an existing cart', async () => {
    const client = stubClient(payload('cartLinesAdd'))
    await createShopifyCartRepository(client).addLine('c1', 'v1', 1)
    expect(client.calls[0]?.variables).toMatchObject({ cartId: 'c1' })
  })

  it('removes the line when the new quantity is zero', async () => {
    const client = stubClient(payload('cartLinesRemove'))
    await createShopifyCartRepository(client).updateLine('c1', 'l1', 0)
    expect(client.calls[0]?.query).toContain('mutation CartLinesRemove')
    expect(client.calls[0]?.variables).toEqual({ cartId: 'c1', lineIds: ['l1'] })
  })

  it('updates line quantities', async () => {
    const client = stubClient(payload('cartLinesUpdate'))
    await createShopifyCartRepository(client).updateLine('c1', 'l1', 4)
    expect(client.calls[0]?.variables).toEqual({ cartId: 'c1', lines: [{ id: 'l1', quantity: 4 }] })
  })

  it('surfaces user errors and missing carts', async () => {
    const withError = stubClient(payload('cartLinesAdd', { userErrors: [{ message: 'Niet op voorraad' }] }))
    await expect(createShopifyCartRepository(withError).addLine('c1', 'v', 1)).rejects.toThrow('Niet op voorraad')

    const noCart = stubClient(payload('cartLinesAdd', { cart: null }))
    await expect(createShopifyCartRepository(noCart).addLine('c1', 'v', 1)).rejects.toBeInstanceOf(ShopApiError)
  })

  it('returns null when the cart has expired', async () => {
    const id = 'gid://shopify/Cart/abc123?key=k-1'
    expect(await createShopifyCartRepository(stubClient({ cart: null })).getCart(id)).toBeNull()
    expect((await createShopifyCartRepository(stubClient({ cart: apiCart })).getCart(id))?.id).toBe('c1')
  })

  it('does not query Shopify for a malformed stored cart id', async () => {
    const client = stubClient({ cart: apiCart })
    for (const id of ['c1', '', 'gid://shopify/Product/1', 'gid://shopify/Cart/a b', '{"x":1}']) {
      expect(await createShopifyCartRepository(client).getCart(id)).toBeNull()
    }
    expect(client.calls).toHaveLength(0)
  })
})
