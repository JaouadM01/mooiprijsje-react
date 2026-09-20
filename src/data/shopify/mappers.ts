import { money, moneyFromDecimal } from '@/lib/money'
import { escapeHtml } from '@/lib/sanitize'
import type {
  Cart,
  CollectionFilter,
  CollectionQuery,
  CollectionSort,
  Money,
  PageInfo,
  Product,
  ProductSummary,
  ProductVariant,
  ShopImage,
} from '@/types/shop'

// ---- vormen van de API-antwoorden (alleen de velden die wij opvragen) ------

interface ApiMoney {
  readonly amount: string
  readonly currencyCode: string
}

interface ApiImage {
  readonly url: string
  readonly altText: string | null
}

export interface ApiProductCard {
  readonly id: string
  readonly handle: string
  readonly title: string
  readonly productType: string
  readonly featuredImage: ApiImage | null
  readonly images: { readonly nodes: readonly ApiImage[] }
  readonly variants: {
    readonly nodes: readonly {
      readonly id: string
      readonly availableForSale: boolean
      readonly price: ApiMoney
      readonly compareAtPrice: ApiMoney | null
    }[]
  }
}

interface ApiVariant {
  readonly id: string
  readonly title: string
  readonly availableForSale: boolean
  readonly quantityAvailable?: number | null
  readonly price: ApiMoney
  readonly compareAtPrice: ApiMoney | null
  readonly selectedOptions: readonly { readonly name: string; readonly value: string }[]
  readonly image: ApiImage | null
}

interface ApiMetafield {
  readonly value: string
}

export interface ApiProduct {
  readonly id: string
  readonly handle: string
  readonly title: string
  readonly vendor: string
  readonly productType: string
  readonly descriptionHtml: string
  readonly images: { readonly nodes: readonly ApiImage[] }
  readonly options: readonly { readonly name: string; readonly values: readonly string[] }[]
  readonly variants: { readonly nodes: readonly ApiVariant[] }
  readonly collections: { readonly nodes: readonly { readonly handle: string; readonly title: string }[] }
  readonly shortDescription: ApiMetafield | null
  readonly specifications: ApiMetafield | null
  readonly faq: ApiMetafield | null
}

export interface ApiPageInfo {
  readonly hasNextPage: boolean
  readonly hasPreviousPage: boolean
  readonly startCursor: string | null
  readonly endCursor: string | null
}

export interface ApiFilter {
  readonly id: string
  readonly label: string
  readonly type: string
  readonly values: readonly {
    readonly id: string
    readonly label: string
    readonly count: number
    readonly input: string
  }[]
}

export interface ApiCart {
  readonly id: string
  readonly checkoutUrl: string
  readonly totalQuantity: number
  readonly cost: { readonly subtotalAmount: ApiMoney }
  readonly lines: {
    readonly nodes: readonly {
      readonly id: string
      readonly quantity: number
      readonly cost: { readonly totalAmount: ApiMoney; readonly amountPerQuantity: ApiMoney }
      readonly merchandise: {
        readonly id: string
        readonly title: string
        readonly image: ApiImage | null
        readonly product: { readonly handle: string; readonly title: string }
      }
    }[]
  }
}

// ---- basisvormen ------------------------------------------------------------

export function mapMoney(value: ApiMoney): Money {
  return moneyFromDecimal(value.amount, value.currencyCode)
}

function mapImage(image: ApiImage | null | undefined): ShopImage | null {
  return image ? { url: image.url, altText: image.altText } : null
}

export function mapPageInfo(pageInfo: ApiPageInfo): PageInfo {
  return { ...pageInfo }
}

const DEFAULT_VARIANT_TITLE = 'Default Title'

// ---- producten -------------------------------------------------------------

export function mapProductCard(node: ApiProductCard): ProductSummary {
  const variant = node.variants.nodes.find((candidate) => candidate.availableForSale) ?? node.variants.nodes[0]
  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    productType: node.productType,
    image: mapImage(node.featuredImage) ?? mapImage(node.images.nodes[0]),
    hoverImage: mapImage(node.images.nodes[1]),
    price: variant ? mapMoney(variant.price) : money(0),
    compareAtPrice: variant?.compareAtPrice ? mapMoney(variant.compareAtPrice) : null,
    available: variant?.availableForSale ?? false,
    defaultVariantId: variant?.id ?? null,
  }
}

function mapVariant(variant: ApiVariant): ProductVariant {
  return {
    id: variant.id,
    title: variant.title,
    available: variant.availableForSale,
    quantityAvailable: variant.quantityAvailable ?? null,
    price: mapMoney(variant.price),
    compareAtPrice: variant.compareAtPrice ? mapMoney(variant.compareAtPrice) : null,
    selectedOptions: variant.selectedOptions.map(({ name, value }) => ({ name, value })),
    image: mapImage(variant.image),
  }
}

/** Eerste alinea van de beschrijving, als terugval voor de korte omschrijving. */
export function firstParagraphHtml(html: string): string | null {
  return /<p[\s>][\s\S]*?<\/p>/i.exec(html)?.[0] ?? null
}

export function mapProduct(node: ApiProduct): Product {
  const collection = node.collections.nodes[0]
  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    vendor: node.vendor,
    productType: node.productType,
    descriptionHtml: node.descriptionHtml,
    shortDescriptionHtml: metafieldToHtml(node.shortDescription?.value) ?? firstParagraphHtml(node.descriptionHtml),
    specificationsHtml: metafieldToHtml(node.specifications?.value),
    faqHtml: metafieldToHtml(node.faq?.value),
    images: node.images.nodes.map((image) => ({ url: image.url, altText: image.altText })),
    options: node.options.map((option) => ({ name: option.name, values: [...option.values] })),
    variants: node.variants.nodes.map(mapVariant),
    collection: collection ? { handle: collection.handle, title: collection.title } : null,
  }
}

// ---- metafields (tekst of Shopify rich text) ---------------------------------

interface RichTextNode {
  readonly type: string
  readonly value?: string
  readonly bold?: boolean
  readonly italic?: boolean
  readonly level?: number
  readonly listType?: string
  readonly url?: string
  readonly children?: readonly RichTextNode[]
}

function renderRichText(nodes: readonly RichTextNode[] | undefined): string {
  return (nodes ?? []).map(renderRichTextNode).join('')
}

function renderRichTextNode(node: RichTextNode): string {
  const inner = renderRichText(node.children)
  switch (node.type) {
    case 'paragraph':
      return `<p>${inner}</p>`
    case 'heading': {
      const level = Math.min(Math.max(node.level ?? 2, 1), 6)
      return `<h${level}>${inner}</h${level}>`
    }
    case 'list': {
      const tag = node.listType === 'ordered' ? 'ol' : 'ul'
      return `<${tag}>${inner}</${tag}>`
    }
    case 'list-item':
      return `<li>${inner}</li>`
    case 'link':
      return `<a href="${escapeHtml(node.url ?? '#')}">${inner}</a>`
    case 'text': {
      let text = escapeHtml(node.value ?? '')
      if (node.bold) text = `<strong>${text}</strong>`
      if (node.italic) text = `<em>${text}</em>`
      return text
    }
    default:
      return inner
  }
}

/**
 * Metafield-waarden zijn platte tekst, HTML of Shopify's rich-text JSON. Alles wordt naar
 * HTML omgezet; de uitvoer gaat bij het renderen nog door sanitizeHtml.
 */
export function metafieldToHtml(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  if (!trimmed) return null

  if (trimmed.startsWith('{')) {
    try {
      const document = JSON.parse(trimmed) as RichTextNode
      if (document.type === 'root') return renderRichText(document.children)
    } catch {
      // Geen geldige JSON: behandel het als gewone tekst.
    }
  }
  if (trimmed.startsWith('<')) return trimmed

  return trimmed
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
    .join('')
}

// ---- collecties en zoeken ----------------------------------------------------

export function mapFilters(filters: readonly ApiFilter[]): CollectionFilter[] {
  return filters
    .filter((filter) => filter.values.length > 0)
    .map((filter) =>
      filter.type === 'PRICE_RANGE'
        ? {
            id: filter.id,
            label: filter.label,
            type: 'PRICE_RANGE' as const,
            values: [],
            priceRangeMax: readPriceRangeMax(filter.values[0]?.input),
          }
        : {
            id: filter.id,
            label: filter.label,
            type: 'LIST' as const,
            priceRangeMax: null,
            values: filter.values.map(({ id, label, count, input }) => ({ id, label, count, input })),
          },
    )
}

function readPriceRangeMax(input: string | undefined): number | null {
  if (!input) return null
  try {
    const max = (JSON.parse(input) as { price?: { max?: unknown } }).price?.max
    return typeof max === 'number' && Number.isFinite(max) ? Math.ceil(max) : null
  } catch {
    return null
  }
}

interface SortArgs {
  readonly sortKey: string
  readonly reverse: boolean
}

export function collectionSortArgs(sort: CollectionSort, kind: 'collection' | 'all'): SortArgs {
  const created = kind === 'collection' ? 'CREATED' : 'CREATED_AT'
  const args: Record<CollectionSort, SortArgs> = {
    manual: { sortKey: kind === 'collection' ? 'COLLECTION_DEFAULT' : 'BEST_SELLING', reverse: false },
    'price-ascending': { sortKey: 'PRICE', reverse: false },
    'price-descending': { sortKey: 'PRICE', reverse: true },
    'created-descending': { sortKey: created, reverse: true },
    'title-ascending': { sortKey: 'TITLE', reverse: false },
    'title-descending': { sortKey: 'TITLE', reverse: true },
  }
  return args[sort]
}

/** Terugbladeren gebruikt last/before, vooruit first/after. */
export function pagingArgs(paging: Pick<CollectionQuery, 'after' | 'before' | 'pageSize'>): Record<string, unknown> {
  if (paging.before !== null && paging.after === null) return { last: paging.pageSize, before: paging.before }
  return { first: paging.pageSize, after: paging.after }
}

/** Zet de gevalideerde URL-filters en prijsgrenzen om naar Shopify's ProductFilter-lijst. */
export function toProductFilters(query: Pick<CollectionQuery, 'filters' | 'priceMin' | 'priceMax'>): unknown[] {
  const listFilters = query.filters.flatMap((raw): unknown[] => {
    try {
      return [JSON.parse(raw)]
    } catch {
      return []
    }
  })
  if (query.priceMin === null && query.priceMax === null) return listFilters

  const price = {
    ...(query.priceMin !== null ? { min: query.priceMin } : {}),
    ...(query.priceMax !== null ? { max: query.priceMax } : {}),
  }
  return [...listFilters, { price }]
}

// ---- winkelwagen -------------------------------------------------------------

/** De checkout-URL wordt aan window.location en een href gegeven; alleen https is toegestaan. */
function safeCheckoutUrl(raw: string): string | null {
  try {
    const url = new URL(raw)
    return url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

export function mapCart(cart: ApiCart): Cart {
  return {
    id: cart.id,
    checkoutUrl: safeCheckoutUrl(cart.checkoutUrl),
    totalQuantity: cart.totalQuantity,
    subtotal: mapMoney(cart.cost.subtotalAmount),
    lines: cart.lines.nodes.map((line) => ({
      id: line.id,
      quantity: line.quantity,
      variantId: line.merchandise.id,
      productHandle: line.merchandise.product.handle,
      productTitle: line.merchandise.product.title,
      variantTitle: line.merchandise.title === DEFAULT_VARIANT_TITLE ? null : line.merchandise.title,
      image: mapImage(line.merchandise.image),
      unitPrice: mapMoney(line.cost.amountPerQuantity),
      total: mapMoney(line.cost.totalAmount),
    })),
  }
}
