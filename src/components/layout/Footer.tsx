import { Link } from 'react-router-dom'
import {
  FOOTER_LEGAL_LINKS,
  FOOTER_SERVICE_LINKS,
  FOOTER_SHOP_LINKS,
  PAYMENT_METHODS,
  SITE,
  SOCIAL_LINKS,
  type NavLink,
} from '@/config/site'
import { useNewsletterForm } from '@/hooks/useShopData'
import { Icon, type IconName } from '../common/Icon'

const SOCIALS: readonly { readonly key: keyof typeof SOCIAL_LINKS; readonly label: string; readonly icon: IconName }[] = [
  { key: 'instagram', label: 'Instagram', icon: 'instagram' },
  { key: 'facebook', label: 'Facebook', icon: 'facebook' },
  { key: 'tiktok', label: 'TikTok', icon: 'tiktok' },
]

function LinkColumn({ title, links }: { readonly title: string; readonly links: readonly NavLink[] }) {
  return (
    <div className="footer-col">
      <h3 className="footer-col__title">{title}</h3>
      <ul className="footer-links">
        {links.map((link) => (
          <li key={link.to}>
            <Link to={link.to}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function FooterNewsletter() {
  const { email, setEmail, submit, isPending, isSuccess, errorMessage } = useNewsletterForm()

  return (
    <div className="footer-col footer-col--newsletter">
      <h3 className="footer-col__title">Blijf op de hoogte</h3>
      <p className="footer-newsletter-text">
        Ontvang exclusieve kortingen en als eerste nieuws over nieuwe producten.
      </p>
      {isSuccess ? (
        <p className="footer-newsletter-success" role="status" tabIndex={-1} ref={(element) => element?.focus()}>
          &#10003; Bedankt voor je inschrijving!
        </p>
      ) : (
        <form onSubmit={submit} noValidate>
          <div className="footer-newsletter-form">
            <input
              type="email"
              name="email"
              className="footer-newsletter-input"
              placeholder="Jouw e-mailadres"
              aria-label="E-mailadres"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={errorMessage !== null}
            />
            <button type="submit" className="footer-newsletter-btn" aria-label="Inschrijven" disabled={isPending}>
              <Icon name="arrow-right" size={18} strokeWidth={2.5} />
            </button>
          </div>
          {errorMessage && (
            <p className="footer-newsletter-error" role="alert">
              {errorMessage}
            </p>
          )}
        </form>
      )}
    </div>
  )
}

export function Footer() {
  const socials = SOCIALS.filter((social) => SOCIAL_LINKS[social.key] !== '')

  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="container footer-grid">
          <div className="footer-col footer-col--brand">
            <div className="footer-logo">
              <span className="footer-logo-text">{SITE.name}</span>
            </div>
            <p className="footer-about">{SITE.footerAbout}</p>
            {socials.length > 0 && (
              <div className="footer-social">
                {socials.map((social) => (
                  <a
                    key={social.key}
                    href={SOCIAL_LINKS[social.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="footer-social__link"
                  >
                    <Icon name={social.icon} size={20} />
                  </a>
                ))}
              </div>
            )}
          </div>

          <LinkColumn title="Klantenservice" links={FOOTER_SERVICE_LINKS} />
          <LinkColumn title="Winkel" links={FOOTER_SHOP_LINKS} />
          <FooterNewsletter />
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p className="footer-copyright">
            &copy; {new Date().getFullYear()} {SITE.name}. Alle rechten voorbehouden.
            {FOOTER_LEGAL_LINKS.map((link) => (
              <span key={link.to}>
                {' '}
                | <Link to={link.to}>{link.label}</Link>
              </span>
            ))}
          </p>
          <div className="footer-payment">
            <span className="footer-payment__label">Wij accepteren:</span>
            <div className="footer-payment__icons">
              {PAYMENT_METHODS.map((method) => (
                <span key={method} className="payment-badge">
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
