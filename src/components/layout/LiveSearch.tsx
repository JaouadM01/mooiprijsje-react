import { Fragment, useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CATEGORIES } from '@/config/home'
import { SITE } from '@/config/site'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { MIN_LIVE_SEARCH_LENGTH, useLiveSearch } from '@/hooks/useShopData'
import { formatMoney } from '@/lib/money'
import { isOnSale } from '@/lib/pricing'
import type { ProductSummary } from '@/types/shop'
import { Icon, ImagePlaceholder } from '../common/Icon'

const DEBOUNCE_MS = 200
const SKELETON_ROWS = 3

interface LiveSearchProps {
  readonly variant: 'desktop' | 'mobile'
  readonly initialTerm: string
  /** Wordt aangeroepen zodra de bezoeker een resultaat kiest of de zoekopdracht verstuurt. */
  readonly onNavigate?: () => void
}

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Zet de gezochte woorden in de titel vet, zodat je ziet waarom een product gevonden is. */
function HighlightedText({ text, term }: { readonly text: string; readonly term: string }) {
  const words = term.toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length === 0) return <>{text}</>
  const pattern = new RegExp(`(${words.map(escapeRegExp).join('|')})`, 'gi')
  return (
    <>
      {text.split(pattern).map((part, index) =>
        words.includes(part.toLowerCase()) ? <mark key={index}>{part}</mark> : <Fragment key={index}>{part}</Fragment>,
      )}
    </>
  )
}

function Suggestion({ product, term }: { readonly product: ProductSummary; readonly term: string }) {
  const onSale = isOnSale(product.price, product.compareAtPrice)
  return (
    <>
      <span className="live-search__thumb">
        {product.image ? (
          <img src={product.image.url} alt="" width={56} height={56} loading="lazy" />
        ) : (
          <ImagePlaceholder />
        )}
      </span>
      <span className="live-search__info">
        <span className="live-search__name">
          <HighlightedText text={product.title} term={term} />
        </span>
        {product.productType && <span className="live-search__type">{product.productType}</span>}
      </span>
      <span className="live-search__price">
        <span className={onSale ? 'live-search__price-current is-sale' : 'live-search__price-current'}>
          {formatMoney(product.price)}
        </span>
        {onSale && product.compareAtPrice && (
          <s className="live-search__price-compare">
            <span className="sr-only">Was </span>
            {formatMoney(product.compareAtPrice)}
          </s>
        )}
      </span>
    </>
  )
}

function CategoryShortcuts({ onPick }: { readonly onPick: () => void }) {
  return (
    <ul className="live-search__chips">
      {CATEGORIES.map((category) => (
        <li key={category.to}>
          <Link to={category.to} className="live-search__chip" onClick={onPick}>
            {category.name}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function LiveSearch({ variant, initialTerm, onNavigate }: LiveSearchProps) {
  const navigate = useNavigate()
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [term, setTerm] = useState(initialTerm)
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const trimmed = term.trim()
  const isSearchable = trimmed.length >= MIN_LIVE_SEARCH_LENGTH
  const debouncedTerm = useDebouncedValue(trimmed, DEBOUNCE_MS)
  const { data, isFetching, isError, refetch } = useLiveSearch(debouncedTerm)

  const results = isSearchable ? data : undefined
  const products = results?.products ?? []
  const isWaiting = isSearchable && (debouncedTerm !== trimmed || isFetching)
  const searchHref = `/search?q=${encodeURIComponent(trimmed)}`
  // Alle producten plus de link "Bekijk alle resultaten" zijn met de pijltjes te kiezen.
  const optionHrefs: readonly string[] =
    products.length > 0 ? [...products.map((product) => `/products/${product.handle}`), searchHref] : []
  const optionId = (index: number): string => `${listId}-option-${index}`
  const hasList = isOpen && optionHrefs.length > 0

  useEffect(() => {
    if (!isOpen) return
    const handlePointerDown = (event: PointerEvent): void => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isOpen])

  const close = (): void => {
    setIsOpen(false)
    setActiveIndex(-1)
  }

  const finish = (): void => {
    close()
    inputRef.current?.blur()
    onNavigate?.()
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const activeHref = hasList ? optionHrefs[activeIndex] : undefined
    if (activeHref) {
      navigate(activeHref)
      finish()
      return
    }
    if (trimmed === '') return
    navigate(searchHref)
    finish()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setIsOpen(true)
      const count = optionHrefs.length
      if (count === 0) return
      setActiveIndex((current) =>
        event.key === 'ArrowDown' ? (current >= count - 1 ? 0 : current + 1) : current <= 0 ? count - 1 : current - 1,
      )
      return
    }
    if (event.key === 'Escape' && isOpen) {
      // Eerst alleen de suggesties sluiten; een tweede Escape sluit het mobiele zoekpaneel.
      if (isSearchable) event.stopPropagation()
      close()
    }
  }

  const totalCount = results?.totalCount ?? products.length
  let statusText = ''
  if (isSearchable && products.length > 0) statusText = `${totalCount} resultaten gevonden`
  else if (isSearchable && isWaiting) statusText = 'Zoeken…'
  else if (isSearchable) statusText = 'Geen resultaten gevonden'

  return (
    <div ref={rootRef} className={`live-search live-search--${variant}`}>
      <form role="search" onSubmit={handleSubmit}>
        <Icon name="search" size={18} className="search-icon" />
        <input
          ref={inputRef}
          type="search"
          name="q"
          value={term}
          role="combobox"
          aria-label="Zoeken"
          aria-autocomplete="list"
          aria-expanded={hasList}
          aria-controls={listId}
          aria-activedescendant={hasList && activeIndex >= 0 ? optionId(activeIndex) : undefined}
          onChange={(event) => {
            setTerm(event.target.value)
            setActiveIndex(-1)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={variant === 'desktop' ? SITE.searchPlaceholder : 'Zoeken naar producten...'}
          autoComplete="off"
          enterKeyHint="search"
          autoFocus={variant === 'mobile'}
        />
        {variant === 'desktop' && <button type="submit">Zoeken</button>}
      </form>

      {isOpen && (
        <div className="live-search__panel">
          <p className="sr-only" role="status" aria-live="polite">
            {statusText}
          </p>

          {!isSearchable && (
            <div className="live-search__section">
              <p className="live-search__heading">Populaire categorieën</p>
              <CategoryShortcuts onPick={finish} />
            </div>
          )}

          {isSearchable && isError && products.length === 0 && (
            <div className="live-search__message">
              <p>Zoeken lukt nu even niet.</p>
              <button type="button" className="live-search__retry" onClick={() => void refetch()}>
                Opnieuw proberen
              </button>
            </div>
          )}

          {isSearchable && !isError && products.length === 0 && isWaiting && (
            <ul className="live-search__skeleton" aria-hidden="true">
              {Array.from({ length: SKELETON_ROWS }, (_, index) => (
                <li key={index}>
                  <span className="skeleton live-search__skeleton-thumb" />
                  <span className="skeleton live-search__skeleton-line" />
                </li>
              ))}
            </ul>
          )}

          {isSearchable && !isError && products.length === 0 && !isWaiting && (
            <div className="live-search__message">
              <p>
                Geen producten gevonden voor <strong>“{trimmed}”</strong>.
              </p>
              <p className="live-search__hint">Probeer een ander zoekwoord of kies een categorie:</p>
              <CategoryShortcuts onPick={finish} />
            </div>
          )}

          {products.length > 0 && (
            <>
              <p className="live-search__heading">Producten</p>
              <ul
                id={listId}
                role="listbox"
                aria-label="Zoeksuggesties"
                className={isWaiting ? 'live-search__list is-updating' : 'live-search__list'}
              >
                {products.map((product, index) => (
                  <li key={product.id} id={optionId(index)} role="option" aria-selected={index === activeIndex}>
                    <Link
                      to={`/products/${product.handle}`}
                      tabIndex={-1}
                      className={index === activeIndex ? 'live-search__option is-active' : 'live-search__option'}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => {
                        setTerm('')
                        finish()
                      }}
                    >
                      <Suggestion product={product} term={trimmed} />
                    </Link>
                  </li>
                ))}
                <li id={optionId(products.length)} role="option" aria-selected={activeIndex === products.length}>
                  <Link
                    to={searchHref}
                    tabIndex={-1}
                    className={activeIndex === products.length ? 'live-search__all is-active' : 'live-search__all'}
                    onMouseEnter={() => setActiveIndex(products.length)}
                    onClick={finish}
                  >
                    Bekijk alle {totalCount} resultaten voor “{trimmed}”
                    <Icon name="arrow-right" size={16} strokeWidth={2.5} />
                  </Link>
                </li>
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  )
}
