import { ShopApiError } from '../errors'
import { createFormsGateway } from './formsGateways'

const message = { name: 'Lisa', email: 'lisa@voorbeeld.nl', subject: 'Retour', message: 'Hoe retourneer ik mijn scherm?' }
const endpoints = { newsletterEndpoint: 'https://forms.example.com/news', contactEndpoint: 'https://forms.example.com/contact' }
const none = { newsletterEndpoint: null, contactEndpoint: null }

function fetchReturning(status: number) {
  return vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status }))
}

describe('forms gateway with endpoints', () => {
  it('posts the newsletter email as JSON', async () => {
    const fetchImpl = fetchReturning(200)
    await createFormsGateway(endpoints, 'unconfigured', fetchImpl).subscribeNewsletter('jij@voorbeeld.nl')

    expect(fetchImpl).toHaveBeenCalledWith(
      'https://forms.example.com/news',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ email: 'jij@voorbeeld.nl' }) }),
    )
  })

  it('posts the contact message to its own endpoint', async () => {
    const fetchImpl = fetchReturning(201)
    await createFormsGateway(endpoints, 'unconfigured', fetchImpl).sendContactMessage(message)
    expect(fetchImpl).toHaveBeenCalledWith('https://forms.example.com/contact', expect.anything())
  })

  it('turns non-2xx responses into a ShopApiError with the status', async () => {
    const gateway = createFormsGateway(endpoints, 'unconfigured', fetchReturning(500))
    await expect(gateway.subscribeNewsletter('a@b.nl')).rejects.toMatchObject({ status: 500 })
  })

  it('turns network failures into a friendly error', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('offline'))
    const gateway = createFormsGateway(endpoints, 'unconfigured', fetchImpl)
    await expect(gateway.sendContactMessage(message)).rejects.toThrow(/Geen verbinding/)
  })
})

describe('forms gateway without endpoints', () => {
  it('fails honestly when connected to Shopify but not configured', async () => {
    const gateway = createFormsGateway(none, 'unconfigured', fetchReturning(200))
    await expect(gateway.subscribeNewsletter('a@b.nl')).rejects.toBeInstanceOf(ShopApiError)
    await expect(gateway.sendContactMessage(message)).rejects.toThrow(/info@mooiprijsje\.nl/)
  })

  it('succeeds in demo mode without sending anything', async () => {
    vi.useFakeTimers()
    const fetchImpl = fetchReturning(200)
    const pending = createFormsGateway(none, 'demo', fetchImpl).subscribeNewsletter('a@b.nl')
    await vi.advanceTimersByTimeAsync(600)
    await expect(pending).resolves.toBeUndefined()
    expect(fetchImpl).not.toHaveBeenCalled()
    vi.useRealTimers()
  })
})
