import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '@/context/CartContext'
import { formatMoney } from '@/lib/money'
import { isOnSale, savingsPercent } from '@/lib/pricing'
import type { ProductSummary } from '@/types/shop'
import { ImagePlaceholder } from '../common/Icon'
import './product.css'

export function ProductCard({ product }: { readonly product: ProductSummary }) {
  const { addItem, isBusy } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [hasFailed, setHasFailed] = useState(false)

  const href = `/products/${product.handle}`
  const onSale = isOnSale(product.price, product.compareAtPrice)
  const canAdd = product.available && product.defaultVariantId !== null

  const handleAdd = async (): Promise<void> => {
    if (product.defaultVariantId === null) return
    setIsAdding(true)
    setHasFailed(false)
    const isAdded = await addItem(product.defaultVariantId)
    setHasFailed(!isAdded)
    setIsAdding(false)
  }

  return (
    <article className="product-card">
      <Link to={href} className="product-card__link" tabIndex={-1} aria-hidden="true">
        <div className="product-card__media">
          {product.image ? (
            <>
              <img
                src={product.image.url}
                alt=""
                width={400}
                height={400}
                loading="lazy"
                className="product-card__img product-card__img--primary"
              />
              {product.hoverImage && (
                <img
                  src={product.hoverImage.url}
                  alt=""
                  width={400}
                  height={400}
                  loading="lazy"
                  className="product-card__img product-card__img--hover"
                />
              )}
            </>
          ) : (
            <ImagePlaceholder className="product-card__img" />
          )}
          {onSale && (
            <span className="product-card__badge product-card__badge--sale">
              &#8722;{savingsPercent(product.price, product.compareAtPrice)}%
            </span>
          )}
          {!product.available && <span className="product-card__badge product-card__badge--sold-out">Uitverkocht</span>}
        </div>
      </Link>

      <div className="product-card__body">
        <Link to={href} className="product-card__title">
          {product.title}
        </Link>

        <div className="product-card__price">
          <span className={onSale ? 'product-card__price-current product-card__price--sale' : 'product-card__price-current'}>
            {formatMoney(product.price)}
          </span>
          {onSale && product.compareAtPrice && (
            <span className="product-card__price-compare">
              <span className="sr-only">Was </span>
              <s>{formatMoney(product.compareAtPrice)}</s>
            </span>
          )}
        </div>

        <button
          type="button"
          className="product-card__atc"
          disabled={!canAdd || isAdding || isBusy}
          aria-label={canAdd ? `${product.title} in winkelwagen` : `${product.title} is uitverkocht`}
          onClick={() => void handleAdd()}
        >
          {!canAdd ? 'Uitverkocht' : isAdding ? 'Toevoegen…' : 'In winkelwagen'}
        </button>
        {hasFailed && (
          <p className="product-card__error" role="alert">
            Toevoegen is niet gelukt.
          </p>
        )}
      </div>
    </article>
  )
}
