import type { Money, Product, ProductVariant } from '@/types/shop'

export const LOW_STOCK_THRESHOLD = 5

export type StockLevel = 'in' | 'low' | 'out'
export type OptionSelection = Readonly<Record<string, string>>

export function isOnSale(price: Money, compareAt: Money | null): compareAt is Money {
  return compareAt !== null && compareAt.amount > price.amount && compareAt.amount > 0
}

/** Kortingspercentage (0 als het product niet in de aanbieding is). */
export function savingsPercent(price: Money, compareAt: Money | null): number {
  if (!isOnSale(price, compareAt)) return 0
  return Math.round(((compareAt.amount - price.amount) * 100) / compareAt.amount)
}

/**
 * Percentage voor een kortingsbadge, of null als de korting afgerond onder 1% uitkomt
 * (bijvoorbeeld € 19,95 i.p.v. € 19,99): een badge "−0%" oogt als een fout.
 */
export function badgeSavingsPercent(price: Money, compareAt: Money | null): number | null {
  const percent = savingsPercent(price, compareAt)
  return percent >= 1 ? percent : null
}

export function stockLevel(variant: Pick<ProductVariant, 'available' | 'quantityAvailable'>): StockLevel {
  if (!variant.available) return 'out'
  const quantity = variant.quantityAvailable
  if (quantity !== null && quantity > 0 && quantity <= LOW_STOCK_THRESHOLD) return 'low'
  return 'in'
}

export function selectionFromVariant(variant: ProductVariant): OptionSelection {
  return Object.fromEntries(variant.selectedOptions.map((option) => [option.name, option.value]))
}

export function findVariant(product: Product, selection: OptionSelection): ProductVariant | null {
  return (
    product.variants.find((variant) =>
      variant.selectedOptions.every((option) => selection[option.name] === option.value),
    ) ?? null
  )
}

/** Eerste beschikbare variant, anders de eerste variant. */
export function defaultVariant(product: Pick<Product, 'variants'>): ProductVariant | null {
  return product.variants.find((variant) => variant.available) ?? product.variants[0] ?? null
}

/** Bestaat er een beschikbare variant met deze optiewaarde, gegeven de rest van de selectie? */
export function isOptionValueAvailable(
  product: Product,
  selection: OptionSelection,
  optionName: string,
  value: string,
): boolean {
  const next = { ...selection, [optionName]: value }
  return product.variants.some(
    (variant) => variant.available && variant.selectedOptions.every((option) => next[option.name] === option.value),
  )
}
