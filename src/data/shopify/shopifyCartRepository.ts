import type { Cart } from '@/types/shop'
import { ShopApiError } from '../errors'
import type { CartRepository } from '../repositories'
import type { StorefrontClient } from './client'
import { mapCart, type ApiCart } from './mappers'
import {
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_QUERY,
} from './queries'

const CART_ID_PATTERN = /^gid:\/\/shopify\/Cart\/[\w-]+(\?key=[\w-]+)?$/

interface CartPayload {
  readonly cart: ApiCart | null
  readonly userErrors: readonly { readonly message: string }[]
}

function unwrap(payload: CartPayload): Cart {
  const firstError = payload.userErrors[0]
  if (firstError) throw new ShopApiError(firstError.message)
  if (payload.cart === null) throw new ShopApiError('De winkelwagen kon niet worden bijgewerkt.')
  return mapCart(payload.cart)
}

export function createShopifyCartRepository(client: StorefrontClient): CartRepository {
  const removeLine: CartRepository['removeLine'] = async (cartId, lineId) => {
    const data = await client.query<{ cartLinesRemove: CartPayload }>(CART_LINES_REMOVE_MUTATION, {
      cartId,
      lineIds: [lineId],
    })
    return unwrap(data.cartLinesRemove)
  }

  return {
    async getCart(cartId) {
      // Een id uit localStorage kan verlopen of aangepast zijn; dan geen verzoek doen en opnieuw beginnen.
      if (!CART_ID_PATTERN.test(cartId)) return null
      const data = await client.query<{ cart: ApiCart | null }>(CART_QUERY, { id: cartId })
      return data.cart === null ? null : mapCart(data.cart)
    },

    async addLine(cartId, variantId, quantity) {
      const lines = [{ merchandiseId: variantId, quantity }]
      if (cartId === null) {
        const data = await client.query<{ cartCreate: CartPayload }>(CART_CREATE_MUTATION, { lines })
        return unwrap(data.cartCreate)
      }
      const data = await client.query<{ cartLinesAdd: CartPayload }>(CART_LINES_ADD_MUTATION, { cartId, lines })
      return unwrap(data.cartLinesAdd)
    },

    async updateLine(cartId, lineId, quantity) {
      if (quantity <= 0) return removeLine(cartId, lineId)
      const data = await client.query<{ cartLinesUpdate: CartPayload }>(CART_LINES_UPDATE_MUTATION, {
        cartId,
        lines: [{ id: lineId, quantity }],
      })
      return unwrap(data.cartLinesUpdate)
    },

    removeLine,
  }
}
