import type { ShopifyConfig } from '@/types/config'
import { ShopApiError } from '../errors'

export interface StorefrontClient {
  query<TData>(query: string, variables?: Readonly<Record<string, unknown>>): Promise<TData>
}

interface GraphQlResponse<TData> {
  readonly data?: TData | null
  readonly errors?: readonly { readonly message: string }[]
}

/**
 * Dunne fetch-wrapper rond de Storefront GraphQL API. Het token is een publiek
 * Storefront-token; het hoort in de browser en geeft alleen leesrechten op de winkel
 * plus het beheren van winkelwagens.
 */
export function createStorefrontClient(
  config: ShopifyConfig,
  fetchImpl: typeof fetch = (...args) => fetch(...args),
): StorefrontClient {
  const endpoint = `https://${config.storeDomain}/api/${config.apiVersion}/graphql.json`

  return {
    async query<TData>(query: string, variables: Readonly<Record<string, unknown>> = {}): Promise<TData> {
      let response: Response
      try {
        response = await fetchImpl(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Shopify-Storefront-Access-Token': config.storefrontToken,
          },
          body: JSON.stringify({ query, variables }),
        })
      } catch (cause) {
        throw new ShopApiError('Kan de winkel niet bereiken. Controleer je internetverbinding.', { cause })
      }

      if (!response.ok) {
        throw new ShopApiError(`De winkel gaf een fout terug (${response.status}).`, { status: response.status })
      }

      let payload: GraphQlResponse<TData>
      try {
        payload = (await response.json()) as GraphQlResponse<TData>
      } catch (cause) {
        throw new ShopApiError('Onverwacht antwoord van de winkel.', { cause })
      }

      // De ruwe GraphQL-tekst is Engels en kan veld- of variabelenamen bevatten: bewaar hem alleen als oorzaak.
      if (payload.errors?.[0]) {
        throw new ShopApiError('De winkel kon dit verzoek niet verwerken. Probeer het later opnieuw.', {
          status: response.status,
          cause: payload.errors,
        })
      }
      if (payload.data === undefined || payload.data === null) {
        throw new ShopApiError('De winkel gaf geen gegevens terug.', { status: response.status })
      }
      return payload.data
    },
  }
}
