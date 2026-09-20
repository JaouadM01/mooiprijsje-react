import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ServicesProvider } from './ServicesContext'
import { CartProvider, useCart } from './CartContext'
import { MOCK_PRODUCTS } from '@/data/mock/catalog'
import { createTestServices } from '@/test/utils'

const variantOf = (handle: string) => MOCK_PRODUCTS.find((p) => p.handle === handle)!.variants[0]!.id
const charger = variantOf('snellader-20w-usb-c')
const soldOut = variantOf('samsung-galaxy-a54-scherm')

function Probe({ variantId }: { variantId: string }) {
  const cart = useCart()
  return (
    <div>
      <span data-testid="count">{cart.totalQuantity}</span>
      <span data-testid="open">{String(cart.isOpen)}</span>
      <span data-testid="error">{cart.error ?? ''}</span>
      <span data-testid="subtotal">{cart.cart?.subtotal.amount ?? 0}</span>
      <button onClick={() => void cart.addItem(variantId)}>add</button>
      <button onClick={() => void cart.updateQuantity(variantId, 3)}>set3</button>
      <button onClick={() => void cart.removeItem(variantId)}>remove</button>
      <button onClick={cart.closeCart}>close</button>
    </div>
  )
}

function setup(variantId = charger, services = createTestServices()) {
  render(
    <ServicesProvider services={services}>
      <CartProvider>
        <Probe variantId={variantId} />
      </CartProvider>
    </ServicesProvider>,
  )
  return { services, user: userEvent.setup() }
}

describe('CartProvider', () => {
  it('adds an item, updates the count and opens the drawer', async () => {
    const { user } = setup()
    await user.click(screen.getByText('add'))
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('1'))
    expect(screen.getByTestId('open')).toHaveTextContent('true')
    expect(window.localStorage.getItem('mp-cart-id')).toBe('mock-cart')
  })

  it('updates and removes lines', async () => {
    const { user } = setup()
    await user.click(screen.getByText('add'))
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('1'))

    await user.click(screen.getByText('set3'))
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('3'))

    await user.click(screen.getByText('remove'))
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('0'))
  })

  it('closes the drawer on request', async () => {
    const { user } = setup()
    await user.click(screen.getByText('add'))
    await waitFor(() => expect(screen.getByTestId('open')).toHaveTextContent('true'))
    await user.click(screen.getByText('close'))
    expect(screen.getByTestId('open')).toHaveTextContent('false')
  })

  it('surfaces a friendly error and keeps the drawer closed when adding fails', async () => {
    const { user } = setup(soldOut)
    await user.click(screen.getByText('add'))
    await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('niet beschikbaar'))
    expect(screen.getByTestId('open')).toHaveTextContent('false')
    expect(screen.getByTestId('count')).toHaveTextContent('0')
  })

  it('restores a stored cart on mount', async () => {
    const services = createTestServices()
    await services.cart.addLine(null, charger, 2)
    window.localStorage.setItem('mp-cart-id', 'mock-cart')

    setup(charger, services)
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('2'))
  })

  it('forgets a stored cart id that no longer exists', async () => {
    window.localStorage.setItem('mp-cart-id', 'expired')
    setup()
    await waitFor(() => expect(window.localStorage.getItem('mp-cart-id')).toBeNull())
    expect(screen.getByTestId('count')).toHaveTextContent('0')
  })

  it('reports a load failure instead of swallowing it', async () => {
    const services = createTestServices()
    services.cart.getCart = () => Promise.reject(new Error('boom'))
    window.localStorage.setItem('mp-cart-id', 'mock-cart')

    setup(charger, services)
    await waitFor(() => expect(screen.getByTestId('error')).not.toBeEmptyDOMElement())
  })

  it('does not let a slow initial load overwrite a cart the visitor just created', async () => {
    const services = createTestServices()
    const staleCart = {
      id: 'old-cart',
      checkoutUrl: null,
      totalQuantity: 9,
      subtotal: { amount: 0, currencyCode: 'EUR' },
      lines: [],
    }
    // Trager dan de klik hieronder, zodat de winkelwagen eerst door de bezoeker wordt aangemaakt.
    services.cart.getCart = () => new Promise((resolve) => setTimeout(() => resolve(staleCart), 400))
    window.localStorage.setItem('mp-cart-id', 'old-cart')

    const { user } = setup(charger, services)
    await user.click(screen.getByText('add'))
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('1'))

    await new Promise((resolve) => setTimeout(resolve, 500))
    expect(screen.getByTestId('count')).toHaveTextContent('1')
    expect(window.localStorage.getItem('mp-cart-id')).toBe('mock-cart')
  })

  it('throws when used outside a provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(() => render(<Probe variantId={charger} />)).toThrow(/CartProvider/)
    spy.mockRestore()
  })
})
