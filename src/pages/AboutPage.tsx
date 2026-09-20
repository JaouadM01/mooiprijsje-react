import { Link } from 'react-router-dom'
import { ImagePlaceholder } from '@/components/common/Icon'
import { ABOUT } from '@/config/home'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import './pages.css'

export function AboutPage() {
  useDocumentTitle('Over ons')

  return (
    <>
      <div className="about__hero">
        <div className="page-width">
          <p className="about__hero-tag">{ABOUT.tag}</p>
          <h1 className="about__hero-title">{ABOUT.title}</h1>
          <p className="about__hero-tagline">{ABOUT.tagline}</p>
        </div>
      </div>

      <section className="about__story page-width">
        <div className="about__story-grid">
          <div>
            <h2 className="about__story-title">{ABOUT.storyTitle}</h2>
            {ABOUT.story.map((paragraph) => (
              <p key={paragraph} className="about__story-para">
                {paragraph}
              </p>
            ))}
          </div>
          <div className="about__story-image" aria-hidden="true">
            <ImagePlaceholder className="about__story-img" />
          </div>
        </div>
      </section>

      <section className="about__values">
        <div className="page-width">
          <h2 className="about__values-title">{ABOUT.valuesTitle}</h2>
          <div className="about__values-grid">
            {ABOUT.values.map((value) => (
              <div key={value.name} className="about__value-card">
                <div className="about__value-icon" aria-hidden="true">
                  {value.icon}
                </div>
                <h3 className="about__value-name">{value.name}</h3>
                <p className="about__value-desc">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about__stats" aria-label="Mooiprijsje in cijfers">
        <div className="page-width">
          <dl className="about__stats-grid">
            {ABOUT.stats.map((stat) => (
              <div key={stat.label} className="about__stat">
                <dd className="about__stat-number">{stat.number}</dd>
                <dt className="about__stat-label">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="about__cta">
        <div className="about__cta-inner">
          <h2 className="about__cta-title">{ABOUT.cta.title}</h2>
          <p className="about__cta-text">{ABOUT.cta.text}</p>
          <Link to={ABOUT.cta.to} className="btn-primary">
            {ABOUT.cta.label}
          </Link>
        </div>
      </section>
    </>
  )
}
