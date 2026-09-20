import type { AppConfig } from '@/types/config'

export const DEFAULT_API_VERSION = '2025-07'

export class ConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConfigError'
  }
}

function clean(value: string | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1'])

/** Shopify Admin-tokens (shpat_, shpca_, shpss_, shppa_) mogen nooit in een publieke build terechtkomen. */
const ADMIN_TOKEN_PATTERN = /^shp(at|ca|ss|pa)_/i

/** Formulieren bevatten persoonsgegevens: alleen https, en http uitsluitend voor lokaal ontwikkelen. */
function readEndpoint(name: string, value: string | undefined): string | null {
  const raw = clean(value)
  if (raw === null) return null
  try {
    const url = new URL(raw)
    if (url.protocol === 'https:' || (url.protocol === 'http:' && LOCAL_HOSTS.has(url.hostname))) return url.toString()
  } catch {
    // Valt door naar de foutmelding hieronder.
  }
  throw new ConfigError(`${name} moet een https-URL zijn (http mag alleen voor localhost).`)
}

function readStoreDomain(value: string | undefined): string | null {
  const raw = clean(value)
  if (raw === null) return null
  const domain = raw.replace(/^https?:\/\//i, '').replace(/\/+$/, '')
  if (!/^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/i.test(domain)) {
    throw new ConfigError('VITE_SHOPIFY_STORE_DOMAIN moet een domeinnaam zijn, bijv. mooiprijsje.myshopify.com.')
  }
  return domain
}

/**
 * Leest de omgevingsvariabelen. Zonder Shopify-gegevens draait de site in demo-modus.
 * Een half ingevulde configuratie is een fout, zodat je niet per ongeluk demodata ziet.
 */
export function readAppConfig(env: ImportMetaEnv = import.meta.env): AppConfig {
  const storeDomain = readStoreDomain(env.VITE_SHOPIFY_STORE_DOMAIN)
  const storefrontToken = clean(env.VITE_SHOPIFY_STOREFRONT_TOKEN)

  if (storefrontToken !== null && ADMIN_TOKEN_PATTERN.test(storefrontToken)) {
    throw new ConfigError(
      'VITE_SHOPIFY_STOREFRONT_TOKEN lijkt een Admin API-token. Gebruik alleen een Storefront-token: alles in VITE_-variabelen wordt openbaar in de website gezet.',
    )
  }

  if ((storeDomain === null) !== (storefrontToken === null)) {
    throw new ConfigError('Vul zowel VITE_SHOPIFY_STORE_DOMAIN als VITE_SHOPIFY_STOREFRONT_TOKEN in, of laat beide leeg.')
  }

  return {
    shopify:
      storeDomain !== null && storefrontToken !== null
        ? {
            storeDomain,
            storefrontToken,
            apiVersion: clean(env.VITE_SHOPIFY_API_VERSION) ?? DEFAULT_API_VERSION,
            readInventory: clean(env.VITE_SHOPIFY_READ_INVENTORY)?.toLowerCase() === 'true',
          }
        : null,
    newsletterEndpoint: readEndpoint('VITE_NEWSLETTER_ENDPOINT', env.VITE_NEWSLETTER_ENDPOINT),
    contactEndpoint: readEndpoint('VITE_CONTACT_ENDPOINT', env.VITE_CONTACT_ENDPOINT),
  }
}
