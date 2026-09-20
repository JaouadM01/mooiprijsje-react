import type { AppConfig } from '@/types/config'
import type { ContactMessage } from '@/types/shop'
import { ShopApiError } from '../errors'
import type { FormsGateway } from '../repositories'

type FetchLike = typeof fetch

const DEMO_DELAY_MS = 500

async function postJson(endpoint: string, body: unknown, fetchImpl: FetchLike): Promise<void> {
  let response: Response
  try {
    response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    })
  } catch (cause) {
    throw new ShopApiError('Geen verbinding. Controleer je internet en probeer het opnieuw.', { cause })
  }
  if (!response.ok) {
    throw new ShopApiError('Versturen is niet gelukt. Probeer het later opnieuw.', { status: response.status })
  }
}

function demoDelay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, DEMO_DELAY_MS))
}

/**
 * Zonder endpoint in demo-modus slagen formulieren zonder iets te versturen; met echte
 * Shopify-gegevens maar zonder endpoint melden ze eerlijk dat ze nog niet gekoppeld zijn.
 */
export function createFormsGateway(
  config: Pick<AppConfig, 'newsletterEndpoint' | 'contactEndpoint'>,
  fallback: 'demo' | 'unconfigured',
  fetchImpl: FetchLike = (...args) => fetch(...args),
): FormsGateway {
  const send = async (endpoint: string | null, body: unknown, notConfigured: string): Promise<void> => {
    if (endpoint !== null) return postJson(endpoint, body, fetchImpl)
    if (fallback === 'demo') return demoDelay()
    throw new ShopApiError(notConfigured)
  }

  return {
    subscribeNewsletter: (email: string) =>
      send(config.newsletterEndpoint, { email }, 'Inschrijven is nog niet beschikbaar.'),
    sendContactMessage: (message: ContactMessage) =>
      send(config.contactEndpoint, message, 'Het contactformulier is nog niet beschikbaar. Mail ons via info@mooiprijsje.nl.'),
  }
}
