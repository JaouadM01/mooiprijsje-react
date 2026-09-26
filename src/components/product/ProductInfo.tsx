import { useId, useState } from 'react'
import { PRODUCT_USPS } from '@/config/site'
import { useCart } from '@/context/CartContext'
import { formatMoney } from '@/lib/money'
import {
  defaultVariant,
  findVariant,
  isOnSale,
  badgeSavingsPercent,
  selectionFromVariant,
  stockLevel,
  type OptionSelection,
} from '@/lib/pricing'
import type { Product, ProductVariant } from '@/types/shop'
import { Icon } from '../common/Icon'
import { RichText } from '../common/RichText'
import { QuantityStepper } from './QuantityStepper'
import { VariantSelector } from './VariantSelector'
import './product.css'

const PAYMENT_BADGES: readonly { readonly label: string; readonly modifier: string }[] = [
  { label: 'iDEAL', modifier: 'ideal' },
  { label: 'Klarna', modifier: 'klarna' },
  { label: 'VISA', modifier: 'visa' },
  { label: 'Mastercard', modifier: 'mc' },
  { label: 'PayPal', modifier: 'paypal' },
]

function StockStatus({ variant }: { readonly variant: ProductVariant }) {
  const level = stockLevel(variant)
  const text =
    level === 'out'
      ? 'Uitverkocht'
      : level === 'low'
        ? variant.quantityAvailable !== null
          ? `Laag op voorraad: nog ${variant.quantityAvailable} stuks`
          : 'Laag op voorraad'
        : 'Op voorraad'

  return (
    <div className="product__stock" role="status">
      <span className={`product__stock-dot product__stock-dot--${level}`} aria-hidden="true" />
      <span className={`product__stock-text product__stock-text--${level}`}>{text}</span>
    </div>
  )
}

export function ProductInfo({ product }: { readonly product: Product }) {
  const { addItem, buyNow, isBusy, error } = useCart()
  const [hasFailed, setHasFailed] = useState(false)
  const [selection, setSelection] = useState<OptionSelection>(() => {
    const initial = defaultVariant(product)
    return initial ? selectionFromVariant(initial) : {}
  })
  const [quantity, setQuantity] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const quantityId = useId()

  const variant = findVariant(product, selection)
  const hasVariants = product.variants.length > 1
  const onSale = variant !== null && isOnSale(variant.price, variant.compareAtPrice)
  const badgePercent = variant === null ? null : badgeSavingsPercent(variant.price, variant.compareAtPrice)
  const canBuy = variant !== null && variant.available

  const submit = async (action: (variantId: string, quantity: number) => Promise<boolean>): Promise<void> => {
    if (variant === null) return
    setIsSubmitting(true)
    setHasFailed(false)
    const isDone = await action(variant.id, quantity)
    setHasFailed(!isDone)
    setIsSubmitting(false)
  }

  return (
    <div className="product__info">
      <h1 className="product__title">{product.title}</h1>

      <div className="product__price-block">
        {variant ? (
          <div className="product__price-row">
            <span className={onSale ? 'product__price product__price--sale' : 'product__price'}>
              {formatMoney(variant.price)}
            </span>
            {onSale && variant.compareAtPrice && (
              <>
                <span className="product__price product__price--compare">
                  <span className="sr-only">Was </span>
                  <s>{formatMoney(variant.compareAtPrice)}</s>
                </span>
                {badgePercent !== null && (
                  <span className="product__badge product__badge--sale">Bespaar {badgePercent}%</span>
                )}
              </>
            )}
          </div>
        ) : (
          <p className="product__unavailable-combo">Deze combinatie is niet beschikbaar.</p>
        )}
      </div>

      {product.shortDescriptionHtml && (
        <RichText className="product__short-description" html={product.shortDescriptionHtml} />
      )}

      <form
        className="product-form"
        onSubmit={(event) => {
          event.preventDefault()
          void submit(addItem)
        }}
      >
        {hasVariants && (
          <VariantSelector
            product={product}
            selection={selection}
            onChange={(name, value) => setSelection((current) => ({ ...current, [name]: value }))}
          />
        )}

        {variant && <StockStatus variant={variant} />}

        <QuantityStepper id={quantityId} value={quantity} onChange={setQuantity} />

        <div className="product__cta-group">
          <button type="submit" className="btn-primary btn--full" disabled={!canBuy || isSubmitting || isBusy}>
            {!canBuy ? 'Uitverkocht' : isSubmitting ? 'Toevoegen…' : 'In winkelwagen'}
          </button>
          <button
            type="button"
            className="btn-outline btn--full"
            disabled={!canBuy || isSubmitting || isBusy}
            onClick={() => void submit(buyNow)}
          >
            Direct kopen
          </button>
        </div>

        {/* Alleen tonen na een mislukte poging hier: een oude fout van elders hoort niet op deze pagina. */}
        {hasFailed && (
          <p className="product__error" role="alert">
            {error ?? 'Toevoegen is niet gelukt. Probeer het opnieuw.'}
          </p>
        )}
      </form>

      <div className="product__payment-icons">
        <span className="product__payment-label">Veilig betalen met:</span>
        <ul className="product__payment-badges">
          {PAYMENT_BADGES.map((badge) => (
            <li key={badge.label} className={`payment-badge-product payment-badge-product--${badge.modifier}`}>
              {badge.label}
            </li>
          ))}
        </ul>
      </div>

      <ul className="product__usps" aria-label="Voordelen">
        {PRODUCT_USPS.map((usp) => (
          <li key={usp} className="product__usp">
            <Icon name="check" size={16} strokeWidth={2.5} className="product__usp-icon" />
            {usp}
          </li>
        ))}
      </ul>
    </div>
  )
}
