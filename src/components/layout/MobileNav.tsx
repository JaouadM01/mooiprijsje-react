import { useRef } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useServices } from '@/context/ServicesContext'
import { MAIN_NAV, SITE } from '@/config/site'
import { useDialogBehavior } from '@/hooks/useDialogBehavior'
import { Icon } from '../common/Icon'

interface MobileNavProps {
  readonly isOpen: boolean
  readonly onClose: () => void
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const { meta } = useServices()
  const containerRef = useRef<HTMLDivElement>(null)
  useDialogBehavior({ isOpen, onClose, containerRef })

  return (
    <>
      <div className={isOpen ? 'nav-overlay is-visible' : 'nav-overlay'} onClick={onClose} aria-hidden="true" />
      <div
        ref={containerRef}
        id="navDrawer"
        className={isOpen ? 'nav-drawer is-open' : 'nav-drawer'}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!isOpen}
        tabIndex={-1}
      >
        <div className="nav-drawer__header">
          <div className="nav-drawer__logo">
            {SITE.brand}
            <span>{SITE.brandSuffix}</span>
          </div>
          <button type="button" className="nav-drawer__close" aria-label="Menu sluiten" onClick={onClose}>
            <Icon name="close" size={22} />
          </button>
        </div>

        <nav aria-label="Mobiele navigatie">
          <ul className="nav-drawer__list">
            {MAIN_NAV.map((link) => (
              <li key={link.to} className="nav-drawer__item">
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) => (isActive ? 'nav-drawer__link active' : 'nav-drawer__link')}
                  onClick={onClose}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="nav-drawer__footer">
          {meta.accountUrl && (
            <a href={meta.accountUrl} className="btn-primary">
              <Icon name="user" size={18} />
              Mijn account
            </a>
          )}
          <Link to="/search" className="btn-ghost" onClick={onClose}>
            <Icon name="search" size={18} />
            Zoeken
          </Link>
        </div>
      </div>
    </>
  )
}
