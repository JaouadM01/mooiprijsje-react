import { z } from 'zod'
import { money } from '@/lib/money'
import type { Product, ProductVariant } from '@/types/shop'
import { CATEGORY_DESCRIPTIONS, CATEGORY_TITLES, type MockCollection } from './catalog'
import type { MockCategory } from './images'
import rawSnapshot from './storeSnapshot.json'

/**
 * Demo-catalogus met de echte producten en foto's van mooiprijsje.nl (momentopname van de openbare
 * products.json). Zo laat de testwebsite het eigen assortiment zien zonder Storefront-token.
 * Tests gebruiken bewust de vaste MOCK_PRODUCTS, zodat ze niet afhangen van deze momentopname.
 */

const categorySchema = z.enum(['schermen', 'laadpoorten', 'accessoires', 'onderdelen'])

const snapshotSchema = z.object({
  spotlight: z.array(z.string()),
  products: z.array(
    z.object({
      id: z.number(),
      handle: z.string(),
      title: z.string(),
      vendor: z.string(),
      category: categorySchema,
      bodyHtml: z.string(),
      images: z.array(z.object({ url: z.string().url(), alt: z.string().nullable() })).min(1),
      options: z.array(z.object({ name: z.string(), values: z.array(z.string()) })),
      variants: z
        .array(
          z.object({
            id: z.number(),
            title: z.string(),
            available: z.boolean(),
            price: z.number().int().nonnegative(),
            compareAt: z.number().int().positive().nullable(),
            selectedOptions: z.array(z.object({ name: z.string(), value: z.string() })),
            image: z.string().url().nullable(),
          }),
        )
        .min(1),
    }),
  ),
})

type SnapshotProduct = z.infer<typeof snapshotSchema>['products'][number]

/** Merken die in de titel staan; de Shopify-vendor is vaak gewoon "mooiprijsje.nl". */
const KNOWN_BRANDS = ['NOVANL', 'Swissten', 'Beats', 'Baseus', 'Joyroom', 'Tactical', 'Livon', 'Stoyobe', 'GREEN ON']

export function brandFor(title: string, vendor: string): string {
  const brand = KNOWN_BRANDS.find((candidate) => title.toLowerCase().startsWith(candidate.toLowerCase()))
  return brand ?? vendor
}

function toVariant(variant: SnapshotProduct['variants'][number]): ProductVariant {
  return {
    id: `gid://shopify/ProductVariant/${variant.id}`,
    title: variant.title,
    available: variant.available,
    quantityAvailable: null,
    price: money(variant.price),
    compareAtPrice: variant.compareAt === null ? null : money(variant.compareAt),
    selectedOptions: variant.selectedOptions,
    image: variant.image === null ? null : { url: variant.image, altText: null },
  }
}

function toProduct(product: SnapshotProduct): Product {
  const category: MockCategory = product.category
  return {
    id: `gid://shopify/Product/${product.id}`,
    handle: product.handle,
    title: product.title,
    vendor: brandFor(product.title, product.vendor),
    productType: CATEGORY_TITLES[category],
    descriptionHtml: product.bodyHtml,
    shortDescriptionHtml: null,
    specificationsHtml: null,
    faqHtml: null,
    images: product.images.map((image) => ({ url: image.url, altText: image.alt || product.title })),
    options: product.options,
    variants: product.variants.map(toVariant),
    collection: { handle: category, title: CATEGORY_TITLES[category] },
  }
}

const snapshot = snapshotSchema.parse(rawSnapshot)

/** Volgorde: oudste eerst, zodat "Nieuwste" in de demo-repository klopt. */
export const STORE_PRODUCTS: readonly Product[] = snapshot.products.map(toProduct)

const categories = categorySchema.options

export const STORE_COLLECTIONS: readonly MockCollection[] = [
  ...categories.map((category) => ({
    handle: category,
    title: CATEGORY_TITLES[category],
    descriptionHtml: `<p>${CATEGORY_DESCRIPTIONS[category]}</p>`,
    productHandles: snapshot.products.filter((product) => product.category === category).map((product) => product.handle),
  })),
  { handle: 'frontpage', title: 'Uitgelicht', descriptionHtml: '', productHandles: snapshot.spotlight },
  {
    handle: 'all',
    title: 'Alle producten',
    descriptionHtml: '<p>Ons volledige assortiment aan telefoononderdelen, opladers en accessoires.</p>',
    productHandles: snapshot.products.map((product) => product.handle),
  },
]
