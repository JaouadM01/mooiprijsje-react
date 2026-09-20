export const HERO = {
  heading: 'Alles voor jouw telefoon — voor een mooie prijs',
  subheading: 'Schermen, accessoires en onderdelen. Snelle levering, eerlijke prijs.',
  trustLine: 'Meer dan 10.000 tevreden klanten',
  primaryCta: { label: 'Bekijk assortiment', to: '/collections/all' },
  secondaryCta: { label: 'Schermen bekijken', to: '/collections/schermen' },
  quickTrust: ['Gratis verzending', '14 dagen retour', 'Veilig betalen'],
  badge: { title: 'Vandaag besteld', text: 'morgen in huis' },
  waveColor: '#F5F7FA',
} as const

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
  readonly icon: string
  readonly to: string
  readonly background: string
}

export const CATEGORIES: readonly Category[] = [
  { name: 'Schermen', icon: '📱', to: '/collections/schermen', background: '#DBEAFE' },
  { name: 'Laadpoorten', icon: '🔌', to: '/collections/laadpoorten', background: '#D1FAE5' },
  { name: 'Accessoires', icon: '🎧', to: '/collections/accessoires', background: '#EDE9FE' },
  { name: 'Onderdelen', icon: '🔧', to: '/collections/onderdelen', background: '#FEF3C7' },
]

export const CATEGORY_GRID_TITLE = 'Shop per categorie'

export const FEATURED = {
  collectionHandle: 'frontpage',
  limit: 8,
  title: 'Onze bestsellers',
  subtitle: 'De meest gekochte producten van dit moment',
  ctaLabel: 'Bekijk alle producten',
  ctaTo: '/collections/all',
} as const

export interface Review {
  readonly text: string
  readonly name: string
  readonly city: string
  readonly date: string
  readonly rating: 1 | 2 | 3 | 4 | 5
}

export const TESTIMONIALS = {
  heading: 'Wat onze klanten zeggen',
  subheading: 'Meer dan 10.000 tevreden klanten gingen je voor',
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
