import { useMutation, useQuery } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useServices } from '@/context/ServicesContext'
import { toUserMessage } from '@/data/errors'
import { newsletterSchema, toFieldErrors } from '@/lib/validation'
import type { CollectionQuery, ContactMessage, SearchQuery } from '@/types/shop'

/**
 * Tijdens sorteren, filteren en bladeren blijft de vorige pagina zichtbaar (geen flits van skeletons),
 * maar alleen binnen dezelfde collectie of zoekterm: data van een andere collectie hoort er niet te staan.
 */
function keepPreviousWhen<T>(isSame: (previousKey: unknown) => boolean) {
  return (previous: T | undefined, previousQuery: { queryKey: readonly unknown[] } | undefined): T | undefined =>
    previousQuery !== undefined && isSame(previousQuery.queryKey[1]) ? previous : undefined
}

const isObjectWith = (key: string, value: string) => (candidate: unknown): boolean =>
  typeof candidate === 'object' && candidate !== null && (candidate as Record<string, unknown>)[key] === value

export function useCollection(query: CollectionQuery, options: { readonly enabled?: boolean } = {}) {
  const { shop } = useServices()
  return useQuery({
    queryKey: ['collection', query],
    queryFn: () => shop.getCollection(query),
    placeholderData: keepPreviousWhen(isObjectWith('handle', query.handle)),
    enabled: options.enabled ?? true,
  })
}

export function useProduct(handle: string) {
  const { shop } = useServices()
  return useQuery({
    queryKey: ['product', handle],
    queryFn: () => shop.getProduct(handle),
  })
}

export function useSearchProducts(query: SearchQuery) {
  const { shop } = useServices()
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => shop.searchProducts(query),
    placeholderData: keepPreviousWhen(isObjectWith('term', query.term)),
    enabled: query.term.trim().length > 0,
  })
}

export const MIN_LIVE_SEARCH_LENGTH = 2
export const LIVE_SEARCH_LIMIT = 6
const LIVE_SEARCH_STALE_MS = 60_000

/**
 * Suggesties voor de zoekbalk. Tijdens verder typen blijven de vorige suggesties staan,
 * zodat de lijst niet steeds leeg flitst.
 */
export function useLiveSearch(term: string) {
  const { shop } = useServices()
  const trimmed = term.trim()
  return useQuery({
    queryKey: ['live-search', trimmed.toLowerCase()],
    queryFn: () => shop.searchProducts({ term: trimmed, after: null, before: null, pageSize: LIVE_SEARCH_LIMIT }),
    enabled: trimmed.length >= MIN_LIVE_SEARCH_LENGTH,
    placeholderData: (previous) => previous,
    staleTime: LIVE_SEARCH_STALE_MS,
  })
}

export function useNewsletterMutation() {
  const { forms } = useServices()
  return useMutation({ mutationFn: (email: string) => forms.subscribeNewsletter(email) })
}

/** Validatie + versturen voor de nieuwsbriefformulieren (homepagina en footer). */
export function useNewsletterForm() {
  const mutation = useNewsletterMutation()
  const [email, setEmail] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const parsed = newsletterSchema.safeParse({ email })
    if (!parsed.success) {
      setValidationError(toFieldErrors(parsed.error).email ?? 'Vul een geldig e-mailadres in.')
      return
    }
    setValidationError(null)
    mutation.mutate(parsed.data.email)
  }

  return {
    email,
    setEmail,
    submit,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    errorMessage: validationError ?? (mutation.isError ? toUserMessage(mutation.error) : null),
  }
}

export function useContactMutation() {
  const { forms } = useServices()
  return useMutation({ mutationFn: (message: ContactMessage) => forms.sendContactMessage(message) })
}
