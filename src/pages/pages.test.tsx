import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from '@/App'
import { ShopApiError } from '@/data/errors'
import { createMockShopRepository } from '@/data/mock/mockShopRepository'
import { createTestServices, renderWithProviders } from '@/test/utils'

const renderApp = (route: string, services = createTestServices()) => renderWithProviders(<App />, { route, services })
const main = () => screen.getByRole('main')
// De afbeeldingslink is aria-hidden; de titellink is de enige toegankelijke link in de kaart.
const articleTitles = () =>
  within(main())
    .getAllByRole('article')
    .map((article) => within(article).getByRole('link').textContent)

describe('home page', () => {
  it('shows every section', async () => {
    renderApp('/')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Alles voor jouw telefoon')
    expect(screen.getByRole('heading', { name: 'Shop per categorie' })).toBeInTheDocument()
    // Ook de reviews zijn <article>-elementen, dus zoek binnen de bestsellers-sectie.
    const bestsellers = screen.getByRole('region', { name: 'Onze bestsellers' })
    expect(await within(bestsellers).findAllByRole('article')).toHaveLength(8)
    expect(screen.getByRole('heading', { name: 'Wat onze klanten zeggen' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Ontvang 10% korting' })).toBeInTheDocument()
    expect(document.title).toBe('mooiprijsje.nl')
  })
})

describe('collection page', () => {
  it('lists the products of a collection with a title and count', async () => {
    renderApp('/collections/schermen')
    expect(await screen.findByRole('heading', { level: 1, name: 'Schermen' })).toBeInTheDocument()
    expect(await within(main()).findByText('5 producten')).toBeInTheDocument()
    expect(within(main()).getAllByRole('article')).toHaveLength(5)
    expect(document.title).toBe('Schermen – mooiprijsje.nl')
  })

  it('sorts through the URL', async () => {
    const user = userEvent.setup()
    renderApp('/collections/accessoires')
    await within(main()).findAllByRole('article')

    await user.selectOptions(screen.getByLabelText('Sorteren op:'), 'price-descending')
    await waitFor(() => expect(articleTitles()[0]).toBe('Draadloze oordopjes met oplaaddoosje'))

    await user.selectOptions(screen.getByLabelText('Sorteren op:'), 'price-ascending')
    await waitFor(() => expect(articleTitles().at(-1)).toBe('Draadloze oordopjes met oplaaddoosje'))
  })

  it('narrows the list with a brand filter and clears it again', async () => {
    const user = userEvent.setup()
    renderApp('/collections/all')
    await within(main()).findAllByRole('article')

    await user.click(screen.getByRole('checkbox', { name: /Samsung/ }))
    await within(main()).findByText('5 producten')
    expect(articleTitles().every((title) => title?.includes('Samsung'))).toBe(true)

    await user.click(screen.getByRole('button', { name: 'Wis filters' }))
    await waitFor(() => expect(within(main()).getAllByRole('article').length).toBeGreaterThan(5))
  })

  it('filters by price range from the URL', async () => {
    renderApp('/collections/all?price_min=10&price_max=15')
    await within(main()).findAllByRole('article')
    expect(articleTitles()).toEqual(
      expect.arrayContaining(['Lightning laadpoort iPhone 11', 'Siliconen hoesje Samsung Galaxy S23']),
    )
    expect(articleTitles()).not.toContain('iPhone 13 OLED scherm + montageset')
  })

  it('offers to clear filters when nothing matches', async () => {
    const user = userEvent.setup()
    renderApp('/collections/all?price_min=900')
    const message = await screen.findByText('Er zijn geen producten die bij deze filters passen.')

    // De zijbalk heeft ook een "Wis filters"-knop; hier gaat het om die in de lege staat.
    await user.click(within(message.parentElement!).getByRole('button', { name: 'Wis filters' }))
    expect((await within(main()).findAllByRole('article')).length).toBeGreaterThan(5)
  })

  it('shows a not-found message for an unknown collection', async () => {
    renderApp('/collections/bestaat-niet')
    expect(await screen.findByText('Deze collectie bestaat niet.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Naar de homepage' })).toHaveAttribute('href', '/')
  })

  it('shows an error with retry when loading fails', async () => {
    const base = createMockShopRepository({ latencyMs: 0 })
    const getCollection = vi.fn().mockRejectedValueOnce(new ShopApiError('kapot')).mockImplementation(base.getCollection)
    const user = userEvent.setup()
    renderApp('/collections/laadpoorten', createTestServices({ shop: { ...base, getCollection } }))

    expect(await screen.findByText('De producten konden niet worden geladen.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Opnieuw proberen' }))
    expect(await within(main()).findAllByRole('article')).toHaveLength(3)
  })

  it('pages with cursors', async () => {
    const base = createMockShopRepository({ latencyMs: 0 })
    const getCollection: typeof base.getCollection = (query) => base.getCollection({ ...query, pageSize: 4 })
    const user = userEvent.setup()
    renderApp('/collections/all', createTestServices({ shop: { ...base, getCollection } }))

    await within(main()).findAllByRole('article')
    expect(within(main()).getAllByRole('article')).toHaveLength(4)
    expect(screen.queryByRole('link', { name: /Vorige/ })).not.toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: /Volgende/ }))
    await screen.findByRole('link', { name: /Vorige/ })
    expect(within(main()).getAllByRole('article')).toHaveLength(4)
  })

  it('never shows the previous collection while another one loads', async () => {
    const base = createMockShopRepository({ latencyMs: 0 })
    const getCollection: typeof base.getCollection = async (query) => {
      if (query.handle === 'laadpoorten') await new Promise((resolve) => setTimeout(resolve, 80))
      return base.getCollection(query)
    }
    const user = userEvent.setup()
    renderApp('/collections/schermen', createTestServices({ shop: { ...base, getCollection } }))
    await screen.findByRole('heading', { level: 1, name: 'Schermen' })

    const nav = screen.getByRole('navigation', { name: 'Hoofdnavigatie' })
    await user.click(within(nav).getByRole('link', { name: 'Laadpoorten' }))

    // Tijdens het laden: geen Schermen-titel of -producten meer, maar een laadstatus.
    expect(screen.queryByRole('heading', { level: 1, name: 'Schermen' })).not.toBeInTheDocument()
    expect(within(main()).queryAllByRole('article')).toHaveLength(0)
    expect(await screen.findByRole('heading', { level: 1, name: 'Laadpoorten' })).toBeInTheDocument()
    expect(within(main()).getAllByRole('article')).toHaveLength(3)
  })

  it('redirects /collections to all products', async () => {
    renderApp('/collections')
    expect(await screen.findByRole('heading', { level: 1, name: 'Alle producten' })).toBeInTheDocument()
  })
})

describe('product page', () => {
  it('shows the product with breadcrumb, tabs and related products', async () => {
    renderApp('/products/snellader-20w-usb-c')
    expect(await screen.findByRole('heading', { level: 1, name: 'Snellader 20W USB-C' })).toBeInTheDocument()

    const crumbs = screen.getByRole('navigation', { name: 'Kruimelpad' })
    expect(within(crumbs).getByRole('link', { name: 'Accessoires' })).toHaveAttribute('href', '/collections/accessoires')
    expect(screen.getByRole('tab', { name: 'Beschrijving' })).toBeInTheDocument()

    const related = await screen.findByRole('heading', { name: 'Gerelateerde producten' })
    const cards = within(related.parentElement!).getAllByRole('article')
    expect(cards).toHaveLength(4)
    expect(within(related.parentElement!).queryByText('Snellader 20W USB-C')).not.toBeInTheDocument()
    expect(document.title).toBe('Snellader 20W USB-C – mooiprijsje.nl')
  })

  it('adds to the cart and opens the drawer', async () => {
    const user = userEvent.setup()
    renderApp('/products/snellader-20w-usb-c')
    await screen.findByRole('heading', { level: 1, name: 'Snellader 20W USB-C' })

    await user.click(within(main()).getByRole('button', { name: 'In winkelwagen' }))
    const drawer = screen.getByRole('dialog', { name: 'Winkelwagen' })
    await waitFor(() => expect(drawer).not.toHaveAttribute('inert'))
    expect(await within(drawer).findByText('Snellader 20W USB-C')).toBeInTheDocument()
  })

  it('shows a not-found message for an unknown product', async () => {
    renderApp('/products/bestaat-niet')
    expect(await screen.findByText('Dit product bestaat niet (meer).')).toBeInTheDocument()
  })

  it('shows an error with retry when loading fails', async () => {
    const base = createMockShopRepository({ latencyMs: 0 })
    const getProduct = vi.fn().mockRejectedValueOnce(new ShopApiError('kapot')).mockImplementation(base.getProduct)
    const user = userEvent.setup()
    renderApp('/products/snellader-20w-usb-c', createTestServices({ shop: { ...base, getProduct } }))

    await user.click(await screen.findByRole('button', { name: 'Opnieuw proberen' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Snellader 20W USB-C' })).toBeInTheDocument()
  })
})

describe('search page', () => {
  it('asks what you are looking for without a term', () => {
    renderApp('/search')
    expect(screen.getByText('Waar ben je naar op zoek?')).toBeInTheDocument()
  })

  it('shows the matching products and the count', async () => {
    renderApp('/search?q=batterij')
    expect(await screen.findByRole('heading', { level: 1, name: 'Zoekresultaten voor “batterij”' })).toBeInTheDocument()
    expect(await within(main()).findAllByRole('article')).toHaveLength(2)
    expect(screen.getByText('2 resultaten')).toBeInTheDocument()
  })

  it('shows a friendly message without results', async () => {
    renderApp('/search?q=zzzz')
    expect(await screen.findByText('Geen resultaten')).toBeInTheDocument()
  })

  it('does not show results of the previous term while a new search loads', async () => {
    const base = createMockShopRepository({ latencyMs: 0 })
    const searchProducts: typeof base.searchProducts = async (query) => {
      if (query.term === 'kabel') await new Promise((resolve) => setTimeout(resolve, 80))
      return base.searchProducts(query)
    }
    const user = userEvent.setup()
    renderApp('/search?q=batterij', createTestServices({ shop: { ...base, searchProducts } }))
    await within(main()).findAllByRole('article')

    await user.clear(screen.getByRole('searchbox'))
    await user.type(screen.getByRole('searchbox'), 'kabel{Enter}')

    expect(await screen.findByRole('heading', { level: 1, name: 'Zoekresultaten voor “kabel”' })).toBeInTheDocument()
    expect(within(main()).queryByText('Batterij iPhone 12')).not.toBeInTheDocument()
    expect(await within(main()).findByText('USB-C kabel gevlochten nylon')).toBeInTheDocument()
  })

  it('shows no old results when returning to the empty search page', async () => {
    const user = userEvent.setup()
    renderApp('/search?q=batterij')
    await within(main()).findAllByRole('article')

    await user.click(screen.getByRole('button', { name: 'Menu openen' }))
    await user.click(within(screen.getByRole('dialog', { name: 'Menu' })).getByRole('link', { name: 'Zoeken' }))

    expect(await screen.findByText('Waar ben je naar op zoek?')).toBeInTheDocument()
    expect(within(main()).queryAllByRole('article')).toHaveLength(0)
  })

  it('reports search failures', async () => {
    const shop = { ...createMockShopRepository({ latencyMs: 0 }), searchProducts: () => Promise.reject(new Error('x')) }
    renderApp('/search?q=kabel', createTestServices({ shop }))
    expect(await screen.findByText('Zoeken is niet gelukt.')).toBeInTheDocument()
  })
})

describe('contact page', () => {
  async function fillIn(user: ReturnType<typeof userEvent.setup>) {
    const page = within(main())
    await user.type(page.getByLabelText(/^Naam/), 'Lisa de Vries')
    await user.type(page.getByLabelText(/^E-mailadres/), 'lisa@voorbeeld.nl')
    await user.selectOptions(page.getByLabelText(/^Onderwerp/), 'Retour')
    await user.type(page.getByLabelText(/^Bericht/), 'Mijn scherm past niet, hoe retourneer ik het?')
  }

  it('shows the contact details and the FAQ', () => {
    renderApp('/pages/contact')
    expect(within(main()).getByRole('link', { name: 'info@mooiprijsje.nl' })).toHaveAttribute(
      'href',
      'mailto:info@mooiprijsje.nl',
    )
    expect(within(main()).getAllByRole('group').length).toBeGreaterThanOrEqual(6)
  })

  it('validates every field and marks the invalid ones', async () => {
    const user = userEvent.setup()
    const services = createTestServices()
    renderApp('/pages/contact', services)

    await user.click(within(main()).getByRole('button', { name: 'Bericht versturen' }))
    expect(await within(main()).findByText('Vul je naam in.')).toBeInTheDocument()
    expect(within(main()).getByText('Selecteer een onderwerp.')).toBeInTheDocument()
    expect(within(main()).getByLabelText(/^Naam/)).toHaveAttribute('aria-invalid', 'true')
    expect(within(main()).getByLabelText(/^Naam/)).toHaveAttribute('aria-required', 'true')
    expect(within(main()).getByLabelText(/^Naam/)).toHaveFocus()
    expect(services.forms.sendContactMessage).not.toHaveBeenCalled()
  })

  it('sends a valid message and confirms', async () => {
    const user = userEvent.setup()
    const services = createTestServices()
    renderApp('/pages/contact', services)

    await fillIn(user)
    await user.click(within(main()).getByRole('button', { name: 'Bericht versturen' }))

    const confirmation = await within(main()).findByText(/Je bericht is verstuurd/)
    expect(confirmation.closest('[role="status"]')).toHaveFocus()
    expect(services.forms.sendContactMessage).toHaveBeenCalledWith({
      name: 'Lisa de Vries',
      email: 'lisa@voorbeeld.nl',
      subject: 'Retour',
      message: 'Mijn scherm past niet, hoe retourneer ik het?',
    })
  })

  it('keeps the form and shows the error when sending fails', async () => {
    const user = userEvent.setup()
    const services = createTestServices()
    services.forms.sendContactMessage = () => Promise.reject(new ShopApiError('Geen verbinding.'))
    renderApp('/pages/contact', services)

    await fillIn(user)
    await user.click(within(main()).getByRole('button', { name: 'Bericht versturen' }))

    expect(await within(main()).findByRole('alert')).toHaveTextContent('Geen verbinding.')
    expect(within(main()).getByLabelText(/^Naam/)).toHaveValue('Lisa de Vries')
  })
})

describe('content pages', () => {
  it('renders the about page', () => {
    renderApp('/pages/over-ons')
    expect(screen.getByRole('heading', { level: 1, name: 'Over mooiprijsje.nl' })).toBeInTheDocument()
    expect(screen.getByText('10.000+')).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 3 }).length).toBeGreaterThanOrEqual(3)
  })

  it.each([
    ['/pages/veelgestelde-vragen', 'Veelgestelde vragen', 'Hoe lang duurt de levering?'],
    ['/pages/verzending', 'Verzending & levering', 'Standaard levering: 1–2 werkdagen via PostNL'],
    ['/pages/retourbeleid', 'Retourbeleid', '14 dagen retourrecht na ontvangst'],
    ['/policies/privacy-policy', 'Privacybeleid', /demo-modus/],
    ['/policies/terms-of-service', 'Algemene voorwaarden', /demo-modus/],
  ])('renders %s', (route, title, text) => {
    renderApp(route)
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument()
    expect(within(main()).getByText(text)).toBeInTheDocument()
  })

  it('sets a sensible tab title for unknown pages', () => {
    renderApp('/policies/onbekend')
    expect(document.title).toBe('Pagina niet gevonden – mooiprijsje.nl')
  })

  it('links to the shop policy when a shop is connected', () => {
    renderApp('/policies/privacy-policy', createTestServices({ meta: { isDemo: false, accountUrl: 'https://shop.example/account' } }))
    expect(within(main()).getByRole('link', { name: 'bekijk het volledige document' })).toHaveAttribute(
      'href',
      'https://shop.example/policies/privacy-policy',
    )
  })

  it.each([
    '/policies/onbekend',
    '/policies/constructor',
    '/policies/__proto__',
    '/policies/toString',
    '/nergens',
    '/pages/bestaat-niet',
  ])('shows not found for %s', (route) => {
    renderApp(route)
    expect(screen.getByText('Niet gevonden')).toBeInTheDocument()
  })
})
