import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMockShopRepository } from '@/data/mock/mockShopRepository'
import { ShopApiError } from '@/data/errors'
import { NEW_ARRIVALS, SPOTLIGHT } from '@/config/home'
import { createTestServices, renderWithProviders } from '@/test/utils'
import { CategoryGrid } from './CategoryGrid'
import { FeaturedProducts } from './FeaturedProducts'
import { Newsletter } from './Newsletter'
import { Testimonials, averageRating } from './Testimonials'
import { UspBar } from './UspBar'

const originalMatchMedia = window.matchMedia

afterEach(() => {
  window.matchMedia = originalMatchMedia
  vi.useRealTimers()
})

function mockMatchMedia(matching: (query: string) => boolean): void {
  window.matchMedia = ((query: string) => ({
    matches: matching(query),
    media: query,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  })) as unknown as typeof window.matchMedia
}

describe('UspBar and CategoryGrid', () => {
  it('lists four selling points', () => {
    renderWithProviders(<UspBar />)
    expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(4)
    expect(screen.getByText('14 dagen retour')).toBeInTheDocument()
  })

  it('links every category to its collection', () => {
    renderWithProviders(<CategoryGrid />)
    const links = screen.getAllByRole('link')
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/collections/schermen',
      '/collections/laadpoorten',
      '/collections/accessoires',
      '/collections/onderdelen',
    ])
  })
})

describe('FeaturedProducts', () => {
  it('shows the spotlight products from the frontpage collection with a label', async () => {
    renderWithProviders(<FeaturedProducts rail={SPOTLIGHT} isSpotlight />)
    const section = screen.getByRole('region', { name: 'Topdeals van deze week' })
    expect(within(section).getByText('Uitgelicht')).toBeInTheDocument()
    expect(await within(section).findAllByRole('article')).toHaveLength(8)
    expect(within(section).getByRole('link', { name: /Bekijk alle producten/ })).toHaveAttribute('href', '/collections/all')
  })

  it('shows the newest products first in the new-arrivals rail', async () => {
    const base = createMockShopRepository({ latencyMs: 0 })
    const getCollection = vi.fn(base.getCollection)
    renderWithProviders(<FeaturedProducts rail={NEW_ARRIVALS} />, { services: createTestServices({ shop: { ...base, getCollection } }) })

    expect(await screen.findAllByRole('article')).toHaveLength(4)
    expect(getCollection).toHaveBeenCalledWith(expect.objectContaining({ handle: 'all', sort: 'created-descending', pageSize: 4 }))
    expect(screen.getByRole('link', { name: /Bekijk alle nieuwe producten/ })).toHaveAttribute(
      'href',
      '/collections/all?sort=created-descending',
    )
  })

  it('shows an error and recovers on retry', async () => {
    const base = createMockShopRepository({ latencyMs: 0 })
    const getCollection = vi.fn().mockRejectedValueOnce(new ShopApiError('kapot')).mockImplementation(base.getCollection)
    const user = userEvent.setup()
    renderWithProviders(<FeaturedProducts rail={SPOTLIGHT} />, { services: createTestServices({ shop: { ...base, getCollection } }) })

    expect(await screen.findByRole('alert')).toHaveTextContent('konden niet worden geladen')
    await user.click(screen.getByRole('button', { name: 'Opnieuw proberen' }))
    expect(await screen.findAllByRole('article')).toHaveLength(8)
  })

  it('shows a message when the collection does not exist', async () => {
    const base = createMockShopRepository({ latencyMs: 0 })
    const shop = { ...base, getCollection: () => Promise.resolve(null) }
    renderWithProviders(<FeaturedProducts rail={SPOTLIGHT} />, { services: createTestServices({ shop }) })
    expect(await screen.findByText('Er zijn hier nog geen producten.')).toBeInTheDocument()
  })
})

describe('averageRating', () => {
  it('rounds the average to one decimal', () => {
    expect(averageRating([5, 5, 5, 4, 5, 5])).toBe(4.8)
    expect(averageRating([4, 5])).toBe(4.5)
  })

  it('returns 0 without ratings', () => {
    expect(averageRating([])).toBe(0)
  })
})

describe('Google reviews summary', () => {
  it('shows the Google score, the review count and a link to Google', () => {
    renderWithProviders(<Testimonials />)
    expect(screen.getByText('Google-reviews')).toBeInTheDocument()
    expect(screen.getByText('4,8')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '4,8 van de 5 sterren' })).toBeInTheDocument()
    expect(screen.getByText('Gebaseerd op 6 reviews')).toBeInTheDocument()

    const link = screen.getByRole('link', { name: /Bekijk alle reviews op Google/ })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('says the reviews are examples only in demo mode', () => {
    const { unmount } = renderWithProviders(<Testimonials />)
    expect(screen.getByText(/Voorbeeldreviews/)).toBeInTheDocument()
    unmount()

    renderWithProviders(<Testimonials />, { services: createTestServices({ meta: { isDemo: false, accountUrl: null } }) })
    expect(screen.queryByText(/Voorbeeldreviews/)).not.toBeInTheDocument()
  })
})

describe('Testimonials', () => {
  const visibleSlides = () => screen.getAllByRole('group')
  const dots = () => screen.getAllByRole('button', { name: /^Ga naar review/ })
  const selectedDot = () => dots().find((dot) => dot.getAttribute('aria-current') === 'true')!

  it('shows three reviews at a time on desktop with one dot per position', () => {
    renderWithProviders(<Testimonials />)
    expect(visibleSlides()).toHaveLength(3)
    expect(dots()).toHaveLength(4)
    expect(screen.getByRole('button', { name: 'Vorige review' })).toHaveAttribute('aria-disabled', 'true')
  })

  it('shows one review at a time on a phone', () => {
    mockMatchMedia((query) => query === '(max-width: 560px)' || query === '(max-width: 900px)')
    renderWithProviders(<Testimonials />)
    expect(visibleSlides()).toHaveLength(1)
    expect(dots()).toHaveLength(6)
  })

  it('moves with the arrows and dots and disables them at the ends', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Testimonials />)

    await user.click(screen.getByRole('button', { name: 'Volgende review' }))
    expect(selectedDot()).toHaveAccessibleName('Ga naar review 2')
    expect(screen.getByRole('button', { name: 'Vorige review' })).toHaveAttribute('aria-disabled', 'false')

    await user.click(screen.getByRole('button', { name: 'Ga naar review 4' }))
    expect(screen.getByRole('button', { name: 'Volgende review' })).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByText(/Twijfelde eerst/)).toBeVisible()
  })

  it('keeps keyboard focus on an arrow that reaches its end', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Testimonials />)
    const next = screen.getByRole('button', { name: 'Volgende review' })

    next.focus()
    for (let step = 0; step < 4; step += 1) await user.keyboard('{Enter}')
    expect(next).toHaveAttribute('aria-disabled', 'true')
    expect(next).toHaveFocus()
  })

  it('pauses autoplay while keyboard focus is anywhere in the carousel controls', () => {
    vi.useFakeTimers()
    renderWithProviders(<Testimonials />)

    act(() => screen.getByRole('button', { name: 'Volgende review' }).focus())
    act(() => void vi.advanceTimersByTime(20000))
    expect(selectedDot()).toHaveAccessibleName('Ga naar review 1')
  })

  it('autoplays and can be paused', () => {
    vi.useFakeTimers()
    renderWithProviders(<Testimonials />)
    expect(selectedDot()).toHaveAccessibleName('Ga naar review 1')

    act(() => void vi.advanceTimersByTime(5000))
    expect(selectedDot()).toHaveAccessibleName('Ga naar review 2')

    act(() => screen.getByRole('button', { name: 'Pauzeer' }).click())
    expect(screen.getByRole('button', { name: 'Afspelen' })).toBeInTheDocument()
    act(() => void vi.advanceTimersByTime(20000))
    expect(selectedDot()).toHaveAccessibleName('Ga naar review 2')
  })

  it('loops back to the start after the last position', () => {
    vi.useFakeTimers()
    renderWithProviders(<Testimonials />)
    for (let step = 0; step < 4; step += 1) act(() => void vi.advanceTimersByTime(5000))
    expect(selectedDot()).toHaveAccessibleName('Ga naar review 1')
  })

  it('does not autoplay for people who prefer reduced motion', () => {
    vi.useFakeTimers()
    mockMatchMedia((query) => query.includes('prefers-reduced-motion'))
    renderWithProviders(<Testimonials />)
    act(() => void vi.advanceTimersByTime(20000))
    expect(selectedDot()).toHaveAccessibleName('Ga naar review 1')
  })
})

describe('Newsletter', () => {
  it('rejects an invalid email without calling the service', async () => {
    const user = userEvent.setup()
    const services = createTestServices()
    renderWithProviders(<Newsletter />, { services })

    await user.type(screen.getByLabelText('E-mailadres'), 'nope')
    await user.click(screen.getByRole('button', { name: 'Schrijven' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Vul een geldig e-mailadres in.')
    expect(screen.getByLabelText('E-mailadres')).toHaveAttribute('aria-invalid', 'true')
    expect(services.forms.subscribeNewsletter).not.toHaveBeenCalled()
  })

  it('confirms a successful signup', async () => {
    const user = userEvent.setup()
    const services = createTestServices()
    renderWithProviders(<Newsletter />, { services })

    await user.type(screen.getByLabelText('E-mailadres'), 'jij@voorbeeld.nl')
    await user.click(screen.getByRole('button', { name: 'Schrijven' }))

    expect(await screen.findByText('Gelukt! Je bent ingeschreven.')).toBeInTheDocument()
    expect(services.forms.subscribeNewsletter).toHaveBeenCalledWith('jij@voorbeeld.nl')
  })

  it('shows the service error and keeps the form', async () => {
    const user = userEvent.setup()
    const services = createTestServices()
    services.forms.subscribeNewsletter = () => Promise.reject(new ShopApiError('Inschrijven is nog niet beschikbaar.'))
    renderWithProviders(<Newsletter />, { services })

    await user.type(screen.getByLabelText('E-mailadres'), 'jij@voorbeeld.nl')
    await user.click(screen.getByRole('button', { name: 'Schrijven' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Inschrijven is nog niet beschikbaar.')
    expect(screen.getByLabelText('E-mailadres')).toHaveValue('jij@voorbeeld.nl')
  })
})
