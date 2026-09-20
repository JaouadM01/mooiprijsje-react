import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { MAIN_NAV, SITE } from '@/config/site'
import { useCart } from '@/context/CartContext'
import { useServices } from '@/context/ServicesContext'
import { Icon } from '../common/Icon'
import { MobileNav } from './MobileNav'

const STICKY_SCROLL_THRESHOLD_PX = 60

interface SearchFormProps {
  readonly variant: 'desktop' | 'mobile'
  readonly initialTerm: string
  readonly onSubmitted?: () => void
}

function SearchForm({ variant, initialTerm, onSubmitted }: SearchFormProps) {
  const navigate = useNavigate()
  const [term, setTerm] = useState(initialTerm)

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const trimmed = term.trim()
    if (trimmed === '') return
    navigate(`/search?q=${encodeURIComponent(trimmed)}`)
    onSubmitted?.()
  }

  return (
    <form role="search" onSubmit={handleSubmit}>
      <Icon name="search" size={18} className="search-icon" />
      <input
        type="search"
        name="q"
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder={variant === 'desktop' ? SITE.searchPlaceholder : 'Zoeken naar producten...'}
        aria-label="Zoeken"
        autoComplete="off"
        autoFocus={variant === 'mobile'}
      />
      {variant === 'desktop' && <button type="submit">Zoeken</button>}
    </form>
  )
}

export function Header() {
  const { totalQuantity, isOpen: isCartOpen, openCart } = useCart()
  const { meta } = useServices()
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()
  const [isSticky, setIsSticky] = useState(false)
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchToggleRef = useRef<HTMLButtonElement>(null)

  const urlTerm = pathname === '/search' ? (searchParams.get('q') ?? '') : ''

  useEffect(() => {
    const handleScroll = (): void => setIsSticky(window.scrollY > STICKY_SCROLL_THRESHOLD_PX)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsNavOpen(false)
    setIsSearchOpen(false)
  }, [pathname])

  return (
    <>
      <header className={isSticky ? 'site-header is-sticky' : 'site-header'}>
        <div className="container">
          <div className="site-header__inner">
            <button
              type="button"
              className={isNavOpen ? 'hamburger-btn is-open' : 'hamburger-btn'}
              aria-label="Menu openen"
              aria-expanded={isNavOpen}
              aria-controls="navDrawer"
              onClick={() => setIsNavOpen(true)}
            >
              <span />
              <span />
              <span />
            </button>

            <div className="site-header__logo">
              <Link to="/" title={SITE.name}>
                <span className="site-header__logo-text">
                  {SITE.brand}
                  <span>{SITE.brandSuffix}</span>
                </span>
              </Link>
            </div>

            <div className="site-header__search">
              <SearchForm key={urlTerm} variant="desktop" initialTerm={urlTerm} />
            </div>

            <div className="site-header__actions">
              <button
                type="button"
                ref={searchToggleRef}
                className="header-icon-btn search-toggle-mobile"
                aria-label="Zoeken openen"
                aria-expanded={isSearchOpen}
                aria-controls="mobileSearchOverlay"
                onClick={() => setIsSearchOpen((open) => !open)}
              >
                <Icon name="search" size={22} />
              </button>

              {meta.accountUrl && (
                <a href={meta.accountUrl} className="header-icon-btn hide-mobile" aria-label="Inloggen of mijn account">
                  <Icon name="user" size={22} />
                </a>
              )}

              <button
                type="button"
                className="header-icon-btn"
                aria-label={totalQuantity > 0 ? `Winkelwagen, ${totalQuantity} artikelen` : 'Winkelwagen'}
                aria-expanded={isCartOpen}
                aria-controls="cartDrawer"
                onClick={openCart}
              >
                <Icon name="cart" size={22} />
                {totalQuantity > 0 && (
                  <span className="cart-count" aria-hidden="true">
                    {totalQuantity}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <nav className="site-nav" aria-label="Hoofdnavigatie">
          <div className="container">
            <ul className="site-nav__list">
              {MAIN_NAV.map((link) => (
                <li key={link.to} className="site-nav__item">
                  <NavLink
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) => (isActive ? 'site-nav__link active' : 'site-nav__link')}
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>

      <div
        id="mobileSearchOverlay"
        className={isSearchOpen ? 'mobile-search-overlay is-open' : 'mobile-search-overlay'}
        inert={!isSearchOpen}
        onKeyDown={(event) => {
          if (event.key !== 'Escape') return
          setIsSearchOpen(false)
          // Het paneel wordt inert; zonder dit valt de focus terug op <body>.
          searchToggleRef.current?.focus()
        }}
      >
        {isSearchOpen && (
          <SearchForm key={urlTerm} variant="mobile" initialTerm={urlTerm} onSubmitted={() => setIsSearchOpen(false)} />
        )}
      </div>

      <MobileNav isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
    </>
  )
}
