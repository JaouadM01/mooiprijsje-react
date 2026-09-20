import { useId, useRef, useState, type FormEvent } from 'react'
import { useDialogBehavior } from '@/hooks/useDialogBehavior'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { countActiveFilters, type ParamChanges } from '@/lib/collectionParams'
import type { CollectionFilter, CollectionQuery } from '@/types/shop'
import { Icon } from '../common/Icon'
import './collection.css'

type ActiveFilters = Pick<CollectionQuery, 'filters' | 'priceMin' | 'priceMax'>

interface FilterSidebarProps {
  readonly filters: readonly CollectionFilter[]
  readonly active: ActiveFilters
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly onChange: (changes: ParamChanges) => void
}

interface PriceRangeFormProps {
  readonly filter: CollectionFilter
  readonly active: ActiveFilters
  readonly onChange: (changes: ParamChanges) => void
}

function PriceRangeForm({ filter, active, onChange }: PriceRangeFormProps) {
  const [min, setMin] = useState(active.priceMin?.toString() ?? '')
  const [max, setMax] = useState(active.priceMax?.toString() ?? '')
  const minId = useId()
  const maxId = useId()

  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    onChange({ price_min: min.trim() || null, price_max: max.trim() || null })
  }

  return (
    <form className="filter-price" onSubmit={submit}>
      <div className="filter-price__inputs">
        <div className="filter-price__field">
          <label htmlFor={minId}>Min (&#8364;)</label>
          <input
            id={minId}
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            placeholder="0"
            value={min}
            onChange={(event) => setMin(event.target.value)}
          />
        </div>
        <span className="filter-price__sep" aria-hidden="true">
          &#8212;
        </span>
        <div className="filter-price__field">
          <label htmlFor={maxId}>Max (&#8364;)</label>
          <input
            id={maxId}
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            placeholder={filter.priceRangeMax?.toString() ?? ''}
            value={max}
            onChange={(event) => setMax(event.target.value)}
          />
        </div>
      </div>
      <button type="submit" className="filter-price__apply">
        Toepassen
      </button>
    </form>
  )
}

interface FilterGroupProps extends PriceRangeFormProps {
  readonly panelId: string
}

function FilterGroup({ filter, active, onChange, panelId }: FilterGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const toggleValue = (input: string, isSelected: boolean): void => {
    const next = isSelected ? active.filters.filter((item) => item !== input) : [...active.filters, input]
    onChange({ f: next })
  }

  return (
    <div className="filter-group">
      <button
        type="button"
        className="filter-group__toggle"
        aria-expanded={isExpanded}
        aria-controls={panelId}
        onClick={() => setIsExpanded((expanded) => !expanded)}
      >
        <span>{filter.label}</span>
        <Icon name="chevron-down" size={14} className="filter-group__chevron" />
      </button>

      <div id={panelId} className="filter-group__options" hidden={!isExpanded}>
        {filter.type === 'PRICE_RANGE' ? (
          <PriceRangeForm
            key={`${active.priceMin}-${active.priceMax}`}
            filter={filter}
            active={active}
            onChange={onChange}
          />
        ) : (
          <ul className="filter-list">
            {filter.values.map((value) => {
              const isSelected = active.filters.includes(value.input)
              return (
                <li key={value.id}>
                  <label className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={value.count === 0 && !isSelected}
                      onChange={() => toggleValue(value.input, isSelected)}
                    />
                    <span className="filter-checkbox__label">{value.label}</span>
                    <span className="filter-checkbox__count">({value.count})</span>
                  </label>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

export function FilterSidebar({ filters, active, isOpen, onClose, onChange }: FilterSidebarProps) {
  const containerRef = useRef<HTMLElement>(null)
  const baseId = useId()
  const isMobile = useMediaQuery('(max-width: 900px)')
  const isModal = isMobile && isOpen
  useDialogBehavior({ isOpen: isModal, onClose, containerRef })

  const activeCount = countActiveFilters(active)

  return (
    <>
      {isModal && <div className="collection__backdrop" onClick={onClose} aria-hidden="true" />}
      <aside
        ref={containerRef}
        className={isOpen ? 'collection__sidebar is-open' : 'collection__sidebar'}
        aria-label="Filters"
        role={isModal ? 'dialog' : undefined}
        aria-modal={isModal || undefined}
        tabIndex={-1}
      >
        <div className="collection__sidebar-header">
          <h2 className="collection__sidebar-title">Filters</h2>
          {activeCount > 0 && (
            <button
              type="button"
              className="collection__clear-filters"
              onClick={() => onChange({ f: null, price_min: null, price_max: null })}
            >
              Wis filters
            </button>
          )}
          <button type="button" className="collection__sidebar-close" aria-label="Filters sluiten" onClick={onClose}>
            <Icon name="close" size={20} />
          </button>
        </div>

        {filters.map((filter) => (
          <FilterGroup
            key={filter.id}
            filter={filter}
            active={active}
            onChange={onChange}
            panelId={`${baseId}-${filter.id}`}
          />
        ))}

        <button type="button" className="btn-primary btn--full collection__show-results" onClick={onClose}>
          Toon resultaten
        </button>
      </aside>
    </>
  )
}
