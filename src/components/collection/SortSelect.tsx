import { useId } from 'react'
import { COLLECTION_SORT_OPTIONS } from '@/lib/collectionParams'
import type { CollectionSort } from '@/types/shop'
import './collection.css'

interface SortSelectProps {
  readonly value: CollectionSort
  readonly onChange: (value: CollectionSort) => void
}

export function SortSelect({ value, onChange }: SortSelectProps) {
  const id = useId()

  return (
    <div className="collection__sort">
      <label htmlFor={id} className="collection__sort-label">
        Sorteren op:
      </label>
      <select
        id={id}
        className="collection__sort-select"
        value={value}
        onChange={(event) => {
          const selected = COLLECTION_SORT_OPTIONS.find((option) => option.value === event.target.value)
          if (selected) onChange(selected.value)
        }}
      >
        {COLLECTION_SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
