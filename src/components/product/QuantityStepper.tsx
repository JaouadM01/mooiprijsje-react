import { useState } from 'react'
import { MAX_LINE_QUANTITY } from '@/data/repositories'
import './product.css'

interface QuantityStepperProps {
  readonly id: string
  readonly value: number
  readonly onChange: (value: number) => void
  readonly min?: number
  readonly max?: number
}

export function QuantityStepper({ id, value, onChange, min = 1, max = MAX_LINE_QUANTITY }: QuantityStepperProps) {
  // Tijdens het typen mag het veld even leeg zijn; pas bij verlaten springt het terug naar een geldig aantal.
  const [draft, setDraft] = useState<string | null>(null)
  const clamp = (next: number): number => Math.min(max, Math.max(min, next))

  const handleChange = (text: string): void => {
    const parsed = Number.parseInt(text, 10)
    if (Number.isNaN(parsed)) {
      setDraft(text)
      return
    }
    const clamped = clamp(parsed)
    setDraft(parsed === clamped ? text : String(clamped))
    onChange(clamped)
  }

  const step = (next: number): void => {
    setDraft(null)
    onChange(clamp(next))
  }

  return (
    <div className="product__quantity">
      <label className="product__quantity-label" htmlFor={id}>
        Aantal
      </label>
      <div className="product__quantity-controls">
        <button
          type="button"
          className="product__qty-btn"
          aria-label="Minder"
          disabled={value <= min}
          onClick={() => step(value - 1)}
        >
          &#8722;
        </button>
        <input
          id={id}
          className="product__qty-input"
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={draft ?? value}
          onChange={(event) => handleChange(event.target.value)}
          onBlur={() => setDraft(null)}
        />
        <button
          type="button"
          className="product__qty-btn"
          aria-label="Meer"
          disabled={value >= max}
          onClick={() => step(value + 1)}
        >
          +
        </button>
      </div>
    </div>
  )
}
