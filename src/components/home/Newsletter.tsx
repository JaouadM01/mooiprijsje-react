import { NEWSLETTER } from '@/config/home'
import { useNewsletterForm } from '@/hooks/useShopData'
import { Icon } from '../common/Icon'
import './home.css'

export function Newsletter() {
  const { email, setEmail, submit, isPending, isSuccess, errorMessage } = useNewsletterForm()

  return (
    <section className="newsletter" aria-labelledby="newsletter-heading">
      <div className="newsletter__inner">
        <div className="newsletter__info">
          <div className="newsletter__info-content">
            <p className="newsletter__eyebrow">{NEWSLETTER.eyebrow}</p>
            <h2 id="newsletter-heading" className="newsletter__heading">
              {NEWSLETTER.heading}
            </h2>
            <p className="newsletter__subheading">{NEWSLETTER.subheading}</p>
            <ul className="newsletter__benefits">
              {NEWSLETTER.benefits.map((benefit) => (
                <li key={benefit} className="newsletter__benefit">
                  <span className="newsletter__benefit-icon">
                    <Icon name="check" size={16} strokeWidth={2.5} />
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="newsletter__form-panel">
          <div className="newsletter__form-wrap">
            <div className="newsletter__discount-badge" aria-hidden="true">
              <span className="newsletter__discount-pct">10%</span>
              <span className="newsletter__discount-label">korting</span>
            </div>
            <h3 className="newsletter__form-title">{NEWSLETTER.formTitle}</h3>
            <p className="newsletter__form-desc">{NEWSLETTER.formDescription}</p>

            {isSuccess ? (
              <div className="newsletter__success" role="status" tabIndex={-1} ref={(element) => element?.focus()}>
                <Icon name="badge-check" size={24} className="newsletter__success-icon" />
                <div>
                  <strong>Gelukt! Je bent ingeschreven.</strong>
                  <p>Check je inbox voor je 10% kortingscode.</p>
                </div>
              </div>
            ) : (
              <form className="newsletter__form" onSubmit={submit} noValidate>
                {errorMessage && (
                  <div className="newsletter__error" role="alert" id="newsletter-error">
                    {errorMessage}
                  </div>
                )}
                <div className="newsletter__field-group">
                  <label htmlFor="newsletter-email" className="newsletter__label">
                    E-mailadres
                  </label>
                  <input
                    id="newsletter-email"
                    type="email"
                    name="email"
                    className="newsletter__input"
                    placeholder="jij@voorbeeld.nl"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    aria-required="true"
                    aria-invalid={errorMessage !== null}
                    aria-describedby={errorMessage ? 'newsletter-error' : undefined}
                  />
                </div>
                <button type="submit" className="newsletter__submit" disabled={isPending}>
                  {isPending ? 'Bezig…' : NEWSLETTER.buttonLabel}
                </button>
              </form>
            )}

            <p className="newsletter__privacy">
              <Icon name="shield" size={13} />
              We sturen nooit spam. Uitschrijven kan altijd.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
