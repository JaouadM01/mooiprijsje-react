import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { FilterSidebar } from '@/components/collection/FilterSidebar'
import { Pagination } from '@/components/collection/Pagination'
import { createMockShopRepository, toProductSummary } from '@/data/mock/mockShopRepository'
import type { CollectionFilter, CollectionQuery, Product } from '@/types/shop'
import { createTestServices, renderWithProviders } from '@/test/utils'
import { ProductCard } from './ProductCard'
import { ProductGallery } from './ProductGallery'
import { ProductInfo } from './ProductInfo'
import { ProductTabs } from './ProductTabs'

const repo = createMockShopRepository({ latencyMs: 0 })
const load = async (handle: string): Promise<Product> => (await repo.getProduct(handle))!

describe('ProductCard', () => {
  it('shows a sale badge, the old price and adds the default variant to the cart', async () => {
    const user = userEvent.setup()
    const product = await load('iphone-13-oled-scherm')
    const services = createTestServices()
    const addLine = vi.spyOn(services.cart, 'addLine')
    renderWithProviders(<ProductCard product={toProductSummary(product)} />, { services })

    expect(screen.getByText('−18%')).toBeInTheDocument()
    expect(screen.getByText(/89,95/)).toBeInTheDocument()
    expect(screen.getByText(/109,95/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: product.title })).toHaveAttribute('href', `/products/${product.handle}`)

    await user.click(screen.getByRole('button', { name: `${product.title} in winkelwagen` }))
    expect(addLine).toHaveBeenCalledWith(null, product.variants[0]?.id, 1)
  })

  it('disables the button for sold-out products', async () => {
    const product = await load('samsung-galaxy-a54-scherm')
    renderWithProviders(<ProductCard product={toProductSummary(product)} />)

    expect(screen.getAllByText('Uitverkocht').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: `${product.title} is uitverkocht` })).toBeDisabled()
  })

  it('shows an inline error when adding fails', async () => {
    const user = userEvent.setup()
    const product = await load('snellader-20w-usb-c')
    const services = createTestServices()
    services.cart.addLine = () => Promise.reject(new Error('boom'))
    renderWithProviders(<ProductCard product={toProductSummary(product)} />, { services })

    await user.click(screen.getByRole('button', { name: /in winkelwagen/ }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Toevoegen is niet gelukt.')
  })

  it('renders a placeholder when there is no image', async () => {
    const product = { ...toProductSummary(await load('snellader-20w-usb-c')), image: null, hoverImage: null }
    renderWithProviders(<ProductCard product={product} />)
    // De afbeelding zit in een aria-hidden link; de titellink beschrijft de kaart al.
    expect(screen.getByRole('img', { name: 'Geen afbeelding beschikbaar', hidden: true })).toBeInTheDocument()
  })
})

describe('ProductInfo', () => {
  it('starts on the first available variant and updates price and stock per selection', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductInfo product={await load('usb-c-kabel-gevlochten')} />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('USB-C kabel gevlochten nylon')
    expect(screen.getByText(/5,99/)).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Op voorraad')

    await user.click(screen.getByLabelText('2m'))
    expect(screen.getByText(/7,99/)).toBeInTheDocument()

    // Wit + 2m bestaat wel maar is uitverkocht; het label van "Wit" krijgt dan een toevoeging.
    await user.click(screen.getByLabelText(/^Wit/))
    expect(screen.getByRole('status')).toHaveTextContent('Uitverkocht')
    expect(screen.getByRole('button', { name: 'Uitverkocht' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Direct kopen' })).toBeDisabled()
  })

  it('flags option values that only exist as sold-out combinations', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductInfo product={await load('usb-c-kabel-gevlochten')} />)
    await user.click(screen.getByLabelText('Wit'))
    expect(screen.getByText('(uitverkocht)')).toBeInTheDocument()
  })

  it('adds the chosen variant and quantity to the cart', async () => {
    const user = userEvent.setup()
    const product = await load('snellader-20w-usb-c')
    const services = createTestServices()
    const addLine = vi.spyOn(services.cart, 'addLine')
    renderWithProviders(<ProductInfo product={product} />, { services })

    await user.click(screen.getByRole('button', { name: 'Meer' }))
    await user.click(screen.getByRole('button', { name: 'Meer' }))
    await user.click(screen.getByRole('button', { name: 'In winkelwagen' }))

    expect(addLine).toHaveBeenCalledWith(null, product.variants[0]?.id, 3)
  })

  it('keeps the quantity within bounds', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductInfo product={await load('snellader-20w-usb-c')} />)

    const input = screen.getByLabelText('Aantal')
    expect(screen.getByRole('button', { name: 'Minder' })).toBeDisabled()

    await user.clear(input)
    await user.type(input, '500')
    expect(input).toHaveValue(99)
    expect(screen.getByRole('button', { name: 'Meer' })).toBeDisabled()
  })

  it('lets you clear the quantity to type a new one and restores a valid value on blur', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductInfo product={await load('snellader-20w-usb-c')} />)
    const input = screen.getByLabelText('Aantal')

    await user.clear(input)
    expect(input).toHaveValue(null)
    await user.type(input, '5')
    expect(input).toHaveValue(5)

    await user.clear(input)
    await user.tab()
    expect(input).toHaveValue(5)
  })

  it('warns about low stock with the remaining amount', async () => {
    renderWithProviders(<ProductInfo product={await load('draadloze-oordopjes')} />)
    expect(screen.getByRole('status')).toHaveTextContent('Laag op voorraad: nog 4 stuks')
    expect(screen.getByText('Bespaar 25%')).toBeInTheDocument()
  })

  it('hides the variant selector for single-variant products and lists the benefits', async () => {
    renderWithProviders(<ProductInfo product={await load('snellader-20w-usb-c')} />)
    expect(screen.queryByRole('group')).not.toBeInTheDocument()
    expect(within(screen.getByRole('list', { name: 'Voordelen' })).getAllByRole('listitem')).toHaveLength(4)
  })

  it('shows the cart error message when adding fails', async () => {
    const user = userEvent.setup()
    const services = createTestServices()
    services.cart.addLine = () => Promise.reject(new Error('boom'))
    renderWithProviders(<ProductInfo product={await load('snellader-20w-usb-c')} />, { services })

    await user.click(screen.getByRole('button', { name: 'In winkelwagen' }))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })

  it('sanitizes the short description', async () => {
    const product: Product = {
      ...(await load('snellader-20w-usb-c')),
      shortDescriptionHtml: '<p>Veilig</p><img src=x onerror="alert(1)"><script>alert(2)</script>',
    }
    const { container } = renderWithProviders(<ProductInfo product={product} />)
    expect(container.querySelector('script')).toBeNull()
    expect(container.querySelector('[onerror]')).toBeNull()
    expect(screen.getByText('Veilig')).toBeInTheDocument()
  })
})

describe('ProductTabs', () => {
  it('shows the description first and switches panels on click', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductTabs product={await load('snellader-20w-usb-c')} />)

    expect(screen.getByRole('tabpanel', { name: 'Beschrijving' })).toHaveTextContent('Compacte 20W-lader')

    await user.click(screen.getByRole('tab', { name: 'Specificaties' }))
    const specs = screen.getByRole('tabpanel', { name: 'Specificaties' })
    expect(within(specs).getByRole('row', { name: /Vermogen/ })).toHaveTextContent('20W')
    expect(screen.queryByRole('tabpanel', { name: 'Beschrijving' })).not.toBeInTheDocument()
  })

  it('falls back to default specifications, FAQ and shipping text', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductTabs product={await load('usb-c-laadpoort-pixel-7')} />)

    await user.click(screen.getByRole('tab', { name: 'Specificaties' }))
    expect(screen.getByText('12 maanden fabrieksgarantie')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Veelgestelde vragen' }))
    expect(screen.getByText('Past dit product op mijn toestel?')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Verzending & Retour' }))
    expect(screen.getByText('14 dagen retourrecht na ontvangst')).toBeInTheDocument()
  })

  it('supports arrow keys, Home and End (roving tabindex)', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductTabs product={await load('snellader-20w-usb-c')} />)

    screen.getByRole('tab', { name: 'Beschrijving' }).focus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Specificaties' })).toHaveFocus()
    expect(screen.getByRole('tab', { name: 'Specificaties' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Beschrijving' })).toHaveAttribute('tabindex', '-1')

    await user.keyboard('{End}')
    expect(screen.getByRole('tab', { name: 'Verzending & Retour' })).toHaveFocus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Beschrijving' })).toHaveFocus()
    await user.keyboard('{ArrowLeft}')
    expect(screen.getByRole('tab', { name: 'Verzending & Retour' })).toHaveFocus()
    await user.keyboard('{Home}')
    expect(screen.getByRole('tab', { name: 'Beschrijving' })).toHaveFocus()
  })

  it('uses metafield content when the product provides it', async () => {
    const product: Product = {
      ...(await load('snellader-20w-usb-c')),
      faqHtml: '<p>Eigen FAQ-tekst</p>',
      descriptionHtml: '   ',
    }
    const user = userEvent.setup()
    renderWithProviders(<ProductTabs product={product} />)

    expect(screen.getByText('Voor dit product is nog geen beschrijving beschikbaar.')).toBeInTheDocument()
    await user.click(screen.getByRole('tab', { name: 'Veelgestelde vragen' }))
    expect(screen.getByText('Eigen FAQ-tekst')).toBeInTheDocument()
  })
})

describe('ProductGallery', () => {
  const images = [
    { url: 'https://cdn/1.jpg', altText: 'voor' },
    { url: 'https://cdn/2.jpg', altText: 'achter' },
  ]

  it('switches the main image with the thumbnails', async () => {
    const user = userEvent.setup()
    render(<ProductGallery images={images} title="Kabel" />)

    expect(screen.getByAltText('voor')).toHaveAttribute('src', 'https://cdn/1.jpg')
    await user.click(screen.getByRole('button', { name: 'Afbeelding 2 bekijken' }))
    expect(screen.getByAltText('achter')).toHaveAttribute('src', 'https://cdn/2.jpg')
    expect(screen.getByRole('button', { name: 'Afbeelding 2 bekijken' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('has no thumbnails for a single image and a placeholder for none', () => {
    const { rerender } = render(<ProductGallery images={[images[0]!]} title="Kabel" />)
    expect(screen.queryByRole('list', { name: 'Productafbeeldingen' })).not.toBeInTheDocument()

    rerender(<ProductGallery images={[]} title="Kabel" />)
    expect(screen.getByRole('img', { name: 'Geen afbeelding beschikbaar' })).toBeInTheDocument()
  })

  it('falls back to the product title when an image has no alt text', () => {
    render(<ProductGallery images={[{ url: 'https://cdn/x.jpg', altText: null }]} title="Kabel" />)
    expect(screen.getByAltText('Kabel')).toBeInTheDocument()
  })
})

describe('FilterSidebar', () => {
  const filters: CollectionFilter[] = [
    {
      id: 'vendor',
      label: 'Merk',
      type: 'LIST',
      priceRangeMax: null,
      values: [
        { id: 'a', label: 'Apple', count: 3, input: '{"productVendor":"Apple"}' },
        { id: 's', label: 'Samsung', count: 0, input: '{"productVendor":"Samsung"}' },
      ],
    },
    { id: 'price', label: 'Prijs', type: 'PRICE_RANGE', values: [], priceRangeMax: 150 },
  ]
  const none: Pick<CollectionQuery, 'filters' | 'priceMin' | 'priceMax'> = { filters: [], priceMin: null, priceMax: null }

  function setup(active = none) {
    const onChange = vi.fn()
    const onClose = vi.fn()
    render(<FilterSidebar filters={filters} active={active} isOpen={false} onClose={onClose} onChange={onChange} />)
    return { onChange, onClose, user: userEvent.setup() }
  }

  it('adds and removes list filters', async () => {
    const { onChange, user } = setup()
    await user.click(screen.getByRole('checkbox', { name: /Apple/ }))
    expect(onChange).toHaveBeenCalledWith({ f: ['{"productVendor":"Apple"}'] })
  })

  it('reflects active filters and lets you remove them', async () => {
    const { onChange, user } = setup({ filters: ['{"productVendor":"Apple"}'], priceMin: null, priceMax: null })
    const apple = screen.getByRole('checkbox', { name: /Apple/ })
    expect(apple).toBeChecked()
    await user.click(apple)
    expect(onChange).toHaveBeenCalledWith({ f: [] })
  })

  it('disables values without results', () => {
    setup()
    expect(screen.getByRole('checkbox', { name: /Samsung/ })).toBeDisabled()
  })

  it('applies a price range', async () => {
    const { onChange, user } = setup()
    await user.type(screen.getByLabelText(/Min/), '10')
    await user.type(screen.getByLabelText(/Max/), '50')
    await user.click(screen.getByRole('button', { name: 'Toepassen' }))
    expect(onChange).toHaveBeenCalledWith({ price_min: '10', price_max: '50' })
  })

  it('uses the highest price as placeholder and clears empty bounds', async () => {
    const { onChange, user } = setup()
    expect(screen.getByLabelText(/Max/)).toHaveAttribute('placeholder', '150')
    await user.click(screen.getByRole('button', { name: 'Toepassen' }))
    expect(onChange).toHaveBeenCalledWith({ price_min: null, price_max: null })
  })

  it('does not offer to clear filters when none are active', () => {
    setup()
    expect(screen.queryByRole('button', { name: 'Wis filters' })).not.toBeInTheDocument()
  })

  it('clears list filters and the price range together', async () => {
    const { onChange, user } = setup({ filters: ['{"available":true}'], priceMin: 5, priceMax: null })
    await user.click(screen.getByRole('button', { name: 'Wis filters' }))
    expect(onChange).toHaveBeenCalledWith({ f: null, price_min: null, price_max: null })
  })

  it('collapses a filter group', async () => {
    const { user } = setup()
    const toggle = screen.getByRole('button', { name: 'Merk' })
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('checkbox', { name: /Apple/ })).not.toBeInTheDocument()
  })
})

describe('Pagination', () => {
  it('renders nothing without other pages', () => {
    const { container } = render(<Pagination previousTo={null} nextTo={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('links to the previous and next page', () => {
    render(
      <MemoryRouter>
        <Pagination previousTo="?before=3" nextTo="?after=9" />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: /Vorige/ })).toHaveAttribute('href', '/?before=3')
    expect(screen.getByRole('link', { name: /Volgende/ })).toHaveAttribute('href', '/?after=9')
  })

  it('moves focus to the main content when a page link is used', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <main id="MainContent" tabIndex={-1}>
          <Pagination previousTo={null} nextTo="?after=9" />
        </main>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('link', { name: /Volgende/ }))
    expect(screen.getByRole('main')).toHaveFocus()
  })

  it('only shows the available direction', () => {
    render(
      <MemoryRouter>
        <Pagination previousTo={null} nextTo="?after=9" />
      </MemoryRouter>,
    )
    expect(screen.queryByRole('link', { name: /Vorige/ })).not.toBeInTheDocument()
  })
})
