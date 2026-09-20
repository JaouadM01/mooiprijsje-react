import { useCallback, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { Icon } from '@/components/common/Icon'
import { RichText } from '@/components/common/RichText'
import { EmptyState, ErrorState } from '@/components/common/StatusMessage'
import { FilterSidebar } from '@/components/collection/FilterSidebar'
import { Pagination } from '@/components/collection/Pagination'
import { SortSelect } from '@/components/collection/SortSelect'
import { ProductGridSkeleton } from '@/components/home/FeaturedProducts'
import { ProductCard } from '@/components/product/ProductCard'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useCollection } from '@/hooks/useShopData'
import { countActiveFilters, parseCollectionParams, updateParams, type ParamChanges } from '@/lib/collectionParams'
import { NotFoundPage } from './NotFoundPage'
import '@/components/collection/collection.css'

export function CollectionPage() {
  const { handle = 'all' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  // Onthoud voor welke collectie het filterpaneel open is, zodat het bij een andere collectie vanzelf dicht is.
  const [filterOpenFor, setFilterOpenFor] = useState<string | null>(null)
  const isFilterOpen = filterOpenFor === handle

  const query = useMemo(() => parseCollectionParams(handle, searchParams), [handle, searchParams])
  const { data, isPending, isError, refetch } = useCollection(query)
  useDocumentTitle(data?.collection.title)

  const change = useCallback(
    (changes: ParamChanges) => setSearchParams(updateParams(searchParams, changes)),
    [searchParams, setSearchParams],
  )

  if (data === null) return <NotFoundPage message="Deze collectie bestaat niet." />

  const title = data?.collection.title ?? 'Producten'
  const hasFilters = (data?.filters.length ?? 0) > 0
  const activeCount = countActiveFilters(query)
  const pageInfo = data?.pageInfo
  const previousTo =
    pageInfo?.hasPreviousPage && pageInfo.startCursor
      ? `?${updateParams(searchParams, { before: pageInfo.startCursor, after: null })}`
      : null
  const nextTo =
    pageInfo?.hasNextPage && pageInfo.endCursor
      ? `?${updateParams(searchParams, { after: pageInfo.endCursor, before: null })}`
      : null

  return (
    <section className="main-collection">
      <div className="collection__banner">
        <div className="collection__banner-inner">
          <Breadcrumb items={[{ label: 'Thuis', to: '/' }, { label: title }]} />
          <h1 className="collection__title">{title}</h1>
          {data?.collection.descriptionHtml && (
            <RichText className="collection__description" html={data.collection.descriptionHtml} />
          )}
        </div>
      </div>

      <div className="collection__body">
        <div className="collection__toolbar">
          <div className="collection__toolbar-left">
            {hasFilters && (
              <button
                type="button"
                className="collection__filter-toggle"
                aria-expanded={isFilterOpen}
                onClick={() => setFilterOpenFor(handle)}
              >
                <Icon name="filter" size={18} />
                Filteren
                {activeCount > 0 && (
                  <span className="collection__filter-count">
                    {activeCount}
                    <span className="sr-only"> actieve filters</span>
                  </span>
                )}
              </button>
            )}
            {data?.totalCount != null && (
              <p className="collection__count" role="status">
                {data.totalCount} {data.totalCount === 1 ? 'product' : 'producten'}
              </p>
            )}
          </div>
          <div className="collection__toolbar-right">
            <SortSelect value={query.sort} onChange={(sort) => change({ sort: sort === 'manual' ? null : sort })} />
          </div>
        </div>

        <div className={hasFilters ? 'collection__layout' : 'collection__layout collection__layout--no-sidebar'}>
          {data && hasFilters && (
            <FilterSidebar
              filters={data.filters}
              active={query}
              isOpen={isFilterOpen}
              onClose={() => setFilterOpenFor(null)}
              onChange={change}
            />
          )}

          <div className="collection__main">
            {isPending && <ProductGridSkeleton count={8} />}
            {isError && <ErrorState message="De producten konden niet worden geladen." onRetry={() => void refetch()} />}

            {data && data.products.length === 0 && (
              <EmptyState title="Geen producten gevonden">
                <p>
                  {activeCount > 0
                    ? 'Er zijn geen producten die bij deze filters passen.'
                    : 'Deze collectie heeft nog geen producten. Bekijk ons volledige assortiment.'}
                </p>
                {activeCount > 0 && (
                  <button
                    type="button"
                    className="btn-primary collection__empty-action"
                    onClick={() => change({ f: null, price_min: null, price_max: null })}
                  >
                    Wis filters
                  </button>
                )}
              </EmptyState>
            )}

            {data && data.products.length > 0 && (
              <>
                <div className="collection__grid">
                  {data.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <Pagination previousTo={previousTo} nextTo={nextTo} />
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
