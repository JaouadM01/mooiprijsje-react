export interface Money {
  /** Bedrag in centen, zodat er geen float-afrondingsfouten ontstaan. */
  readonly amount: number
  readonly currencyCode: string
}

export interface ShopImage {
  readonly url: string
  readonly altText: string | null
}

export interface SelectedOption {
  readonly name: string
  readonly value: string
}

export interface ProductOption {
  readonly name: string
  readonly values: readonly string[]
}

export interface ProductVariant {
  readonly id: string
  readonly title: string
  readonly available: boolean
  /** null = onbekend (niet bijgehouden of niet beschikbaar via de API). */
  readonly quantityAvailable: number | null
  readonly price: Money
  readonly compareAtPrice: Money | null
  readonly selectedOptions: readonly SelectedOption[]
  readonly image: ShopImage | null
}

export interface CollectionRef {
  readonly handle: string
  readonly title: string
}

/** Lichte productweergave voor kaarten en lijsten. */
export interface ProductSummary {
  readonly id: string
  readonly handle: string
  readonly title: string
  readonly productType: string
  readonly image: ShopImage | null
  readonly hoverImage: ShopImage | null
  readonly price: Money
  readonly compareAtPrice: Money | null
  readonly available: boolean
  readonly defaultVariantId: string | null
}

export interface Product {
  readonly id: string
  readonly handle: string
  readonly title: string
  readonly vendor: string
  readonly productType: string
  readonly descriptionHtml: string
  readonly shortDescriptionHtml: string | null
  readonly specificationsHtml: string | null
  readonly faqHtml: string | null
  readonly images: readonly ShopImage[]
  readonly options: readonly ProductOption[]
  readonly variants: readonly ProductVariant[]
  readonly collection: CollectionRef | null
}

export type CollectionSort =
  | 'manual'
  | 'price-ascending'
  | 'price-descending'
  | 'created-descending'
  | 'title-ascending'
  | 'title-descending'

export interface FilterValue {
  readonly id: string
  readonly label: string
  readonly count: number
  /** JSON-string in de vorm van Shopify's ProductFilter, bijv. {"productVendor":"Apple"}. */
  readonly input: string
}

export interface CollectionFilter {
  readonly id: string
  readonly label: string
  readonly type: 'LIST' | 'PRICE_RANGE'
  readonly values: readonly FilterValue[]
  /** Alleen bij PRICE_RANGE: hoogste prijs in euro's. */
  readonly priceRangeMax: number | null
}

export interface PageInfo {
  readonly hasNextPage: boolean
  readonly hasPreviousPage: boolean
  readonly startCursor: string | null
  readonly endCursor: string | null
}

export interface CollectionQuery {
  readonly handle: string
  readonly sort: CollectionSort
  /** Elke waarde is een JSON-string (zie FilterValue.input). */
  readonly filters: readonly string[]
  /** Prijsgrenzen in euro's. */
  readonly priceMin: number | null
  readonly priceMax: number | null
  readonly after: string | null
  readonly before: string | null
  readonly pageSize: number
}

export interface CollectionResult {
  readonly collection: {
    readonly handle: string
    readonly title: string
    readonly descriptionHtml: string
  }
  readonly products: readonly ProductSummary[]
  readonly filters: readonly CollectionFilter[]
  readonly pageInfo: PageInfo
  /** null = onbekend (Storefront API geeft dit niet altijd mee). */
  readonly totalCount: number | null
}

export interface SearchQuery {
  readonly term: string
  readonly after: string | null
  readonly before: string | null
  readonly pageSize: number
}

export interface SearchResult {
  readonly products: readonly ProductSummary[]
  readonly pageInfo: PageInfo
  readonly totalCount: number | null
}

export interface CartLine {
  readonly id: string
  readonly quantity: number
  readonly variantId: string
  readonly productHandle: string
  readonly productTitle: string
  readonly variantTitle: string | null
  readonly image: ShopImage | null
  readonly unitPrice: Money
  readonly total: Money
}

export interface Cart {
  readonly id: string
  /** null in demo-modus: er is dan geen echte afrekenpagina. */
  readonly checkoutUrl: string | null
  readonly totalQuantity: number
  readonly subtotal: Money
  readonly lines: readonly CartLine[]
}

export interface ContactMessage {
  readonly name: string
  readonly email: string
  readonly subject: string
  readonly message: string
}
