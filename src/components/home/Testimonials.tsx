import { useCallback, useEffect, useRef, useState, type CSSProperties, type TouchEvent } from 'react'
import { TESTIMONIALS } from '@/config/home'
import { useServices } from '@/context/ServicesContext'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { Icon } from '../common/Icon'
import './home.css'

const AUTOPLAY_INTERVAL_MS = 5000
const SWIPE_THRESHOLD_PX = 40
const STAR_PATH = 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'

function GoogleLogo({ size = 20 }: { readonly size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

function Stars({ rating, size = 18 }: { readonly rating: number; readonly size?: number }) {
  const rounded = Math.round(rating)
  return (
    <div className="review-card__stars" role="img" aria-label={`${rating.toLocaleString('nl-NL')} van de 5 sterren`}>
      {[1, 2, 3, 4, 5].map((position) => (
        <svg key={position} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path
            d={STAR_PATH}
            fill={position <= rounded ? '#FBBF24' : '#E5E7EB'}
            stroke={position <= rounded ? '#F59E0B' : '#D1D5DB'}
            strokeWidth="1"
          />
        </svg>
      ))}
    </div>
  )
}

/** Gemiddelde op één decimaal, zoals Google het toont. */
export function averageRating(ratings: readonly number[]): number {
  if (ratings.length === 0) return 0
  return Math.round((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) * 10) / 10
}

export function Testimonials() {
  const { reviews } = TESTIMONIALS
  const { meta } = useServices()
  const average = averageRating(reviews.map((review) => review.rating))
  const isPhone = useMediaQuery('(max-width: 560px)')
  const isTablet = useMediaQuery('(max-width: 900px)')
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  const perView = isPhone ? 1 : isTablet ? 2 : 3
  const maxIndex = Math.max(0, reviews.length - perView)

  const [requestedIndex, setRequestedIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isInteracting, setIsInteracting] = useState(false)
  const touchStartX = useRef<number | null>(null)

  // Bij een breder scherm (meer reviews tegelijk) kan de gevraagde positie te ver staan.
  const index = Math.min(requestedIndex, maxIndex)
  const goTo = useCallback((next: number) => setRequestedIndex(Math.max(0, Math.min(next, maxIndex))), [maxIndex])

  useEffect(() => {
    if (!isPlaying || isInteracting || prefersReducedMotion || maxIndex === 0) return
    const timer = window.setTimeout(() => goTo(index >= maxIndex ? 0 : index + 1), AUTOPLAY_INTERVAL_MS)
    return () => window.clearTimeout(timer)
  }, [index, maxIndex, isPlaying, isInteracting, prefersReducedMotion, goTo])

  const handleTouchStart = (event: TouchEvent): void => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null
  }

  const handleTouchEnd = (event: TouchEvent): void => {
    const start = touchStartX.current
    const end = event.changedTouches[0]?.clientX
    touchStartX.current = null
    if (start === null || end === undefined) return
    const distance = start - end
    if (Math.abs(distance) > SWIPE_THRESHOLD_PX) goTo(distance > 0 ? index + 1 : index - 1)
  }

  return (
    <section
      className="testimonials"
      aria-labelledby="testimonials-title"
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
      onFocus={() => setIsInteracting(true)}
      onBlur={() => setIsInteracting(false)}
    >
      <div className="testimonials__container">
        <div className="testimonials__header">
          <h2 id="testimonials-title" className="testimonials__title">
            {TESTIMONIALS.heading}
          </h2>
          <p className="testimonials__subtitle">{TESTIMONIALS.subheading}</p>
        </div>

        <div className="google-summary">
          <div className="google-summary__brand">
            <GoogleLogo size={28} />
            <span className="google-summary__label">Google-reviews</span>
          </div>
          <div className="google-summary__score">
            <strong className="google-summary__average">{average.toLocaleString('nl-NL', { minimumFractionDigits: 1 })}</strong>
            <div>
              <Stars rating={average} size={20} />
              <span className="google-summary__count">
                Gebaseerd op {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </span>
            </div>
          </div>
          {TESTIMONIALS.googleUrl && (
            <a
              href={TESTIMONIALS.googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline google-summary__cta"
            >
              Bekijk alle reviews op Google
              <span className="sr-only"> (opent in een nieuw tabblad)</span>
            </a>
          )}
        </div>
        {meta.isDemo && (
          <p className="google-summary__demo-note">
            Voorbeeldreviews. In de live winkel staan hier automatisch de echte reviews van jullie Google-bedrijfsprofiel.
          </p>
        )}

        <div
          className="testimonials__carousel"
          role="region"
          aria-roledescription="carousel"
          aria-label="Klantreviews"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="testimonials__track"
            style={{ '--index': index, '--per-view': perView } as CSSProperties}
            aria-live={isPlaying && !isInteracting ? 'off' : 'polite'}
          >
            {reviews.map((review, position) => (
              <div
                key={review.name}
                className="testimonials__slide"
                role="group"
                aria-roledescription="slide"
                aria-label={`Review ${position + 1} van ${reviews.length}`}
                aria-hidden={position < index || position >= index + perView}
              >
                <article className="review-card">
                  <Stars rating={review.rating} />
                  <blockquote className="review-card__text">
                    <p>{review.text}</p>
                  </blockquote>
                  <footer className="review-card__footer">
                    <div className="review-card__avatar" aria-hidden="true">
                      {review.name.charAt(0)}
                    </div>
                    <div className="review-card__meta">
                      <span className="review-card__name">{review.name}</span>
                      <span className="review-card__location">
                        {review.city} &bull; {review.date}
                      </span>
                    </div>
                    <div className="review-card__verified" title="Review op Google">
                      <GoogleLogo size={18} />
                      <span className="sr-only">Review op Google</span>
                    </div>
                  </footer>
                </article>
              </div>
            ))}
          </div>
        </div>

        <div className="testimonials__nav">
          {/* aria-disabled i.p.v. disabled: een gefocuste knop die uitvalt laat de toetsenbordfocus verdwijnen. */}
          <button
            type="button"
            className="testimonials__arrow"
            aria-label="Vorige review"
            aria-disabled={index === 0}
            onClick={() => goTo(index - 1)}
          >
            <Icon name="chevron-left" size={20} strokeWidth={2.5} />
          </button>

          <div className="testimonials__dots">
            {Array.from({ length: maxIndex + 1 }, (_, position) => (
              <button
                key={position}
                type="button"
                aria-current={position === index}
                aria-label={`Ga naar review ${position + 1}`}
                className={position === index ? 'testimonials__dot testimonials__dot--active' : 'testimonials__dot'}
                onClick={() => goTo(position)}
              />
            ))}
          </div>

          <button
            type="button"
            className="testimonials__arrow"
            aria-label="Volgende review"
            aria-disabled={index >= maxIndex}
            onClick={() => goTo(index + 1)}
          >
            <Icon name="chevron-right" size={20} strokeWidth={2.5} />
          </button>

          <button type="button" className="testimonials__toggle" onClick={() => setIsPlaying((playing) => !playing)}>
            {isPlaying ? 'Pauzeer' : 'Afspelen'}
          </button>
        </div>
      </div>
    </section>
  )
}
