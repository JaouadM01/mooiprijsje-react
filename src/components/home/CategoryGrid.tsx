import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORIES, CATEGORY_GRID_TITLE } from '@/config/home'
import { Icon } from '../common/Icon'
import './home.css'

export function CategoryGrid() {
  return (
    <section className="category-grid" aria-labelledby="category-grid-title">
      <div className="category-grid__container">
        <h2 id="category-grid-title" className="category-grid__title">
          {CATEGORY_GRID_TITLE}
        </h2>
        <div className="category-grid__grid">
          {CATEGORIES.map((category) => (
            <Link
              key={category.to}
              to={category.to}
              className="category-card"
              style={{ '--card-bg': category.background } as CSSProperties}
            >
              <span className="category-card__icon" aria-hidden="true">
                {category.icon}
              </span>
              <span className="category-card__name">{category.name}</span>
              <span className="category-card__arrow" aria-hidden="true">
                <Icon name="arrow-right" size={20} strokeWidth={2.5} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
