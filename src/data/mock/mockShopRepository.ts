import { centsToEuros, money } from '@/lib/money'
import { defaultVariant } from '@/lib/pricing'
import type {
  CollectionFilter,
  CollectionSort,
  PageInfo,
  Product,
  ProductSummary,
  SearchResult,
} from '@/types/shop'
import type { ShopRepository } from '../repositories'
import { MOCK_COLLECTIONS, MOCK_PRODUCTS, type MockCollection } from './catalog'

export interface MockShopOptions {
  readonly latencyMs?: number
  readonly products?: readonly Product[]
  readonly collections?: readonly MockCollection[]
}

const DEFAULT_LATENCY_MS = 150

export function toProductSummary(product: Product): ProductSummary {
  const variant = defaultVariant(product)
  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    productType: product.productType,
    image: product.images[0] ?? null,
    hoverImage: product.images[1] ?? null,
    price: variant?.price ?? money(0),
    compareAtPrice: variant?.compareAtPrice ?? null,
    available: variant?.available ?? false,
    defaultVariantId: variant?.id ?? null,
  }
}

function isAvailable(product: Product): boolean {
  return product.variants.some((variant) => variant.available)
}

function priceOf(product: Product): number {
  return toProductSummary(product).price.amount
}

// ---- filteren -------------------------------------------------------------

interface ParsedFilter {
  readonly group: string
  readonly matches: (product: Product) => boolean
}

function parseFilter(raw: string): ParsedFilter | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (typeof parsed !== 'object' || parsed === null) return null
  const record = parsed as Record<string, unknown>

  if (typeof record.available === 'boolean') {
    const wanted = record.available
    return { group: 'available', matches: (product) => isAvailable(product) === wanted }
  }
  if (typeof record.productVendor === 'string') {
    const wanted = record.productVendor
    return { group: 'productVendor', matches: (product) => product.vendor === wanted }
  }
  if (typeof record.productType === 'string') {
    const wanted = record.productType
    return { group: 'productType', matches: (product) => product.productType === wanted }
  }
  // tag en variantOption worden in de demo niet ondersteund en genegeerd.
  return null
}

/** Zelfde regels als Shopify: binnen een groep OF, tussen groepen EN. */
function applyFilters(products: readonly Product[], rawFilters: readonly string[]): Product[] {
  const groups = new Map<string, ParsedFilter[]>()
  for (const raw of rawFilters) {
    const filter = parseFilter(raw)
    if (filter) groups.set(filter.group, [...(groups.get(filter.group) ?? []), filter])
  }
  return products.filter((product) =>
    [...groups.values()].every((group) => group.some((filter) => filter.matches(product))),
  )
}

function applyPriceRange(products: readonly Product[], min: number | null, max: number | null): Product[] {
  return products.filter((product) => {
    const euros = centsToEuros(priceOf(product))
    return (min === null || euros >= min) && (max === null || euros <= max)
  })
}

function buildFilters(products: readonly Product[]): CollectionFilter[] {
  if (products.length === 0) return []

  const inStock = products.filter(isAvailable).length
  const vendorCounts = new Map<string, number>()
  for (const product of products) vendorCounts.set(product.vendor, (vendorCounts.get(product.vendor) ?? 0) + 1)

  return [
    {
      id: 'filter.v.availability',
      label: 'Beschikbaarheid',
      type: 'LIST',
      priceRangeMax: null,
      values: [
        { id: 'filter.v.availability.1', label: 'Op voorraad', count: inStock, input: '{"available":true}' },
        {
          id: 'filter.v.availability.0',
          label: 'Niet op voorraad',
          count: products.length - inStock,
          input: '{"available":false}',
        },
      ],
    },
    {
      id: 'filter.p.vendor',
      label: 'Merk',
      type: 'LIST',
      priceRangeMax: null,
      values: [...vendorCounts.entries()]
        .sort(([a], [b]) => a.localeCompare(b, 'nl'))
        .map(([vendor, count]) => ({
          id: `filter.p.vendor.${vendor}`,
          label: vendor,
          count,
          input: JSON.stringify({ productVendor: vendor }),
        })),
    },
    {
      id: 'filter.v.price',
      label: 'Prijs',
      type: 'PRICE_RANGE',
      values: [],
      priceRangeMax: Math.ceil(centsToEuros(Math.max(...products.map(priceOf)))),
    },
  ]
}

// ---- sorteren en bladeren -------------------------------------------------

function sortProducts(products: readonly Product[], sort: CollectionSort, catalog: readonly Product[]): Product[] {
  const rank = (product: Product) => catalog.indexOf(product)
  const comparators: Record<CollectionSort, (a: Product, b: Product) => number> = {
    manual: (a, b) => rank(a) - rank(b),
    'price-ascending': (a, b) => priceOf(a) - priceOf(b),
    'price-descending': (a, b) => priceOf(b) - priceOf(a),
    'created-descending': (a, b) => rank(b) - rank(a),
    'title-ascending': (a, b) => a.title.localeCompare(b.title, 'nl'),
    'title-descending': (a, b) => b.title.localeCompare(a.title, 'nl'),
  }
  return [...products].sort(comparators[sort])
}

function parseCursor(raw: string | null): number | null {
  if (raw === null) return null
  const value = Number.parseInt(raw, 10)
  return Number.isInteger(value) && value >= 0 ? value : null
}

interface PagingArgs {
  readonly after: string | null
  readonly before: string | null
  readonly pageSize: number
}

/** Cursor = index van het item in de gesorteerde lijst. */
export function paginate<T>(items: readonly T[], { after, before, pageSize }: PagingArgs): { page: T[]; pageInfo: PageInfo } {
  const afterIndex = parseCursor(after)
  const beforeIndex = parseCursor(before)

  let start = 0
  if (afterIndex !== null) start = afterIndex + 1
  else if (beforeIndex !== null) start = Math.max(0, Math.min(beforeIndex, items.length) - pageSize)

  const page = items.slice(start, start + pageSize)
  return {
    page,
    pageInfo: {
      hasPreviousPage: start > 0,
      hasNextPage: start + page.length < items.length,
      startCursor: page.length > 0 ? String(start) : null,
      endCursor: page.length > 0 ? String(start + page.length - 1) : null,
    },
  }
}

// ---- repository -----------------------------------------------------------

export function createMockShopRepository(options: MockShopOptions = {}): ShopRepository {
  const latencyMs = options.latencyMs ?? DEFAULT_LATENCY_MS
  const products = options.products ?? MOCK_PRODUCTS
  const collections = options.collections ?? MOCK_COLLECTIONS
  const byHandle = new Map(products.map((product) => [product.handle, product]))

  const wait = (): Promise<void> =>
    latencyMs > 0 ? new Promise((resolve) => setTimeout(resolve, latencyMs)) : Promise.resolve()

  return {
    async getCollection(query) {
      await wait()
      const collection = collections.find((candidate) => candidate.handle === query.handle)
      if (!collection) return null

      const base = collection.productHandles.flatMap((handle) => byHandle.get(handle) ?? [])
      const filtered = applyPriceRange(applyFilters(base, query.filters), query.priceMin, query.priceMax)
      const sorted = sortProducts(filtered, query.sort, products)
      const { page, pageInfo } = paginate(sorted, query)

      return {
        collection: {
          handle: collection.handle,
          title: collection.title,
          descriptionHtml: collection.descriptionHtml,
        },
        products: page.map(toProductSummary),
        filters: buildFilters(base),
        pageInfo,
        totalCount: filtered.length,
      }
    },

    async getProduct(handle) {
      await wait()
      return byHandle.get(handle) ?? null
    },

    async searchProducts(query): Promise<SearchResult> {
      await wait()
      const terms = query.term.toLowerCase().split(/\s+/).filter(Boolean)
      const matches =
        terms.length === 0
          ? []
          : products.filter((product) => {
              const haystack = `${product.title} ${product.vendor} ${product.productType}`.toLowerCase()
              return terms.every((term) => haystack.includes(term))
            })
      const { page, pageInfo } = paginate(matches, query)
      return { products: page.map(toProductSummary), pageInfo, totalCount: matches.length }
    },
  }
}
