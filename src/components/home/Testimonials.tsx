import { useCallback, useEffect, useRef, useState, type CSSProperties, type TouchEvent } from 'react'
import { TESTIMONIALS } from '@/config/home'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { Icon } from '../common/Icon'
import './home.css'

const AUTOPLAY_INTERVAL_MS = 5000
const SWIPE_THRESHOLD_PX = 40
const STAR_PATH = 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'

function Stars({ rating }: { readonly rating: number }) {
  return (
    <div className="review-card__stars" role="img" aria-label={`${rating} van de 5 sterren`}>
      {[1, 2, 3, 4, 5].map((position) => (
        <svg key={position} width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d={STAR_PATH}
            fill={position <= rating ? '#FBBF24' : '#E5E7EB'}
            stroke={position <= rating ? '#F59E0B' : '#D1D5DB'}
            strokeWidth="1"
          />
        </svg>
      ))}
    </div>
  )
}

export function Testimonials() {
  const { reviews } = TESTIMONIALS
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
                    <div className="review-card__verified" title="Geverifieerde aankoop">
                      <Icon name="badge-check" size={16} className="review-card__verified-icon" />
                      <span className="sr-only">Geverifieerde aankoop</span>
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
