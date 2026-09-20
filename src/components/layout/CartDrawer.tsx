import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '@/context/CartContext'
import { useDialogBehavior } from '@/hooks/useDialogBehavior'
import { formatMoney } from '@/lib/money'
import { Icon, ImagePlaceholder } from '../common/Icon'

export function CartDrawer() {
  const { cart, isOpen, isBusy, error, closeCart, updateQuantity, removeItem } = useCart()
  const containerRef = useRef<HTMLDivElement>(null)
  useDialogBehavior({ isOpen, onClose: closeCart, containerRef })

  // Terug/vooruit in de browser mag geen open, scroll-lockend paneel achterlaten.
  const { pathname } = useLocation()
  useEffect(() => {
    closeCart()
  }, [pathname, closeCart])

  const lines = cart?.lines ?? []

  return (
    <>
      <div
        className={isOpen ? 'nav-overlay cart-overlay is-visible' : 'nav-overlay cart-overlay'}
        onClick={closeCart}
        aria-hidden="true"
      />
      <div
        ref={containerRef}
        id="cartDrawer"
        className={isOpen ? 'cart-drawer is-open' : 'cart-drawer'}
        role="dialog"
        aria-modal="true"
        aria-label="Winkelwagen"
        inert={!isOpen}
        tabIndex={-1}
      >
        <div className="cart-drawer__inner">
          <div className="cart-drawer__header">
            <h2 className="cart-drawer__title">Winkelwagen</h2>
            <button type="button" className="cart-drawer__close" aria-label="Winkelwagen sluiten" onClick={closeCart}>
              <Icon name="close" size={24} />
            </button>
          </div>

          <div className="cart-drawer__body">
            {error && (
              <p className="cart-drawer__error" role="alert">
                {error}
              </p>
            )}

            {lines.length === 0 ? (
              <div className="cart-drawer__empty">
                <Icon name="cart" size={48} strokeWidth={1.5} />
                <p>Je winkelwagen is leeg.</p>
                <Link to="/collections/all" className="btn-primary" onClick={closeCart}>
                  Bekijk assortiment
                </Link>
              </div>
            ) : (
              <ul className="cart-lines">
                {lines.map((line) => (
                  <li key={line.id} className="cart-item">
                    <Link to={`/products/${line.productHandle}`} className="cart-item__image" onClick={closeCart}>
                      {line.image ? (
                        <img src={line.image.url} alt={line.image.altText ?? line.productTitle} width={72} height={72} />
                      ) : (
                        <ImagePlaceholder />
                      )}
                    </Link>

                    <div className="cart-item__details">
                      <Link to={`/products/${line.productHandle}`} className="cart-item__title" onClick={closeCart}>
                        {line.productTitle}
                      </Link>
                      {line.variantTitle && <p className="cart-item__variant">{line.variantTitle}</p>}

                      <div className="cart-item__controls">
                        <div className="quantity-group" role="group" aria-label={`Aantal ${line.productTitle}`}>
                          <button
                            type="button"
                            aria-label="Minder"
                            disabled={isBusy || line.quantity <= 1}
                            onClick={() => void updateQuantity(line.id, line.quantity - 1)}
                          >
                            &#8722;
                          </button>
                          <span aria-live="polite">{line.quantity}</span>
                          <button
                            type="button"
                            aria-label="Meer"
                            disabled={isBusy}
                            onClick={() => void updateQuantity(line.id, line.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          className="cart-item__remove"
                          aria-label={`Verwijder ${line.productTitle}`}
                          disabled={isBusy}
                          onClick={() => void removeItem(line.id)}
                        >
                          <Icon name="trash" size={18} />
                        </button>
                      </div>
                    </div>

                    <span className="cart-item__price">{formatMoney(line.total)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {cart && lines.length > 0 && (
            <div className="cart-drawer__footer">
              <div className="cart-subtotal">
                <span>Subtotaal</span>
                <span>{formatMoney(cart.subtotal)}</span>
              </div>
              <p className="cart-drawer__note">Verzendkosten en kortingen worden bij het afrekenen berekend.</p>
              {cart.checkoutUrl ? (
                <a href={cart.checkoutUrl} className="btn-primary btn--full">
                  Naar afrekenen
                </a>
              ) : (
                <button type="button" className="btn-primary btn--full" disabled>
                  Afrekenen (demo-modus)
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
