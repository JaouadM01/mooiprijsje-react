import { centsToEuros, formatMoney, money, moneyFromDecimal, multiplyMoney, sumMoney } from './money'

describe('formatMoney', () => {
  it('formats euros in Dutch notation', () => {
    expect(formatMoney(money(1299))).toMatch(/^€\s12,99$/)
  })

  it('uses a thousands separator', () => {
    expect(formatMoney(money(123450))).toMatch(/^€\s1\.234,50$/)
  })
})

describe('moneyFromDecimal', () => {
  it('converts decimal strings to cents without float drift', () => {
    expect(moneyFromDecimal('19.99', 'EUR').amount).toBe(1999)
    expect(moneyFromDecimal('0.1', 'EUR').amount).toBe(10)
  })

  it('accepts numbers', () => {
    expect(moneyFromDecimal(4.5, 'EUR').amount).toBe(450)
  })

  it('falls back to zero for garbage input', () => {
    expect(moneyFromDecimal('abc', 'EUR').amount).toBe(0)
  })
})

describe('multiplyMoney and sumMoney', () => {
  it('multiplies by quantity', () => {
    expect(multiplyMoney(money(799), 3)).toEqual({ amount: 2397, currencyCode: 'EUR' })
  })

  it('sums a list', () => {
    expect(sumMoney([money(100), money(250)]).amount).toBe(350)
  })

  it('returns zero in the fallback currency for an empty list', () => {
    expect(sumMoney([], 'USD')).toEqual({ amount: 0, currencyCode: 'USD' })
  })
})

describe('centsToEuros', () => {
  it('divides by one hundred', () => {
    expect(centsToEuros(1250)).toBe(12.5)
  })
})
