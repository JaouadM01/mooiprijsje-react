import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { EmptyState, ErrorState } from '@/components/common/StatusMessage'
import { Pagination } from '@/components/collection/Pagination'
import { ProductGridSkeleton } from '@/components/home/FeaturedProducts'
import { ProductCard } from '@/components/product/ProductCard'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchProducts } from '@/hooks/useShopData'
import { DEFAULT_PAGE_SIZE, updateParams } from '@/lib/collectionParams'
import type { SearchQuery } from '@/types/shop'
import '@/components/collection/collection.css'
import './pages.css'

const MAX_TERM_LENGTH = 100
const MAX_CURSOR_LENGTH = 300

export function SearchPage() {
  const [searchParams] = useSearchParams()
  const term = (searchParams.get('q') ?? '').trim().slice(0, MAX_TERM_LENGTH)
  const after = searchParams.get('after')?.slice(0, MAX_CURSOR_LENGTH) || null
  const before = after ? null : searchParams.get('before')?.slice(0, MAX_CURSOR_LENGTH) || null

  const query = useMemo<SearchQuery>(
    () => ({ term, after, before, pageSize: DEFAULT_PAGE_SIZE }),
    [term, after, before],
  )
  const result = useSearchProducts(query)
  const { isPending, isError, refetch } = result
  // Zonder zoekterm is de query uitgeschakeld en horen er geen (oude) resultaten te staan.
  const data = term === '' ? undefined : result.data
  useDocumentTitle(term ? `Zoeken: ${term}` : 'Zoeken')

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
    <section className="page-width search-page">
      <Breadcrumb items={[{ label: 'Thuis', to: '/' }, { label: 'Zoeken' }]} />
      <h1 className="search-page__title">{term ? `Zoekresultaten voor “${term}”` : 'Zoeken'}</h1>

      {term === '' && (
        <EmptyState title="Waar ben je naar op zoek?">
          <p>Typ in de zoekbalk bovenaan de pagina wat je zoekt, bijvoorbeeld “iPhone scherm”.</p>
        </EmptyState>
      )}

      {term !== '' && isPending && <ProductGridSkeleton count={8} />}
      {isError && <ErrorState message="Zoeken is niet gelukt." onRetry={() => void refetch()} />}

      {data && data.products.length === 0 && (
        <EmptyState title="Geen resultaten">
          <p>Er zijn geen producten gevonden voor “{term}”. Controleer de spelling of probeer een ander woord.</p>
        </EmptyState>
      )}

      {data && data.products.length > 0 && (
        <>
          {data.totalCount !== null && (
            <p className="search-page__count" role="status">
              {data.totalCount} {data.totalCount === 1 ? 'resultaat' : 'resultaten'}
            </p>
          )}
          <div className="collection__grid">
            {data.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <Pagination previousTo={previousTo} nextTo={nextTo} />
        </>
      )}
    </section>
  )
}
