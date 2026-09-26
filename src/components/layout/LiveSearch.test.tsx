import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes, useLocation } from 'react-router-dom'
import { ShopApiError } from '@/data/errors'
import { createMockShopRepository } from '@/data/mock/mockShopRepository'
import { createTestServices, renderWithProviders } from '@/test/utils'
import { LiveSearch } from './LiveSearch'

function LocationProbe() {
  const { pathname, search } = useLocation()
  return <div data-testid="location">{pathname + search}</div>
}

function renderSearch(services = createTestServices()) {
  return renderWithProviders(
    <Routes>
      <Route
        path="*"
        element={
          <>
            <LiveSearch variant="desktop" initialTerm="" />
            <button type="button">ergens anders</button>
            <LocationProbe />
          </>
        }
      />
    </Routes>,
    { services },
  )
}

const input = () => screen.getByRole('combobox', { name: 'Zoeken' })
const location = () => screen.getByTestId('location')

describe('LiveSearch', () => {
  it('shows popular categories when the empty box gets focus', async () => {
    const user = userEvent.setup()
    renderSearch()

    await user.click(input())
    expect(screen.getByText('Populaire categorieën')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Schermen/ })).toHaveAttribute('href', '/collections/schermen')
  })

  it('suggests matching products with their price while typing', async () => {
    const user = userEvent.setup()
    renderSearch()

    await user.type(input(), 'batterij')
    const listbox = await screen.findByRole('listbox', { name: 'Zoeksuggesties' })
    const option = within(listbox).getByRole('option', { name: /Batterij iPhone 12/ })
    expect(within(option).getByText('Batterij', { selector: 'mark' })).toBeInTheDocument()
    expect(option).toHaveTextContent('€ 29,95')
    expect(input()).toHaveAttribute('aria-expanded', 'true')
    expect(await screen.findByRole('status')).toHaveTextContent(/resultaten gevonden/)
  })

  it('opens the chosen product with the arrow keys and Enter', async () => {
    const user = userEvent.setup()
    renderSearch()

    await user.type(input(), 'batterij')
    const first = (await screen.findAllByRole('option'))[0]!
    await user.keyboard('{ArrowDown}')
    expect(first).toHaveAttribute('aria-selected', 'true')
    expect(input()).toHaveAttribute('aria-activedescendant', first.id)

    await user.keyboard('{Enter}')
    expect(location()).toHaveTextContent(/^\/products\//)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('wraps around from the first option to "all results" with ArrowUp', async () => {
    const user = userEvent.setup()
    renderSearch()

    await user.type(input(), 'iphone')
    const options = await screen.findAllByRole('option')
    await user.keyboard('{ArrowUp}')
    expect(options.at(-1)).toHaveAttribute('aria-selected', 'true')
    expect(options.at(-1)).toHaveTextContent(/Bekijk alle \d+ resultaten voor “iphone”/)

    await user.keyboard('{Enter}')
    expect(location()).toHaveTextContent('/search?q=iphone')
  })

  it('still searches the full term when no suggestion is selected', async () => {
    const user = userEvent.setup()
    renderSearch()

    await user.type(input(), 'usb c{Enter}')
    expect(location()).toHaveTextContent('/search?q=usb%20c')
  })

  it('helps further with categories when nothing is found', async () => {
    const user = userEvent.setup()
    renderSearch()

    await user.type(input(), 'zzzz')
    expect(await screen.findByText(/Geen producten gevonden voor/)).toHaveTextContent('“zzzz”')
    expect(screen.getByRole('link', { name: /Laadpoorten/ })).toBeInTheDocument()
  })

  it('does not search for a single character', async () => {
    const base = createMockShopRepository({ latencyMs: 0 })
    const searchProducts = vi.fn(base.searchProducts)
    const user = userEvent.setup()
    renderSearch(createTestServices({ shop: { ...base, searchProducts } }))

    await user.type(input(), 'a')
    await new Promise((resolve) => setTimeout(resolve, 300))
    expect(searchProducts).not.toHaveBeenCalled()
    expect(screen.getByText('Populaire categorieën')).toBeInTheDocument()
  })

  it('closes the suggestions with Escape but keeps the term', async () => {
    const user = userEvent.setup()
    renderSearch()

    await user.type(input(), 'kabel')
    await screen.findByRole('listbox')
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(input()).toHaveValue('kabel')
    expect(input()).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes the suggestions when clicking elsewhere', async () => {
    const user = userEvent.setup()
    renderSearch()

    await user.type(input(), 'kabel')
    await screen.findByRole('listbox')
    await user.click(screen.getByRole('button', { name: 'ergens anders' }))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('shows an error with a retry when searching fails', async () => {
    const base = createMockShopRepository({ latencyMs: 0 })
    const searchProducts = vi.fn().mockRejectedValueOnce(new ShopApiError('kapot')).mockImplementation(base.searchProducts)
    const user = userEvent.setup()
    renderSearch(createTestServices({ shop: { ...base, searchProducts } }))

    await user.type(input(), 'kabel')
    expect(await screen.findByText('Zoeken lukt nu even niet.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Opnieuw proberen' }))
    expect(await screen.findByRole('listbox')).toBeInTheDocument()
  })
})
