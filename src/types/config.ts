export interface ShopifyConfig {
  readonly storeDomain: string
  readonly storefrontToken: string
  readonly apiVersion: string
  /**
   * Vraag voorraadaantallen op (voor "Laag op voorraad: nog X stuks"). Vereist de scope
   * `unauthenticated_read_product_inventory`; zonder die scope faalt de hele productquery.
   */
  readonly readInventory: boolean
}

export interface AppConfig {
  /** null = demo-modus met voorbeelddata. */
  readonly shopify: ShopifyConfig | null
  readonly newsletterEndpoint: string | null
  readonly contactEndpoint: string | null
}
