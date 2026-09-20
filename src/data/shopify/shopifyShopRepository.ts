import type { ShopRepository } from '../repositories'
import type { StorefrontClient } from './client'
import {
  collectionSortArgs,
  mapFilters,
  mapPageInfo,
  mapProduct,
  mapProductCard,
  pagingArgs,
  toProductFilters,
  type ApiFilter,
  type ApiPageInfo,
  type ApiProduct,
  type ApiProductCard,
} from './mappers'
import { ALL_PRODUCTS_QUERY, buildProductQuery, COLLECTION_QUERY, SEARCH_QUERY } from './queries'

const ALL_HANDLE = 'all'

interface CollectionData {
  readonly collection: {
    readonly handle: string
    readonly title: string
    readonly descriptionHtml: string
    readonly products: {
      readonly nodes: readonly ApiProductCard[]
      readonly pageInfo: ApiPageInfo
      readonly filters: readonly ApiFilter[]
    }
  } | null
}

interface AllProductsData {
  readonly products: { readonly nodes: readonly ApiProductCard[]; readonly pageInfo: ApiPageInfo }
}

interface SearchData {
  readonly search: {
    readonly totalCount: number
    readonly nodes: readonly Partial<ApiProductCard>[]
    readonly pageInfo: ApiPageInfo
  }
}

interface ProductData {
  readonly product: ApiProduct | null
}

/** Zoekresultaten kunnen ook niet-producten bevatten; die slaan we over. */
function isProductCard(node: Partial<ApiProductCard>): node is ApiProductCard {
  return typeof node.id === 'string' && node.variants !== undefined
}

export function createShopifyShopRepository(
  client: StorefrontClient,
  options: { readonly readInventory: boolean },
): ShopRepository {
  const productQuery = buildProductQuery(options.readInventory)

  return {
    async getCollection(query) {
      if (query.handle === ALL_HANDLE) {
        const data = await client.query<AllProductsData>(ALL_PRODUCTS_QUERY, {
          ...pagingArgs(query),
          ...collectionSortArgs(query.sort, 'all'),
        })
        return {
          collection: { handle: ALL_HANDLE, title: 'Alle producten', descriptionHtml: '' },
          products: data.products.nodes.map(mapProductCard),
          filters: [],
          pageInfo: mapPageInfo(data.products.pageInfo),
          totalCount: null,
        }
      }

      const data = await client.query<CollectionData>(COLLECTION_QUERY, {
        handle: query.handle,
        ...pagingArgs(query),
        ...collectionSortArgs(query.sort, 'collection'),
        filters: toProductFilters(query),
      })
      const collection = data.collection
      if (collection === null) return null

      return {
        collection: {
          handle: collection.handle,
          title: collection.title,
          descriptionHtml: collection.descriptionHtml,
        },
        products: collection.products.nodes.map(mapProductCard),
        filters: mapFilters(collection.products.filters),
        pageInfo: mapPageInfo(collection.products.pageInfo),
        totalCount: null,
      }
    },

    async getProduct(handle) {
      const data = await client.query<ProductData>(productQuery, { handle })
      return data.product === null ? null : mapProduct(data.product)
    },

    async searchProducts(query) {
      const data = await client.query<SearchData>(SEARCH_QUERY, { term: query.term, ...pagingArgs(query) })
      return {
        products: data.search.nodes.filter(isProductCard).map(mapProductCard),
        pageInfo: mapPageInfo(data.search.pageInfo),
        totalCount: data.search.totalCount,
      }
    },
  }
}
