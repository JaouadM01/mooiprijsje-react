import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Breadcrumb, type Crumb } from '@/components/common/Breadcrumb'
import { ErrorState, LoadingState } from '@/components/common/StatusMessage'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductGallery } from '@/components/product/ProductGallery'
import { ProductInfo } from '@/components/product/ProductInfo'
import { ProductTabs } from '@/components/product/ProductTabs'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useCollection, useProduct } from '@/hooks/useShopData'
import type { CollectionQuery } from '@/types/shop'
import { NotFoundPage } from './NotFoundPage'
import '@/components/product/product.css'

const RELATED_FETCH_SIZE = 5
const RELATED_SHOWN = 4
const MAX_BREADCRUMB_TITLE = 50

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

export function ProductPage() {
  const { handle = '' } = useParams()
  const { data: product, isPending, isError, refetch } = useProduct(handle)
  useDocumentTitle(product?.title)

  const collectionHandle = product?.collection?.handle ?? null
  const relatedQuery = useMemo<CollectionQuery>(
    () => ({
      handle: collectionHandle ?? '',
      sort: 'manual',
      filters: [],
      priceMin: null,
      priceMax: null,
      after: null,
      before: null,
      pageSize: RELATED_FETCH_SIZE,
    }),
    [collectionHandle],
  )
  const related = useCollection(relatedQuery, { enabled: collectionHandle !== null })
  const relatedItems = collectionHandle === null ? [] : (related.data?.products ?? [])

  if (isPending) return <LoadingState label="Product laden…" />
  if (isError) return <ErrorState message="Het product kon niet worden geladen." onRetry={() => void refetch()} />
  if (product === null) return <NotFoundPage message="Dit product bestaat niet (meer)." />

  const relatedProducts = relatedItems.filter((item) => item.id !== product.id).slice(0, RELATED_SHOWN)
  const crumbs: Crumb[] = [
    { label: 'Thuis', to: '/' },
    ...(product.collection ? [{ label: product.collection.title, to: `/collections/${product.collection.handle}` }] : []),
    { label: truncate(product.title, MAX_BREADCRUMB_TITLE) },
  ]

  return (
    <section className="main-product">
      <Breadcrumb items={crumbs} />

      {/* key: bij een ander product beginnen selectie en aantal opnieuw */}
      <div className="product__grid" key={product.id}>
        <ProductGallery images={product.images} title={product.title} />
        <ProductInfo product={product} />
      </div>

      <ProductTabs key={`tabs-${product.id}`} product={product} />

      {relatedProducts.length > 0 && (
        <div className="product__related">
          <h2 className="product__related-title">Gerelateerde producten</h2>
          <div className="product__related-grid">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
