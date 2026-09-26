import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '@/context/CartContext'
import { ShopApiError } from '@/data/errors'
import { MOCK_PRODUCTS } from '@/data/mock/catalog'
import { createMockCartRepository } from '@/data/mock/mockCartRepository'
import { createTestServices, renderWithProviders } from '@/test/utils'
import { AnnouncementBar } from './AnnouncementBar'
import { Layout } from './Layout'

const chargerVariantId = MOCK_PRODUCTS.find((p) => p.handle === 'snellader-20w-usb-c')!.variants[0]!.id

function AddButton() {
  const { addItem } = useCart()
  return <button onClick={() => void addItem(chargerVariantId)}>voeg toe</button>
}

function NavigateButton() {
  const navigate = useNavigate()
  return <button onClick={() => navigate('/elders')}>ga elders heen</button>
}

function LocationProbe() {
  const { pathname, search } = useLocation()
  return <div data-testid="location">{pathname + search}</div>
}

function renderLayout(route = '/', services = createTestServices()) {
  return renderWithProviders(
    <Routes>
      <Route element={<Layout />}>
        <Route
          index
          element={
            <>
              <AddButton />
              <NavigateButton />
              <LocationProbe />
            </>
          }
        />
        <Route path="*" element={<LocationProbe />} />
      </Route>
    </Routes>,
    { route, services },
  )
}

describe('AnnouncementBar', () => {
  it('shows the ticker and can be dismissed for the session', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AnnouncementBar />)

    // De ticker staat twee keer in de DOM voor een naadloze lus.
    expect(screen.getAllByText('Gratis verzending')).toHaveLength(2)
    expect(screen.getByText('Altijd op tijd, altijd met korting')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Sluit aankondiging' }))
    expect(screen.queryByRole('region', { name: 'Aankondiging' })).not.toBeInTheDocument()
    expect(window.sessionStorage.getItem('mp-announcement-dismissed')).toBe('1')
  })

  it('stays hidden once dismissed', () => {
    window.sessionStorage.setItem('mp-announcement-dismissed', '1')
    renderWithProviders(<AnnouncementBar />)
    expect(screen.queryByRole('region', { name: 'Aankondiging' })).not.toBeInTheDocument()
  })
})

describe('Header search', () => {
  it('navigates to the search page with the encoded term', async () => {
    const user = userEvent.setup()
    renderLayout()

    await user.type(screen.getByRole('combobox'), 'iphone 13{Enter}')
    expect(screen.getByTestId('location')).toHaveTextContent('/search?q=iphone%2013')
  })

  it('ignores an empty search', async () => {
    const user = userEvent.setup()
    renderLayout()

    await user.type(screen.getByRole('combobox'), '   {Enter}')
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/)
  })

  it('prefills the box with the current search term', () => {
    renderLayout('/search?q=batterij')
    expect(screen.getByRole('combobox')).toHaveValue('batterij')
  })

  it('opens the mobile search overlay and focuses the input', async () => {
    const user = userEvent.setup()
    renderLayout()

    await user.click(screen.getByRole('button', { name: 'Zoeken openen' }))
    const searchboxes = screen.getAllByRole('combobox')
    expect(searchboxes).toHaveLength(2)
    expect(searchboxes[1]).toHaveFocus()
  })
})

describe('mobile navigation', () => {
  it('opens with the burger, traps focus semantics and closes with Escape', async () => {
    const user = userEvent.setup()
    renderLayout()
    const dialog = screen.getByRole('dialog', { name: 'Menu' })
    const burger = screen.getByRole('button', { name: 'Menu openen' })
    expect(dialog).toHaveAttribute('inert')

    await user.click(burger)
    expect(dialog).not.toHaveAttribute('inert')
    expect(within(dialog).getByRole('button', { name: 'Menu sluiten' })).toHaveFocus()
    expect(document.body).toHaveClass('is-scroll-locked')

    await user.keyboard('{Escape}')
    expect(dialog).toHaveAttribute('inert')
    expect(burger).toHaveFocus()
    expect(document.body).not.toHaveClass('is-scroll-locked')
  })

  it('returns focus to the search button when the mobile search is closed with Escape', async () => {
    const user = userEvent.setup()
    renderLayout()
    const toggle = screen.getByRole('button', { name: 'Zoeken openen' })

    await user.click(toggle)
    await user.keyboard('{Escape}')
    expect(toggle).toHaveFocus()
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes after choosing a link', async () => {
    const user = userEvent.setup()
    renderLayout()
    const dialog = screen.getByRole('dialog', { name: 'Menu' })

    await user.click(screen.getByRole('button', { name: 'Menu openen' }))
    await user.click(within(dialog).getByRole('link', { name: 'Schermen' }))
    expect(dialog).toHaveAttribute('inert')
  })

  it('shows the account link only when a shop is connected', () => {
    const { unmount } = renderLayout()
    expect(screen.queryByRole('link', { name: /account/i })).not.toBeInTheDocument()
    unmount()

    renderLayout('/', createTestServices({ meta: { isDemo: false, accountUrl: 'https://shop.example/account' } }))
    expect(screen.getAllByRole('link', { name: /account/i })[0]).toHaveAttribute('href', 'https://shop.example/account')
  })
})

describe('cart drawer', () => {
  it('starts closed and empty', () => {
    renderLayout()
    expect(screen.getByRole('dialog', { name: 'Winkelwagen' })).toHaveAttribute('inert')
    expect(screen.getByText('Je winkelwagen is leeg.')).toBeInTheDocument()
  })

  it('opens after adding, shows the line and updates the header badge', async () => {
    const user = userEvent.setup()
    renderLayout()

    await user.click(screen.getByText('voeg toe'))
    const drawer = await screen.findByRole('dialog', { name: 'Winkelwagen' })

    expect(await within(drawer).findByText('Snellader 20W USB-C')).toBeInTheDocument()
    expect(drawer).not.toHaveAttribute('inert')
    expect(screen.getByRole('button', { name: 'Winkelwagen, 1 artikelen' })).toBeInTheDocument()
  })

  it('changes quantities and removes lines', async () => {
    const user = userEvent.setup()
    renderLayout()
    await user.click(screen.getByText('voeg toe'))
    const drawer = await screen.findByRole('dialog', { name: 'Winkelwagen' })
    await within(drawer).findByText('Snellader 20W USB-C')

    await user.click(within(drawer).getByRole('button', { name: 'Meer' }))
    expect(await within(drawer).findAllByText(/35,98/)).toHaveLength(2)

    await user.click(within(drawer).getByRole('button', { name: 'Verwijder Snellader 20W USB-C' }))
    expect(await within(drawer).findByText('Je winkelwagen is leeg.')).toBeInTheDocument()
  })

  it('closes with Escape and the close button', async () => {
    const user = userEvent.setup()
    renderLayout()
    await user.click(screen.getByText('voeg toe'))
    const drawer = await screen.findByRole('dialog', { name: 'Winkelwagen' })
    await within(drawer).findByText('Snellader 20W USB-C')

    await user.keyboard('{Escape}')
    expect(drawer).toHaveAttribute('inert')

    await user.click(screen.getByRole('button', { name: /^Winkelwagen, \d+ artikelen$/ }))
    expect(drawer).not.toHaveAttribute('inert')
    await user.click(within(drawer).getByRole('button', { name: 'Winkelwagen sluiten' }))
    expect(drawer).toHaveAttribute('inert')
  })

  it('pulls a stray Tab back into the open drawer', async () => {
    const user = userEvent.setup()
    renderLayout()
    await user.click(screen.getByText('voeg toe'))
    const drawer = await screen.findByRole('dialog', { name: 'Winkelwagen' })
    await within(drawer).findByText('Snellader 20W USB-C')

    // Bijv. nadat het gefocuste element (een knop die net verdween) niet meer bestaat.
    ;(document.activeElement as HTMLElement).blur()
    await user.keyboard('{Tab}')
    expect(drawer.contains(document.activeElement)).toBe(true)
    expect(document.activeElement).not.toBe(drawer)
  })

  it('closes when the route changes', async () => {
    const user = userEvent.setup()
    renderLayout()
    await user.click(screen.getByText('voeg toe'))
    const drawer = await screen.findByRole('dialog', { name: 'Winkelwagen' })
    expect(drawer).not.toHaveAttribute('inert')

    await user.click(screen.getByText('ga elders heen'))
    expect(drawer).toHaveAttribute('inert')
  })

  it('disables checkout in demo mode', async () => {
    const user = userEvent.setup()
    renderLayout()
    await user.click(screen.getByText('voeg toe'))
    const drawer = await screen.findByRole('dialog', { name: 'Winkelwagen' })

    expect(await within(drawer).findByRole('button', { name: /Afrekenen/ })).toBeDisabled()
  })

  it('links to the real checkout when the shop provides one', async () => {
    const base = createMockCartRepository()
    const services = createTestServices({
      cart: {
        ...base,
        addLine: async (...args) => ({ ...(await base.addLine(...args)), checkoutUrl: 'https://shop.example/checkout/abc' }),
      },
    })
    const user = userEvent.setup()
    renderLayout('/', services)

    await user.click(screen.getByText('voeg toe'))
    const drawer = await screen.findByRole('dialog', { name: 'Winkelwagen' })
    expect(await within(drawer).findByRole('link', { name: 'Naar afrekenen' })).toHaveAttribute(
      'href',
      'https://shop.example/checkout/abc',
    )
  })

  it('keeps the drawer closed and records the error when adding fails', async () => {
    const user = userEvent.setup()
    const services = createTestServices()
    services.cart.addLine = () => Promise.reject(new ShopApiError('Dit product is helaas niet beschikbaar.'))
    renderLayout('/', services)
    const drawer = screen.getByRole('dialog', { name: 'Winkelwagen' })

    await user.click(screen.getByText('voeg toe'))
    expect(await within(drawer).findByRole('alert')).toHaveTextContent('niet beschikbaar')
    expect(drawer).toHaveAttribute('inert')
  })
})

describe('footer', () => {
  it('lists the service and shop links', () => {
    renderLayout()
    const footer = screen.getByRole('contentinfo')
    expect(within(footer).getByRole('link', { name: 'Retourbeleid' })).toHaveAttribute('href', '/pages/retourbeleid')
    expect(within(footer).getByRole('link', { name: 'Alle producten' })).toHaveAttribute('href', '/collections/all')
    expect(within(footer).getByRole('link', { name: 'Privacybeleid' })).toHaveAttribute('href', '/policies/privacy-policy')
  })

  it('validates and submits the newsletter form', async () => {
    const user = userEvent.setup()
    const services = createTestServices()
    renderLayout('/', services)
    const footer = screen.getByRole('contentinfo')

    await user.type(within(footer).getByLabelText('E-mailadres'), 'geen-email')
    await user.click(within(footer).getByRole('button', { name: 'Inschrijven' }))
    expect(await within(footer).findByRole('alert')).toHaveTextContent('Vul een geldig e-mailadres in.')
    expect(services.forms.subscribeNewsletter).not.toHaveBeenCalled()

    await user.clear(within(footer).getByLabelText('E-mailadres'))
    await user.type(within(footer).getByLabelText('E-mailadres'), 'jij@voorbeeld.nl')
    await user.click(within(footer).getByRole('button', { name: 'Inschrijven' }))
    expect(await within(footer).findByText(/Bedankt voor je inschrijving/)).toBeInTheDocument()
    expect(services.forms.subscribeNewsletter).toHaveBeenCalledWith('jij@voorbeeld.nl')
  })

  it('shows the demo banner in demo mode only', () => {
    const { unmount } = renderLayout()
    expect(screen.getByRole('note')).toHaveTextContent('Demo-modus')
    unmount()

    renderLayout('/', createTestServices({ meta: { isDemo: false, accountUrl: null } }))
    expect(screen.queryByRole('note')).not.toBeInTheDocument()
  })
})
