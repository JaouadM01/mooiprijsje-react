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
            <Link key={category.to} to={category.to} className="category-card">
              <span className="category-card__media">
                <img src={category.image} alt="" width={300} height={300} loading="lazy" />
              </span>
              <span className="category-card__body">
                <span className="category-card__text">
                  <span className="category-card__name">{category.name}</span>
                  <span className="category-card__tagline">{category.tagline}</span>
                </span>
                <span className="category-card__arrow" aria-hidden="true">
                  <Icon name="arrow-right" size={18} strokeWidth={2.5} />
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
