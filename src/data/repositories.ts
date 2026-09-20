import type {
  Cart,
  CollectionQuery,
  CollectionResult,
  ContactMessage,
  Product,
  SearchQuery,
  SearchResult,
} from '@/types/shop'

export const MAX_LINE_QUANTITY = 99

export interface ShopRepository {
  /** null = collectie bestaat niet. */
  getCollection(query: CollectionQuery): Promise<CollectionResult | null>
  /** null = product bestaat niet. */
  getProduct(handle: string): Promise<Product | null>
  searchProducts(query: SearchQuery): Promise<SearchResult>
}

export interface CartRepository {
  /** null = winkelwagen bestaat niet (meer), bijvoorbeeld verlopen. */
  getCart(cartId: string): Promise<Cart | null>
  /** cartId null maakt een nieuwe winkelwagen aan. */
  addLine(cartId: string | null, variantId: string, quantity: number): Promise<Cart>
  updateLine(cartId: string, lineId: string, quantity: number): Promise<Cart>
  removeLine(cartId: string, lineId: string): Promise<Cart>
}

export interface FormsGateway {
  subscribeNewsletter(email: string): Promise<void>
  sendContactMessage(message: ContactMessage): Promise<void>
}

export interface ServicesMeta {
  readonly isDemo: boolean
  /** Link naar het klantaccount op de Shopify-winkel; null = geen account-link tonen. */
  readonly accountUrl: string | null
}

export interface Services {
  readonly shop: ShopRepository
  readonly cart: CartRepository
  readonly forms: FormsGateway
  readonly meta: ServicesMeta
}
