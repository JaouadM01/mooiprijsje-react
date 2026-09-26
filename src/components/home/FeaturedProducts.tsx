import { Link } from 'react-router-dom'
import type { ProductRail } from '@/config/home'
import { useCollection } from '@/hooks/useShopData'
import type { CollectionQuery } from '@/types/shop'
import { Icon } from '../common/Icon'
import { ErrorState } from '../common/StatusMessage'
import { ProductCard } from '../product/ProductCard'
import './home.css'

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

interface FeaturedProductsProps {
  readonly rail: ProductRail
  /** De eerste rij staat direct onder de header en krijgt compactere ruimte. */
  readonly isSpotlight?: boolean
}

export function FeaturedProducts({ rail, isSpotlight = false }: FeaturedProductsProps) {
  const query: CollectionQuery = {
    handle: rail.collectionHandle,
    sort: rail.sort,
    filters: [],
    priceMin: null,
    priceMax: null,
    after: null,
    before: null,
    pageSize: rail.limit,
  }
  const { data, isPending, isError, refetch } = useCollection(query)
  const products = data?.products ?? []
  const titleId = `rail-${rail.id}-title`

  return (
    <section
      className={isSpotlight ? 'featured-products featured-products--spotlight' : 'featured-products'}
      aria-labelledby={titleId}
    >
      <div className="featured-products__container">
        <div className="featured-products__header">
          <div>
            <p className="featured-products__eyebrow">{rail.eyebrow}</p>
            <h2 id={titleId} className="featured-products__title">
              {rail.title}
            </h2>
            <p className="featured-products__subtitle">{rail.subtitle}</p>
          </div>
          <Link to={rail.ctaTo} className="featured-products__header-cta">
            {rail.ctaLabel}
            <Icon name="arrow-right" size={18} strokeWidth={2.5} />
          </Link>
        </div>

        {isPending && <ProductGridSkeleton count={rail.limit} />}
        {isError && <ErrorState message="De producten konden niet worden geladen." onRetry={() => void refetch()} />}
        {!isPending && !isError && products.length === 0 && (
          <p className="featured-products__empty">Er zijn hier nog geen producten.</p>
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
