import type { Money } from '@/types/shop'

export const DEFAULT_CURRENCY = 'EUR'
const LOCALE = 'nl-NL'

const formatterCache = new Map<string, Intl.NumberFormat>()

function getFormatter(currencyCode: string): Intl.NumberFormat {
  const cached = formatterCache.get(currencyCode)
  if (cached) return cached
  const created = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: currencyCode })
  formatterCache.set(currencyCode, created)
  return created
}

export function money(cents: number, currencyCode: string = DEFAULT_CURRENCY): Money {
  return { amount: Math.round(cents), currencyCode }
}

/** Zet een decimaal bedrag ("12.99" of 12.99) om naar centen. */
export function moneyFromDecimal(amount: string | number, currencyCode: string): Money {
  const parsed = typeof amount === 'number' ? amount : Number.parseFloat(amount)
  return money(Number.isFinite(parsed) ? parsed * 100 : 0, currencyCode)
}

export function multiplyMoney(value: Money, factor: number): Money {
  return money(value.amount * factor, value.currencyCode)
}

export function sumMoney(values: readonly Money[], fallbackCurrency: string = DEFAULT_CURRENCY): Money {
  const total = values.reduce((sum, value) => sum + value.amount, 0)
  return money(total, values[0]?.currencyCode ?? fallbackCurrency)
}

export function formatMoney(value: Money): string {
  return getFormatter(value.currencyCode).format(value.amount / 100)
}

export function centsToEuros(cents: number): number {
  return cents / 100
}
