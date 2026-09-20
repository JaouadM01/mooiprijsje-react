import { ConfigError, DEFAULT_API_VERSION, readAppConfig } from './env'

const env = (values: Record<string, string>) => values as unknown as ImportMetaEnv

describe('readAppConfig', () => {
  it('runs in demo mode when nothing is configured', () => {
    expect(readAppConfig(env({}))).toEqual({ shopify: null, newsletterEndpoint: null, contactEndpoint: null })
  })

  it('reads Shopify settings and applies defaults', () => {
    const config = readAppConfig(
      env({ VITE_SHOPIFY_STORE_DOMAIN: 'mooiprijsje.myshopify.com', VITE_SHOPIFY_STOREFRONT_TOKEN: ' tok ' }),
    )
    expect(config.shopify).toEqual({
      storeDomain: 'mooiprijsje.myshopify.com',
      storefrontToken: 'tok',
      apiVersion: DEFAULT_API_VERSION,
      readInventory: false,
    })
  })

  it('strips protocol and trailing slashes from the domain', () => {
    const config = readAppConfig(
      env({ VITE_SHOPIFY_STORE_DOMAIN: 'https://shop.example.com/', VITE_SHOPIFY_STOREFRONT_TOKEN: 't' }),
    )
    expect(config.shopify?.storeDomain).toBe('shop.example.com')
  })

  it('supports an explicit API version and inventory flag', () => {
    const config = readAppConfig(
      env({
        VITE_SHOPIFY_STORE_DOMAIN: 'a.myshopify.com',
        VITE_SHOPIFY_STOREFRONT_TOKEN: 't',
        VITE_SHOPIFY_API_VERSION: '2025-10',
        VITE_SHOPIFY_READ_INVENTORY: 'TRUE',
      }),
    )
    expect(config.shopify).toMatchObject({ apiVersion: '2025-10', readInventory: true })
  })

  it('throws when only one of domain and token is set', () => {
    expect(() => readAppConfig(env({ VITE_SHOPIFY_STORE_DOMAIN: 'a.myshopify.com' }))).toThrow(ConfigError)
    expect(() => readAppConfig(env({ VITE_SHOPIFY_STOREFRONT_TOKEN: 't' }))).toThrow(ConfigError)
  })

  it('throws on a malformed domain', () => {
    expect(() =>
      readAppConfig(env({ VITE_SHOPIFY_STORE_DOMAIN: 'not a domain', VITE_SHOPIFY_STOREFRONT_TOKEN: 't' })),
    ).toThrow(/domeinnaam/)
  })

  it('refuses Admin API tokens, which would end up in the public bundle', () => {
    for (const token of ['shpat_abc123', 'SHPCA_x', 'shpss_x', 'shppa_x']) {
      expect(() =>
        readAppConfig(env({ VITE_SHOPIFY_STORE_DOMAIN: 'a.myshopify.com', VITE_SHOPIFY_STOREFRONT_TOKEN: token })),
      ).toThrow(/Admin API-token/)
    }
  })

  it('allows plain http only for localhost', () => {
    expect(readAppConfig(env({ VITE_CONTACT_ENDPOINT: 'http://localhost:8787/contact' })).contactEndpoint).toBe(
      'http://localhost:8787/contact',
    )
    expect(() => readAppConfig(env({ VITE_CONTACT_ENDPOINT: 'http://forms.example.com/x' }))).toThrow(/https/)
  })

  it('accepts https endpoints and rejects other schemes', () => {
    expect(readAppConfig(env({ VITE_CONTACT_ENDPOINT: 'https://forms.example.com/x' })).contactEndpoint).toBe(
      'https://forms.example.com/x',
    )
    expect(() => readAppConfig(env({ VITE_NEWSLETTER_ENDPOINT: 'javascript:alert(1)' }))).toThrow(ConfigError)
    expect(() => readAppConfig(env({ VITE_NEWSLETTER_ENDPOINT: 'nope' }))).toThrow(ConfigError)
  })
})
