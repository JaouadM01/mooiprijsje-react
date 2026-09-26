import type { CollectionSort } from '@/types/shop'

/** Onzichtbare paginatitel: de homepage begint direct met producten (geen banner). */
export const HOME_HEADING = 'mooiprijsje.nl: telefoonschermen, onderdelen en accessoires voor een mooie prijs'

export type UspIcon = 'cart' | 'badge' | 'refresh' | 'shield'

export interface Usp {
  readonly icon: UspIcon
  readonly title: string
  readonly description: string
}

export const USPS: readonly Usp[] = [
  { icon: 'cart', title: 'Gratis verzending', description: 'Voor elke bestelling' },
  { icon: 'badge', title: 'Altijd op voorraad', description: 'Direct leverbaar' },
  { icon: 'refresh', title: '14 dagen retour', description: 'Zonder gedoe' },
  { icon: 'shield', title: 'Veilig betalen', description: 'iDEAL, Klarna, Visa' },
]

export interface Category {
  readonly name: string
  readonly tagline: string
  readonly to: string
  /** Sfeerfoto van de categorie (productfoto uit de winkel). */
  readonly image: string
}

const CDN = 'https://cdn.shopify.com/s/files/1/0892/3614/4461/files'

export const CATEGORIES: readonly Category[] = [
  {
    name: 'Schermen',
    tagline: 'iPhone, Samsung, Google',
    to: '/collections/schermen',
    image: `${CDN}/35113A8B18_B.webp?v=1747217238&width=600`,
  },
  {
    name: 'Laadpoorten',
    tagline: 'Dock connectors en flexkabels',
    to: '/collections/laadpoorten',
    image: `${CDN}/21030-replacement-for-iphone-12-12-pro-usb-charging-flex-cable-white-1-clyknk2z.jpg?v=1747676145&width=600`,
  },
  {
    name: 'Accessoires',
    tagline: 'Laders, hoesjes en audio',
    to: '/collections/accessoires',
    image: `${CDN}/TFgizO3AAmX3qjvpM11nYJqa86okGw-metaMS5qcGc_--large.jpg?v=1747903153&width=600`,
  },
  {
    name: 'Onderdelen',
    tagline: 'Batterijen, lijm en meer',
    to: '/collections/onderdelen',
    image: `${CDN}/b7000-super-glue-adhesive-mobile-repair-phones-2-poxmkjkr.jpg?v=1747727673&width=600`,
  },
]

export const CATEGORY_GRID_TITLE = 'Shop per categorie'

export interface ProductRail {
  readonly id: string
  readonly eyebrow: string
  readonly title: string
  readonly subtitle: string
  readonly collectionHandle: string
  readonly sort: CollectionSort
  readonly limit: number
  readonly ctaLabel: string
  readonly ctaTo: string
}

/** Direct bovenaan de homepage (feedback: producten in plaats van een banner). */
export const SPOTLIGHT: ProductRail = {
  id: 'uitgelicht',
  eyebrow: 'Uitgelicht',
  title: 'Topdeals van deze week',
  subtitle: 'Onze populairste producten, scherp geprijsd en direct leverbaar',
  collectionHandle: 'frontpage',
  sort: 'manual',
  limit: 8,
  ctaLabel: 'Bekijk alle producten',
  ctaTo: '/collections/all',
}

export const NEW_ARRIVALS: ProductRail = {
  id: 'nieuw',
  eyebrow: 'Nieuw binnen',
  title: 'Net binnengekomen',
  subtitle: 'De nieuwste onderdelen en accessoires in ons assortiment',
  collectionHandle: 'all',
  sort: 'created-descending',
  limit: 4,
  ctaLabel: 'Bekijk alle nieuwe producten',
  ctaTo: '/collections/all?sort=created-descending',
}

export interface Review {
  readonly text: string
  readonly name: string
  readonly city: string
  readonly date: string
  readonly rating: 1 | 2 | 3 | 4 | 5
}

export const TESTIMONIALS = {
  heading: 'Wat onze klanten zeggen',
  subheading: 'Beoordelingen van klanten op Google',
  /** Link naar het Google-bedrijfsprofiel; leeg = knop niet tonen. */
  googleUrl: 'https://www.google.com/search?q=mooiprijsje.nl+reviews',
  reviews: [
    {
      text: 'Wauw, wat een snelle levering! Besteld op maandagavond en dinsdagochtend al in huis. Het scherm van mijn iPhone zit er perfect op, precies zoals het origineel. Heel blij mee!',
      name: 'Lisa de Vries',
      city: 'Utrecht',
      date: 'augustus 2025',
      rating: 5,
    },
    {
      text: 'Eindelijk een webshop waar alles gewoon klopt. Goede prijs, nette verpakking en de laadkabel werkt perfect. Klantenservice was heel vriendelijk en snel.',
      name: 'Daan Smits',
      city: 'Rotterdam',
      date: 'augustus 2025',
      rating: 5,
    },
    {
      text: 'Mooiprijsje.nl doet precies wat het zegt: mooie prijs! Screenprotector van top kwaliteit voor een fractie van de prijs bij de telefoonwinkel. Aanrader!',
      name: 'Sanne Bakker',
      city: 'Eindhoven',
      date: 'juli 2025',
      rating: 5,
    },
    {
      text: 'Batterij van mijn Samsung vervangen met het onderdeel van hier. Alles paste perfect. Betaalde een fractie van wat de reparatiewinkel vroeg.',
      name: 'Remi Janssen',
      city: 'Den Haag',
      date: 'juli 2025',
      rating: 4,
    },
    {
      text: 'Superstrak hoesje, zit als gegoten. Levering was razendsnel en de prijs is echt niet te kloppen. Bestel hier voortaan altijd!',
      name: 'Fatima El Amrani',
      city: 'Amsterdam',
      date: 'juni 2025',
      rating: 5,
    },
    {
      text: 'Twijfelde eerst of het scherm wel originele kwaliteit zou zijn, maar aangenaam verrast. Kleuren zijn mooi, touch werkt vlekkeloos. Top!',
      name: 'Joost van den Berg',
      city: 'Groningen',
      date: 'juni 2025',
      rating: 5,
    },
  ] as readonly Review[],
} as const

export const NEWSLETTER = {
  eyebrow: 'Exclusief voor abonnees',
  heading: 'Ontvang 10% korting',
  subheading: 'Schrijf je in voor exclusieve deals, nieuwe producten en de beste aanbiedingen',
  buttonLabel: 'Schrijven',
  formTitle: 'Inschrijven en gelijk besparen',
  formDescription: 'Ontvang je kortingscode direct in je inbox na aanmelding.',
  benefits: [
    'Als eerste op de hoogte van nieuwe producten',
    'Exclusieve kortingsacties alleen voor abonnees',
    'Tips en trucs voor jouw telefoon',
  ],
} as const

export const ABOUT = {
  tag: 'Ons verhaal',
  title: 'Over mooiprijsje.nl',
  tagline: 'Kwaliteit voor een mooie prijs — al sinds dag één onze belofte',
  storyTitle: 'Hoe het begon',
  story: [
    'Mooiprijsje.nl is opgericht met één doel: kwalitatieve telefoononderdelen en accessoires aanbieden tegen eerlijke, transparante prijzen. We merkten dat consumenten vaak te veel betaalden voor schermen, opladers en reparatieonderdelen — en dat kon anders.',
    'Vandaag de dag helpen we duizenden klanten per jaar met het repareren en upgraden van hun toestel. Dankzij directe inkooprelaties met gecertificeerde fabrikanten kunnen wij topkwaliteit leveren zonder de hoge marges van traditionele winkels. Snel, betrouwbaar en persoonlijk — dat is mooiprijsje.nl.',
  ],
  valuesTitle: 'Waar wij voor staan',
  values: [
    {
      icon: '💰',
      name: 'Eerlijke prijzen',
      description:
        'Geen gedoe, gewoon de beste prijs. We zijn transparant over onze kosten en rekenen nooit verborgen toeslagen.',
    },
    {
      icon: '🚀',
      name: 'Snelle levering',
      description:
        'Vandaag besteld, morgen in huis. Wij verwerken bestellingen snel zodat jij niet lang hoeft te wachten.',
    },
    {
      icon: '🛡️',
      name: 'Kwaliteitsgarantie',
      description:
        'Alleen gecertificeerde onderdelen van betrouwbare leveranciers. Elk product doorloopt onze kwaliteitscontrole.',
    },
  ],
  stats: [
    { number: '10.000+', label: 'Tevreden klanten' },
    { number: '52+', label: 'Producten' },
    { number: '4.8★', label: 'Gemiddelde score' },
    { number: '<24u', label: 'Levertijd' },
  ],
  cta: {
    title: 'Klaar om te winkelen?',
    text: 'Ontdek ons volledige assortiment aan telefoononderdelen, opladers en accessoires.',
    label: 'Bekijk assortiment',
    to: '/collections/all',
  },
} as const
