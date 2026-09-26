export const SITE = {
  name: 'mooiprijsje.nl',
  brand: 'mooiprijsje',
  brandSuffix: '.nl',
  email: 'info@mooiprijsje.nl',
  searchPlaceholder: 'Zoek naar schermen, laadkabels, accessoires...',
  footerAbout:
    'Bij mooiprijsje.nl vind je accessoires voor je mobiel, tablet en laptop — altijd voor een scherpe prijs. Gratis verzending, snelle levering, persoonlijke service.',
} as const

export interface NavLink {
  readonly label: string
  readonly to: string
}

export const MAIN_NAV: readonly NavLink[] = [
  { label: 'Home', to: '/' },
  { label: 'Schermen', to: '/collections/schermen' },
  { label: 'Laadpoorten', to: '/collections/laadpoorten' },
  { label: 'Accessoires', to: '/collections/accessoires' },
  { label: 'Onderdelen', to: '/collections/onderdelen' },
  { label: 'Contact', to: '/pages/contact' },
]

export const FOOTER_SERVICE_LINKS: readonly NavLink[] = [
  { label: 'Contact', to: '/pages/contact' },
  { label: 'Veelgestelde vragen', to: '/pages/veelgestelde-vragen' },
  { label: 'Verzending & levering', to: '/pages/verzending' },
  { label: 'Retourbeleid', to: '/pages/retourbeleid' },
  { label: 'Over ons', to: '/pages/over-ons' },
]

export const FOOTER_SHOP_LINKS: readonly NavLink[] = [
  { label: 'Schermen', to: '/collections/schermen' },
  { label: 'Laadpoorten', to: '/collections/laadpoorten' },
  { label: 'Accessoires', to: '/collections/accessoires' },
  { label: 'Onderdelen', to: '/collections/onderdelen' },
  { label: 'Alle producten', to: '/collections/all' },
]

export const FOOTER_LEGAL_LINKS: readonly NavLink[] = [
  { label: 'Privacybeleid', to: '/policies/privacy-policy' },
  { label: 'Algemene voorwaarden', to: '/policies/terms-of-service' },
]

/** Lege waarde = link wordt niet getoond. Vul je profiel-URL's hier in. */
export const SOCIAL_LINKS = {
  instagram: '',
  facebook: '',
  tiktok: '',
} as const

export const PAYMENT_METHODS: readonly string[] = ['iDEAL', 'Klarna', 'Visa', 'Mastercard', 'PayPal', 'Apple Pay']

export const ANNOUNCEMENT = {
  usps: ['Gratis verzending', 'Voor 16:00 besteld, morgen in huis', '14 dagen retour'],
  cta: 'Altijd op tijd, altijd met korting',
  isDismissible: true,
} as const

export const CONTACT_DETAILS = {
  responseTime: 'Reactie binnen 1 werkdag',
  hours: 'Maandag t/m vrijdag 09:00–17:00',
} as const

export interface FaqItem {
  readonly question: string
  readonly answer: string
}

/** Veelgestelde vragen op de contactpagina en /pages/veelgestelde-vragen. */
export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: 'Hoe lang duurt de levering?',
    answer:
      'Bij bestelling op een werkdag voor 16:00 uur leveren wij je pakket de volgende werkdag. We verzenden via PostNL. Je ontvangt een track & trace e-mail zodra je pakket onderweg is.',
  },
  {
    question: 'Wat zijn de verzendkosten?',
    answer: 'Wij verzenden al onze producten gratis, zonder bijkomende kosten.',
  },
  {
    question: 'Hoe kan ik een product retourneren?',
    answer:
      'Je hebt 14 dagen retourrecht na ontvangst van je bestelling. Stuur een e-mail naar info@mooiprijsje.nl met je ordernummer en de reden voor retour. Wij sturen je dan de retourinstructies.',
  },
  {
    question: 'Zijn jullie producten origineel?',
    answer:
      'Al onze producten zijn gecertificeerde kwaliteitsonderdelen. Wij werken uitsluitend met betrouwbare leveranciers die aan onze kwaliteitsnormen voldoen.',
  },
  {
    question: 'Wat als mijn bestelling beschadigd is aangekomen?',
    answer:
      'Als je bestelling beschadigd is ontvangen, neem dan binnen 48 uur contact op via info@mooiprijsje.nl. Stuur een foto mee van de schade en wij zorgen voor een oplossing.',
  },
  {
    question: 'Kan ik mijn bestelling annuleren of wijzigen?',
    answer:
      'Als je bestelling nog niet is verwerkt, kunnen wij deze annuleren of wijzigen. Neem zo snel mogelijk contact met ons op via info@mooiprijsje.nl. Vermeld daarbij je ordernummer.',
  },
]

/** Standaardtekst voor de productpagina wanneer het product geen eigen FAQ heeft. */
export const PRODUCT_FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: 'Past dit product op mijn toestel?',
    answer:
      'Controleer de productomschrijving voor compatibiliteitsinformatie. Twijfel je? Stuur ons een bericht via de contactpagina.',
  },
  {
    question: 'Hoe lang duurt de levering?',
    answer: 'Op werkdagen voor 16:00 uur besteld, is morgen in huis. Verzending is altijd gratis.',
  },
  {
    question: 'Is dit een origineel product?',
    answer: 'Al onze producten zijn gecertificeerde kwaliteitsonderdelen van betrouwbare leveranciers.',
  },
]

export interface InfoSection {
  readonly heading: string
  readonly items: readonly string[]
}

export const SHIPPING_SECTIONS: readonly InfoSection[] = [
  {
    heading: 'Verzending',
    items: [
      'Gratis verzending op alle bestellingen',
      'Standaard levering: 1–2 werkdagen via PostNL',
      'Op werkdagen voor 16:00 besteld? Morgen in huis',
    ],
  },
]

export const RETURN_SECTIONS: readonly InfoSection[] = [
  {
    heading: 'Retourneren',
    items: [
      '14 dagen retourrecht na ontvangst',
      'Product moet ongebruikt en in originele verpakking zijn',
      'Stuur een e-mail naar info@mooiprijsje.nl voor retourinstructies',
      'Retourkosten zijn voor rekening van de koper, tenzij het product defect is',
    ],
  },
]

export const PRODUCT_USPS: readonly string[] = [
  'Altijd gratis verzending',
  '14 dagen retour',
  'Veilig betalen',
  'Vandaag besteld, morgen in huis*',
]

export const DEFAULT_SPECIFICATIONS: readonly (readonly [string, string])[] = [
  ['Compatibiliteit', 'Zie productomschrijving'],
  ['Materiaal', 'Hoogwaardig kunststof / glas'],
  ['Garantie', '12 maanden fabrieksgarantie'],
  ['Inhoud verpakking', '1 stuk'],
  ['Kleur', 'Zie productomschrijving'],
]
