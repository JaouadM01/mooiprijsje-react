import type { AppConfig } from '@/types/config'
import { createFormsGateway } from './forms/formsGateways'
import { createMockCartRepository } from './mock/mockCartRepository'
import { createMockShopRepository } from './mock/mockShopRepository'
import type { Services } from './repositories'
import { createStorefrontClient } from './shopify/client'
import { createShopifyCartRepository } from './shopify/shopifyCartRepository'
import { createShopifyShopRepository } from './shopify/shopifyShopRepository'

/** Kiest op basis van de configuratie tussen de echte Shopify-winkel en de demo-data. */
export function createServices(config: AppConfig): Services {
  const { shopify } = config

  if (shopify === null) {
    return {
      shop: createMockShopRepository(),
      cart: createMockCartRepository(),
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
