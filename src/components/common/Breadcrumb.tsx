import { Link } from 'react-router-dom'

export interface Crumb {
  readonly label: string
  /** Zonder `to` is het item de huidige pagina. */
  readonly to?: string
}

export function Breadcrumb({ items }: { readonly items: readonly Crumb[] }) {
  return (
    <nav className="breadcrumb" aria-label="Kruimelpad">
      <ol className="breadcrumb__list">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="breadcrumb__item">
            {index > 0 && (
              <span className="breadcrumb__sep" aria-hidden="true">
                &#8250;
              </span>
            )}
            {item.to ? (
              <Link to={item.to} className="breadcrumb__link">
                {item.label}
              </Link>
            ) : (
              <span className="breadcrumb__current" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
