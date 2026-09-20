import { Link } from 'react-router-dom'
import { FEATURED } from '@/config/home'
import { useCollection } from '@/hooks/useShopData'
import type { CollectionQuery } from '@/types/shop'
import { Icon } from '../common/Icon'
import { ErrorState } from '../common/StatusMessage'
import { ProductCard } from '../product/ProductCard'
import './home.css'

const FEATURED_QUERY: CollectionQuery = {
  handle: FEATURED.collectionHandle,
  sort: 'manual',
  filters: [],
  priceMin: null,
  priceMax: null,
  after: null,
  before: null,
  pageSize: FEATURED.limit,
}

export function ProductGridSkeleton({ count }: { readonly count: number }) {
  return (
    <div className="product-grid" role="status" aria-busy="true">
      <span className="sr-only">Producten laden…</span>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="product-card-skeleton">
          <div className="skeleton product-card-skeleton__image" />
          <div className="skeleton product-card-skeleton__line" />
          <div className="skeleton product-card-skeleton__line product-card-skeleton__line--short" />
        </div>
      ))}
    </div>
  )
}

export function FeaturedProducts() {
  const { data, isPending, isError, refetch } = useCollection(FEATURED_QUERY)
  const products = data?.products ?? []

  return (
    <section className="featured-products" aria-labelledby="featured-title">
      <div className="featured-products__container">
        <div className="featured-products__header">
          <div>
            <h2 id="featured-title" className="featured-products__title">
              {FEATURED.title}
            </h2>
            <p className="featured-products__subtitle">{FEATURED.subtitle}</p>
          </div>
          <Link to={FEATURED.ctaTo} className="featured-products__header-cta">
            {FEATURED.ctaLabel}
            <Icon name="arrow-right" size={18} strokeWidth={2.5} />
          </Link>
        </div>

        {isPending && <ProductGridSkeleton count={FEATURED.limit} />}
        {isError && <ErrorState message="De bestsellers konden niet worden geladen." onRetry={() => void refetch()} />}
        {!isPending && !isError && products.length === 0 && (
          <p className="featured-products__empty">Er zijn nog geen uitgelichte producten.</p>
        )}
        {products.length > 0 && (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
