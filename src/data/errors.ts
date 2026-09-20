export class ShopApiError extends Error {
  readonly status: number | null

  constructor(message: string, options: { status?: number | null; cause?: unknown } = {}) {
    super(message, { cause: options.cause })
    this.name = 'ShopApiError'
    this.status = options.status ?? null
  }
}

export const GENERIC_ERROR_MESSAGE = 'Er ging iets mis. Probeer het opnieuw.'

/**
 * Toont de tekst van een ShopApiError (onze eigen Nederlandse meldingen en de gebruikersmeldingen van
 * Shopify's `userErrors`, zoals "niet op voorraad"); alle andere fouten blijven generiek.
 */
export function toUserMessage(error: unknown, fallback: string = GENERIC_ERROR_MESSAGE): string {
  return error instanceof ShopApiError ? error.message : fallback
}
