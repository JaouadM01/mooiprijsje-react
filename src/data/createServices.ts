import type { AppConfig } from '@/types/config'
import { createFormsGateway } from './forms/formsGateways'
import { createMockCartRepository } from './mock/mockCartRepository'
import { createMockShopRepository } from './mock/mockShopRepository'
import { STORE_COLLECTIONS, STORE_PRODUCTS } from './mock/storeSnapshot'
import type { Services } from './repositories'
import { createStorefrontClient } from './shopify/client'
import { createShopifyCartRepository } from './shopify/shopifyCartRepository'
import { createShopifyShopRepository } from './shopify/shopifyShopRepository'

/** Kiest op basis van de configuratie tussen de echte Shopify-winkel en de demo-data. */
export function createServices(config: AppConfig): Services {
  const { shopify } = config

  if (shopify === null) {
    return {
      // Echte producten en foto's van mooiprijsje.nl, zodat de demo het eigen assortiment laat zien.
      shop: createMockShopRepository({ products: STORE_PRODUCTS, collections: STORE_COLLECTIONS }),
      cart: createMockCartRepository({ products: STORE_PRODUCTS, storageKey: 'mp-demo-cart' }),
      forms: createFormsGateway(config, 'demo'),
      meta: { isDemo: true, accountUrl: null },
    }
  }

  const client = createStorefrontClient(shopify)
  return {
    shop: createShopifyShopRepository(client, { readInventory: shopify.readInventory }),
    cart: createShopifyCartRepository(client),
    forms: createFormsGateway(config, 'unconfigured'),
    meta: { isDemo: false, accountUrl: `https://${shopify.storeDomain}/account` },
  }
}
