import { Link } from 'react-router-dom'
import { Icon } from '../common/Icon'
import './collection.css'

interface PaginationProps {
  /** Link naar de vorige pagina; null = er is geen vorige. */
  readonly previousTo: string | null
  readonly nextTo: string | null
}

/**
 * Naar boven scrollen en de focus naar de hoofdinhoud: de aangeklikte link kan op de laatste pagina
 * verdwijnen, en zonder dit valt de toetsenbordfocus dan terug op <body>.
 */
const goToTopOfResults = (): void => {
  window.scrollTo({ top: 0 })
  document.getElementById('MainContent')?.focus({ preventScroll: true })
}

export function Pagination({ previousTo, nextTo }: PaginationProps) {
  if (previousTo === null && nextTo === null) return null

  return (
    <nav className="collection__pagination" aria-label="Paginering">
      <ul className="pagination__list">
        <li>
          {previousTo !== null && (
            <Link to={previousTo} rel="prev" className="pagination__link" onClick={goToTopOfResults}>
              <Icon name="chevron-left" size={16} />
              Vorige
            </Link>
          )}
        </li>
        <li>
          {nextTo !== null && (
            <Link to={nextTo} rel="next" className="pagination__link" onClick={goToTopOfResults}>
              Volgende
              <Icon name="chevron-right" size={16} />
            </Link>
          )}
        </li>
      </ul>
    </nav>
  )
}
