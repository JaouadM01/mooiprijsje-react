import { money } from '@/lib/money'
import { escapeHtml } from '@/lib/sanitize'
import type { Product, ProductOption, ProductVariant, SelectedOption } from '@/types/shop'
import { mockImage, type MockCategory } from './images'

export interface MockCollection {
  readonly handle: string
  readonly title: string
  readonly descriptionHtml: string
  readonly productHandles: readonly string[]
}

interface VariantRule {
  readonly match: Readonly<Record<string, string>>
  readonly priceCents?: number
  readonly available?: boolean
}

interface Seed {
  readonly handle: string
  readonly title: string
  readonly vendor: string
  readonly category: MockCategory
  readonly priceCents: number
  readonly compareAtCents?: number
  readonly stock: number
  readonly featured?: boolean
  readonly short: string
  readonly bullets: readonly string[]
  readonly specs?: readonly (readonly [string, string])[]
  readonly options?: readonly ProductOption[]
  readonly rules?: readonly VariantRule[]
}

export const CATEGORY_TITLES: Readonly<Record<MockCategory, string>> = {
  schermen: 'Schermen',
  laadpoorten: 'Laadpoorten',
  accessoires: 'Accessoires',
  onderdelen: 'Onderdelen',
}

export const CATEGORY_DESCRIPTIONS: Readonly<Record<MockCategory, string>> = {
  schermen: 'Vervangende schermen voor iPhone, Samsung en meer, voor een mooie prijs.',
  laadpoorten: 'Laadpoorten en flexkabels om je toestel weer betrouwbaar op te laden.',
  accessoires: 'Kabels, laders, hoesjes en meer voor jouw telefoon.',
  onderdelen: 'Batterijen, achterkanten en gereedschap om zelf te repareren.',
}

const SEEDS: readonly Seed[] = [
  {
    handle: 'iphone-13-oled-scherm',
    title: 'iPhone 13 OLED scherm + montageset',
    vendor: 'Apple',
    category: 'schermen',
    priceCents: 8995,
    compareAtCents: 10995,
    stock: 12,
    featured: true,
    short: 'Vervangend OLED-scherm met touch, inclusief gereedschap en plakstrips.',
    bullets: ['Levendige OLED-kleuren en True Tone-ondersteuning', 'Inclusief montageset en handleiding', '12 maanden garantie'],
    specs: [['Compatibiliteit', 'iPhone 13'], ['Type', 'OLED'], ['Garantie', '12 maanden']],
  },
  {
    handle: 'iphone-14-lcd-scherm',
    title: 'iPhone 14 LCD scherm',
    vendor: 'Apple',
    category: 'schermen',
    priceCents: 7495,
    stock: 3,
    short: 'Betaalbaar LCD-vervangingsscherm met scherp beeld.',
    bullets: ['Directe plug-and-play vervanging', 'Getest op touch en helderheid'],
    specs: [['Compatibiliteit', 'iPhone 14'], ['Type', 'LCD']],
  },
  {
    handle: 'samsung-galaxy-s22-amoled-scherm',
    title: 'Samsung Galaxy S22 AMOLED scherm',
    vendor: 'Samsung',
    category: 'schermen',
    priceCents: 11995,
    compareAtCents: 13995,
    stock: 7,
    featured: true,
    short: 'AMOLED-scherm met frame, klaar om te monteren.',
    bullets: ['Inclusief frame', 'Vingerafdruksensor-compatibel', '12 maanden garantie'],
    specs: [['Compatibiliteit', 'Galaxy S22'], ['Type', 'AMOLED']],
  },
  {
    handle: 'samsung-galaxy-a54-scherm',
    title: 'Samsung Galaxy A54 scherm',
    vendor: 'Samsung',
    category: 'schermen',
    priceCents: 6495,
    stock: 0,
    short: 'Vervangingsscherm voor de Galaxy A54.',
    bullets: ['Tijdelijk uitverkocht — binnenkort weer op voorraad'],
  },
  {
    handle: 'xiaomi-redmi-note-12-lcd-scherm',
    title: 'Xiaomi Redmi Note 12 LCD scherm',
    vendor: 'Xiaomi',
    category: 'schermen',
    priceCents: 4995,
    stock: 15,
    short: 'Voordelig LCD-scherm voor de Redmi Note 12.',
    bullets: ['Scherp Full HD-beeld', 'Getest voor verzending'],
  },
  {
    handle: 'usb-c-laadpoort-samsung-a-serie',
    title: 'USB-C laadpoort Samsung A-serie',
    vendor: 'Samsung',
    category: 'laadpoorten',
    priceCents: 899,
    stock: 30,
    short: 'Vervangende laadpoort met flexkabel.',
    bullets: ['Ondersteunt snelladen', 'Eenvoudig zelf te vervangen'],
  },
  {
    handle: 'lightning-laadpoort-iphone-11',
    title: 'Lightning laadpoort iPhone 11',
    vendor: 'Apple',
    category: 'laadpoorten',
    priceCents: 1295,
    compareAtCents: 1595,
    stock: 18,
    featured: true,
    short: 'Laadpoort met flexkabel voor de iPhone 11.',
    bullets: ['Stabiele laadverbinding', 'Inclusief microfoon-flex'],
  },
  {
    handle: 'usb-c-laadpoort-pixel-7',
    title: 'USB-C laadpoort Google Pixel 7',
    vendor: 'Google',
    category: 'laadpoorten',
    priceCents: 1495,
    stock: 9,
    short: 'Originele pasvorm laadpoort voor de Pixel 7.',
    bullets: ['Getest op laden en data', '12 maanden garantie'],
  },
  {
    handle: 'usb-c-kabel-gevlochten',
    title: 'USB-C kabel gevlochten nylon',
    vendor: 'mooiprijsje',
    category: 'accessoires',
    priceCents: 799,
    stock: 50,
    featured: true,
    short: 'Extra sterke kabel voor snel laden en data-overdracht.',
    bullets: ['Gevlochten nylon, breekt niet snel', 'Tot 60W snelladen', 'Keuze uit kleur en lengte'],
    options: [
      { name: 'Kleur', values: ['Zwart', 'Wit'] },
      { name: 'Lengte', values: ['1m', '2m'] },
    ],
    rules: [
      { match: { Lengte: '1m' }, priceCents: 599 },
      { match: { Kleur: 'Wit', Lengte: '2m' }, available: false },
    ],
  },
  {
    handle: 'gehard-glas-screenprotector-iphone-15',
    title: 'Gehard glas screenprotector iPhone 15',
    vendor: 'Apple',
    category: 'accessoires',
    priceCents: 599,
    compareAtCents: 999,
    stock: 80,
    featured: true,
    short: '9H gehard glas met installatiekader — bubbelvrij plaatsen.',
    bullets: ['9H hardheid', 'Krasbestendig en vingerafdrukwerend', 'Inclusief installatiekader'],
  },
  {
    handle: 'siliconen-hoesje-samsung-s23',
    title: 'Siliconen hoesje Samsung Galaxy S23',
    vendor: 'Samsung',
    category: 'accessoires',
    priceCents: 1295,
    stock: 22,
    short: 'Zacht siliconen hoesje met microvezelvoering.',
    bullets: ['Rondom bescherming', 'Zit als gegoten', 'Beschikbaar in drie kleuren'],
    options: [{ name: 'Kleur', values: ['Zwart', 'Blauw', 'Roze'] }],
  },
  {
    handle: 'snellader-20w-usb-c',
    title: 'Snellader 20W USB-C',
    vendor: 'mooiprijsje',
    category: 'accessoires',
    priceCents: 1799,
    stock: 40,
    featured: true,
    short: 'Compacte 20W-lader met Power Delivery.',
    bullets: ['Power Delivery 3.0', 'Overspanningsbeveiliging', 'Geschikt voor iPhone, Samsung en Pixel'],
    specs: [['Vermogen', '20W'], ['Aansluiting', 'USB-C'], ['Garantie', '24 maanden']],
  },
  {
    handle: 'draadloze-oordopjes',
    title: 'Draadloze oordopjes met oplaaddoosje',
    vendor: 'mooiprijsje',
    category: 'accessoires',
    priceCents: 2999,
    compareAtCents: 3999,
    stock: 4,
    featured: true,
    short: 'Bluetooth 5.3 oordopjes met tot 24 uur speeltijd.',
    bullets: ['Bluetooth 5.3', 'Tot 24 uur speeltijd met doosje', 'Spatwaterbestendig'],
  },
  {
    handle: 'batterij-samsung-galaxy-s21',
    title: 'Batterij Samsung Galaxy S21',
    vendor: 'Samsung',
    category: 'onderdelen',
    priceCents: 2495,
    stock: 14,
    short: 'Vervangende batterij met dezelfde capaciteit als het origineel.',
    bullets: ['4000 mAh', 'Inclusief plakstrips', '12 maanden garantie'],
  },
  {
    handle: 'batterij-iphone-12',
    title: 'Batterij iPhone 12',
    vendor: 'Apple',
    category: 'onderdelen',
    priceCents: 2995,
    compareAtCents: 3495,
    stock: 20,
    featured: true,
    short: 'Nieuwe batterij voor de iPhone 12, direct te monteren.',
    bullets: ['2815 mAh', 'Getest op capaciteit en veiligheid'],
  },
  {
    handle: 'gereedschapsset-telefoon-reparatie',
    title: 'Gereedschapsset telefoonreparatie 25-delig',
    vendor: 'mooiprijsje',
    category: 'onderdelen',
    priceCents: 1495,
    stock: 25,
    short: 'Alles om zelf een scherm of batterij te vervangen.',
    bullets: ['Schroevendraaiers, pry tools en zuignap', 'Handig opbergetui'],
  },
  {
    handle: 'achterkant-glas-iphone-13',
    title: 'Achterkant glas iPhone 13',
    vendor: 'Apple',
    category: 'onderdelen',
    priceCents: 1995,
    stock: 10,
    short: 'Vervangende glazen achterkant, zonder frame.',
    bullets: ['Perfecte pasvorm', 'Beschikbaar voor draadloos laden'],
  },
]

function cartesian(options: readonly ProductOption[]): SelectedOption[][] {
  return options.reduce<SelectedOption[][]>(
    (combos, option) => combos.flatMap((combo) => option.values.map((value) => [...combo, { name: option.name, value }])),
    [[]],
  )
}

function buildVariants(seed: Seed): ProductVariant[] {
  const combos = seed.options?.length ? cartesian(seed.options) : [[{ name: 'Title', value: 'Default Title' }]]

  return combos.map((selectedOptions, index) => {
    const rule = seed.rules?.find((candidate) =>
      Object.entries(candidate.match).every(([name, value]) =>
        selectedOptions.some((option) => option.name === name && option.value === value),
      ),
    )
    const priceCents = rule?.priceCents ?? seed.priceCents
    const available = (rule?.available ?? true) && seed.stock > 0

    return {
      id: `gid://mock/ProductVariant/${seed.handle}-${index + 1}`,
      title: selectedOptions.map((option) => option.value).join(' / '),
      available,
      quantityAvailable: available ? seed.stock : 0,
      price: money(priceCents),
      compareAtPrice: seed.compareAtCents && seed.compareAtCents > priceCents ? money(seed.compareAtCents) : null,
      selectedOptions,
      image: null,
    }
  })
}

function specsTable(specs: readonly (readonly [string, string])[]): string {
  const rows = specs
    .map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`)
    .join('')
  return `<table class="specs-table"><tbody>${rows}</tbody></table>`
}

function buildProduct(seed: Seed): Product {
  const bullets = seed.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')
  return {
    id: `gid://mock/Product/${seed.handle}`,
    handle: seed.handle,
    title: seed.title,
    vendor: seed.vendor,
    productType: CATEGORY_TITLES[seed.category],
    descriptionHtml: `<p>${escapeHtml(seed.short)}</p><ul>${bullets}</ul>`,
    shortDescriptionHtml: `<p>${escapeHtml(seed.short)}</p>`,
    specificationsHtml: seed.specs ? specsTable(seed.specs) : null,
    faqHtml: null,
    images: ([0, 1, 2] as const).map((variant) => mockImage(seed.category, seed.title, variant)),
    options: seed.options ?? [],
    variants: buildVariants(seed),
    collection: { handle: seed.category, title: CATEGORY_TITLES[seed.category] },
  }
}

/** Volgorde = populariteit; latere producten zijn nieuwer. */
export const MOCK_PRODUCTS: readonly Product[] = SEEDS.map(buildProduct)

const featuredHandles = SEEDS.filter((seed) => seed.featured).map((seed) => seed.handle)

export const MOCK_COLLECTIONS: readonly MockCollection[] = [
  ...(Object.keys(CATEGORY_TITLES) as MockCategory[]).map((category) => ({
    handle: category,
    title: CATEGORY_TITLES[category],
    descriptionHtml: `<p>${CATEGORY_DESCRIPTIONS[category]}</p>`,
    productHandles: SEEDS.filter((seed) => seed.category === category).map((seed) => seed.handle),
  })),
  { handle: 'frontpage', title: 'Bestsellers', descriptionHtml: '', productHandles: featuredHandles },
  {
    handle: 'all',
    title: 'Alle producten',
    descriptionHtml: '<p>Ons volledige assortiment aan telefoononderdelen, opladers en accessoires.</p>',
    productHandles: SEEDS.map((seed) => seed.handle),
  },
]
