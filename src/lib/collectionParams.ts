import { z } from 'zod'
import type { CollectionQuery, CollectionSort } from '@/types/shop'

export const DEFAULT_PAGE_SIZE = 24

export const COLLECTION_SORT_OPTIONS: readonly { readonly value: CollectionSort; readonly label: string }[] = [
  { value: 'manual', label: 'Populair' },
  { value: 'price-ascending', label: 'Prijs ↑' },
  { value: 'price-descending', label: 'Prijs ↓' },
  { value: 'created-descending', label: 'Nieuwste' },
  { value: 'title-ascending', label: 'A–Z' },
  { value: 'title-descending', label: 'Z–A' },
]

const MAX_PARAM_LENGTH = 300
const MAX_FILTERS = 20

const shortText = z.string().max(100)

/** Alleen deze filtervormen worden doorgegeven; alles uit de URL is onbetrouwbaar. */
const filterInputSchema = z.union([
  z.strictObject({ available: z.boolean() }),
  z.strictObject({ productVendor: shortText }),
  z.strictObject({ productType: shortText }),
  z.strictObject({ tag: shortText }),
  z.strictObject({ variantOption: z.strictObject({ name: shortText, value: shortText }) }),
])

export function isAllowedFilter(raw: string): boolean {
  if (raw.length > MAX_PARAM_LENGTH) return false
  try {
    return filterInputSchema.safeParse(JSON.parse(raw)).success
  } catch {
    return false
  }
}

const MAX_PRICE_EUROS = 100_000

/** Strikte parsing ("12abc" is ongeldig), begrensd en op hele centen afgerond. */
function parsePrice(raw: string | null): number | null {
  if (raw === null || raw.trim() === '') return null
  const value = Number(raw.trim().replace(',', '.'))
  if (!Number.isFinite(value) || value < 0) return null
  return Math.min(Math.round(value * 100) / 100, MAX_PRICE_EUROS)
}

function parseSort(raw: string | null): CollectionSort {
  return COLLECTION_SORT_OPTIONS.find((option) => option.value === raw)?.value ?? 'manual'
}

function parseCursor(raw: string | null): string | null {
  return raw !== null && raw !== '' && raw.length <= MAX_PARAM_LENGTH ? raw : null
}

export function parseCollectionParams(
  handle: string,
  params: URLSearchParams,
  pageSize: number = DEFAULT_PAGE_SIZE,
): CollectionQuery {
  const rawMin = parsePrice(params.get('price_min'))
  const rawMax = parsePrice(params.get('price_max'))
  const isSwapped = rawMin !== null && rawMax !== null && rawMin > rawMax
  const after = parseCursor(params.get('after'))

  return {
    handle,
    sort: parseSort(params.get('sort')),
    filters: params.getAll('f').filter(isAllowedFilter).slice(0, MAX_FILTERS),
    priceMin: isSwapped ? rawMax : rawMin,
    priceMax: isSwapped ? rawMin : rawMax,
    after,
    before: after === null ? parseCursor(params.get('before')) : null,
    pageSize,
  }
}

export type ParamChanges = Readonly<Record<string, string | readonly string[] | null>>

/**
 * Geeft nieuwe URL-parameters terug. Bladeren (after/before) wordt gewist zodra iets
 * anders verandert, want een cursor hoort bij één specifieke selectie.
 */
export function updateParams(current: URLSearchParams, changes: ParamChanges): URLSearchParams {
  const next = new URLSearchParams(current)
  if (!('after' in changes) && !('before' in changes)) {
    next.delete('after')
    next.delete('before')
  }

  for (const [key, value] of Object.entries(changes)) {
    next.delete(key)
    if (value === null) continue
    if (typeof value === 'string') {
      if (value !== '') next.set(key, value)
      continue
    }
    value.forEach((item) => next.append(key, item))
  }
  return next
}

export function countActiveFilters(query: Pick<CollectionQuery, 'filters' | 'priceMin' | 'priceMax'>): number {
  const hasPrice = query.priceMin !== null || query.priceMax !== null
  return query.filters.length + (hasPrice ? 1 : 0)
}
