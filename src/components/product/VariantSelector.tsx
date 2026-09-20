import { useId } from 'react'
import { isOptionValueAvailable, type OptionSelection } from '@/lib/pricing'
import type { Product } from '@/types/shop'
import './product.css'

interface VariantSelectorProps {
  readonly product: Product
  readonly selection: OptionSelection
  readonly onChange: (optionName: string, value: string) => void
}

export function VariantSelector({ product, selection, onChange }: VariantSelectorProps) {
  const groupId = useId()

  return (
    <div className="product__variants">
      {product.options.map((option, optionIndex) => (
        <fieldset key={option.name} className="product__option">
          <legend className="product__option-label">
            {option.name}: <span className="product__option-value">{selection[option.name]}</span>
          </legend>
          <div className="product__option-values">
            {option.values.map((value, valueIndex) => {
              const inputId = `${groupId}-${optionIndex}-${valueIndex}`
              const isAvailable = isOptionValueAvailable(product, selection, option.name, value)
              return (
                <span key={value}>
                  <input
                    type="radio"
                    id={inputId}
                    name={`${groupId}-${optionIndex}`}
                    value={value}
                    checked={selection[option.name] === value}
                    onChange={() => onChange(option.name, value)}
                    className="product__option-input sr-only"
                  />
                  <label
                    htmlFor={inputId}
                    className={isAvailable ? 'product__option-pill' : 'product__option-pill is-unavailable'}
                  >
                    {value}
                    {!isAvailable && <span className="sr-only"> (uitverkocht)</span>}
                  </label>
                </span>
              )
            })}
          </div>
        </fieldset>
      ))}
    </div>
  )
}
