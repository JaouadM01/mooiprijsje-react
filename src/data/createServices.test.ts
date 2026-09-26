import type { AppConfig } from '@/types/config'
import { ShopApiError } from './errors'
import { createServices } from './createServices'

const demo: AppConfig = { shopify: null, newsletterEndpoint: null, contactEndpoint: null }
const live: AppConfig = {
  shopify: { storeDomain: 'shop.myshopify.com', storefrontToken: 'tok', apiVersion: '2025-07', readInventory: false },
  newsletterEndpoint: null,
  contactEndpoint: null,
}

describe('createServices', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('uses demo data without Shopify credentials', async () => {
    const services = createServices(demo)
    expect(services.meta).toEqual({ isDemo: true, accountUrl: null })
    // De demo toont de echte producten van mooiprijsje.nl (zie storeSnapshot.ts).
    expect((await services.shop.getProduct('novanl-maglock-wireless'))?.title).toBe('NOVANL MagLock Wireless')
  })

  it('lets demo forms succeed without sending anything', async () => {
    vi.useFakeTimers()
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const pending = createServices(demo).forms.subscribeNewsletter('a@b.nl')
    await vi.advanceTimersByTimeAsync(600)
    await expect(pending).resolves.toBeUndefined()
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('talks to the Storefront API when a shop is configured', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({ data: { product: null } }), { status: 200 }))
    const services = createServices(live)

    expect(services.meta).toEqual({ isDemo: false, accountUrl: 'https://shop.myshopify.com/account' })
    expect(await services.shop.getProduct('bestaat-niet')).toBeNull()
    expect(fetchSpy).toHaveBeenCalledWith('https://shop.myshopify.com/api/2025-07/graphql.json', expect.anything())
  })

  it('does not pretend forms work when a shop is connected without endpoints', async () => {
    const { forms } = createServices(live)
    await expect(forms.subscribeNewsletter('a@b.nl')).rejects.toBeInstanceOf(ShopApiError)
  })

  it('posts forms to the configured endpoints', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 200 }))
    const { forms } = createServices({ ...live, newsletterEndpoint: 'https://forms.example.com/news' })

    await forms.subscribeNewsletter('a@b.nl')
    expect(fetchSpy).toHaveBeenCalledWith('https://forms.example.com/news', expect.objectContaining({ method: 'POST' }))
  })
})
