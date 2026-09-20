import { USPS, type UspIcon } from '@/config/home'
import { Icon, type IconName } from '../common/Icon'
import './home.css'

const ICON_FOR: Readonly<Record<UspIcon, IconName>> = {
  cart: 'basket',
  badge: 'badge-check',
  refresh: 'refresh',
  shield: 'shield',
}

export function UspBar() {
  return (
    <section className="usp-bar" aria-label="Onze voordelen">
      <div className="usp-bar__container">
        <ul className="usp-bar__list">
          {USPS.map((usp) => (
            <li key={usp.title} className="usp-bar__item">
              <div className="usp-bar__icon">
                <Icon name={ICON_FOR[usp.icon]} size={28} strokeWidth={1.8} />
              </div>
              <div className="usp-bar__text">
                <strong className="usp-bar__label">{usp.title}</strong>
                <span className="usp-bar__description">{usp.description}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
