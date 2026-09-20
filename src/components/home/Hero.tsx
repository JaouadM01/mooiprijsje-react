import { Link } from 'react-router-dom'
import { HERO } from '@/config/home'
import { Icon } from '../common/Icon'
import './home.css'

function HeroPlaceholder() {
  return (
    <div className="hero__image-placeholder" aria-hidden="true">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" fill="none">
        <rect width="800" height="600" fill="#E2E8F0" />
        <rect x="260" y="120" width="280" height="480" rx="28" fill="#CBD5E1" />
        <rect x="274" y="148" width="252" height="420" rx="16" fill="#F1F5F9" />
        <rect x="330" y="128" width="140" height="8" rx="4" fill="#94A3B8" />
        <circle cx="400" cy="548" r="14" fill="#94A3B8" />
        <rect x="290" y="172" width="220" height="140" rx="8" fill="#BFDBFE" />
        <rect x="290" y="328" width="100" height="12" rx="4" fill="#CBD5E1" />
        <rect x="290" y="376" width="80" height="30" rx="8" fill="#2B7FFF" />
      </svg>
    </div>
  )
}

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero__inner">
        <div className="hero__image-col">
          <HeroPlaceholder />
          <div className="hero__floating-badge" aria-hidden="true">
            <span className="hero__floating-badge-icon">&#9889;</span>
            <div>
              <strong>{HERO.badge.title}</strong>
              <span>{HERO.badge.text}</span>
            </div>
          </div>
        </div>

        <div className="hero__content-col">
          <p className="hero__trust-line">
            <span className="hero__stars" role="img" aria-label="5 van de 5 sterren">
              &#9733;&#9733;&#9733;&#9733;&#9733;
            </span>
            {HERO.trustLine}
          </p>
          <h1 id="hero-heading" className="hero__heading">
            {HERO.heading}
          </h1>
          <p className="hero__subheading">{HERO.subheading}</p>

          <div className="hero__ctas">
            <Link to={HERO.primaryCta.to} className="hero__btn hero__btn--primary">
              {HERO.primaryCta.label}
            </Link>
            <Link to={HERO.secondaryCta.to} className="hero__btn hero__btn--outline">
              {HERO.secondaryCta.label}
            </Link>
          </div>

          <ul className="hero__quick-trust" aria-label="Voordelen">
            {HERO.quickTrust.map((item) => (
              <li key={item}>
                <Icon name="check" size={16} strokeWidth={2.5} className="hero__check" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="hero__wave" aria-hidden="true">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill={HERO.waveColor} />
        </svg>
      </div>
    </section>
  )
}
