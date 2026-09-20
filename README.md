# mooiprijsje.nl — React-webshop

De React-versie van het Shopify-theme in `../shopify-theme`. Zelfde design, dezelfde pagina's en dezelfde URL's
(`/collections/…`, `/products/…`, `/pages/…`), maar als losse frontend die Shopify als "headless" backend gebruikt.

- **Vite + React 19 + TypeScript**, React Router 7, TanStack Query, Zod
- **Demo-modus** zonder Shopify (voorbeeldproducten), of **live** met je eigen winkel via de Storefront API
- Afrekenen gebeurt op de beveiligde checkout van Shopify

## Snel starten

```bash
npm install
npm run dev        # http://localhost:5173, demo-modus
```

Zonder configuratie zie je een oranje "Demo-modus"-balk en voorbeeldproducten. De winkelwagen werkt, maar
"Afrekenen" is uitgeschakeld.

## Koppelen aan je Shopify-winkel

1. **Storefront API-token maken**: Shopify-beheer → *Instellingen → Apps en verkoopkanalen → Apps ontwikkelen* →
   nieuwe app → *Storefront API-integratie configureren*. Vink minimaal aan:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_product_tags`
   - `unauthenticated_read_checkouts` en `unauthenticated_write_checkouts` (winkelwagen)
   - optioneel `unauthenticated_read_product_inventory` (voor "Laag op voorraad: nog X stuks")
2. **Metafields zichtbaar maken** (optioneel): het theme gebruikte `custom.short_description`,
   `custom.specifications` en `custom.faq`. Zet bij die definities (*Instellingen → Aangepaste gegevens → Producten*)
   *Storefront-toegang* aan, anders zijn ze niet op te halen. Zonder metafields gebruikt de site de eerste alinea van
   de beschrijving en de standaardtabellen.
3. **Collectie `frontpage`**: de bestsellers op de homepage komen uit de collectie met de handle `frontpage`.
4. **`.env` invullen** (kopieer `.env.example`):

   ```
   VITE_SHOPIFY_STORE_DOMAIN=mooiprijsje.myshopify.com
   VITE_SHOPIFY_STOREFRONT_TOKEN=…
   ```

   Het Storefront-token is bedoeld voor gebruik in de browser en mag publiek zijn. Vul nooit een **Admin**-token in.
   Vul je maar één van de twee in, dan meldt de site dat bij het opstarten.

### Nieuwsbrief en contactformulier

Shopify heeft hier geen publieke API voor. Zonder eigen endpoint melden de formulieren eerlijk dat ze nog niet
gekoppeld zijn (in demo-modus slagen ze zonder iets te versturen). Wijs ze naar een dienst of eigen endpoint dat een
JSON-`POST` accepteert (Klaviyo, Formspree, een serverless functie, …):

```
VITE_NEWSLETTER_ENDPOINT=https://…   # ontvangt {"email": "…"}
VITE_CONTACT_ENDPOINT=https://…      # ontvangt {"name","email","subject","message"}
```

## Scripts

| Commando | Doel |
| --- | --- |
| `npm run dev` | ontwikkelserver |
| `npm run build` | typecheck + productiebuild in `dist/` |
| `npm run preview` | productiebuild lokaal bekijken |
| `npm test` | alle tests (Vitest + Testing Library) |
| `npm run coverage` | tests met coverage-rapport |
| `npm run typecheck` | alleen TypeScript |

## Online zetten

`dist/` is een statische site. `vercel.json` en `public/_redirects` sturen alle paden naar `index.html`, dus Vercel en
Netlify werken zonder extra instellingen. Zet de `VITE_…`-variabelen in het dashboard van je host; ze worden bij de
build in de site gezet.

## Beveiliging

- `vercel.json` en `public/_headers` zetten een **Content-Security-Policy** en andere beveiligingsheaders.
  De CSP staat verbindingen toe naar `https://*.myshopify.com`. **Pas hem aan** als je Storefront API op een eigen
  domein draait of als je nieuwsbrief/contact-endpoints (`VITE_…_ENDPOINT`) op een ander domein staan: zet die host
  bij `connect-src`, anders blokkeert de browser de verzoeken.
- Tekst uit Shopify wordt gesaneerd (DOMPurify): scripts, formulieren, inline stijlen, iframes en `data:`-links worden
  verwijderd, zodat een gecompromitteerde app of leverancier geen nep-inlogformulier op je domein kan zetten.
- De site weigert te starten met een Admin-token (`shpat_…`) in `VITE_SHOPIFY_STOREFRONT_TOKEN`, en formulier-endpoints
  moeten `https` zijn (`http` mag alleen voor localhost).
- De Google Fonts worden vanaf Google geladen (het IP-adres van bezoekers gaat naar Google). Wil je dat niet, host
  Poppins en Inter dan zelf en haal de twee Google-hosts uit de CSP.

## Opbouw

```
src/
  config/        teksten en navigatie (was: settings/locales van het theme) — hier pas je copy aan
  data/          toegang tot data achter één interface
    repositories.ts   ShopRepository, CartRepository, FormsGateway
    shopify/          Storefront API (GraphQL) — echte winkel
    mock/             voorbeeldproducten en -winkelwagen — demo-modus
    forms/            nieuwsbrief en contact
  context/       CartContext (winkelwagen), ServicesContext
  hooks/         data-hooks, dialoog-gedrag (Escape, focus, scroll-lock)
  lib/           geld, prijzen/varianten, URL-parameters, validatie, HTML-sanering
  components/    layout/ home/ product/ collection/ common/
  pages/         één bestand per route
  styles/        design tokens + basis-CSS (overgenomen uit het theme)
```

Alle componenten praten met de `data/`-interfaces en weten dus niet of de data uit Shopify of uit de demo komt.

### Van theme-sectie naar component

| Shopify-theme | React |
| --- | --- |
| `announcement-bar`, `header`, `footer` | `components/layout/*` |
| `hero`, `usp-bar`, `category-grid`, `featured-products`, `testimonials`, `newsletter` | `components/home/*` |
| `snippets/product-card` | `components/product/ProductCard` |
| `main-product` | `pages/ProductPage` + `components/product/*` |
| `main-collection` | `pages/CollectionPage` + `components/collection/*` |
| `contact-form`, `about-page` | `pages/ContactPage`, `pages/AboutPage` |
| `theme.js` (vanilla JS) | React-state, hooks en `CartContext` |

## Keuzes en beperkingen

- **Single-page app**: zoekmachines en social previews zien minder van de pagina's dan bij Shopify's eigen theme.
  Is SEO belangrijk, kies dan later voor Shopify **Hydrogen** (React met server-side rendering) of prerendering; de
  componenten en de `data/`-laag zijn daarvoor bruikbaar.
- **Klantaccounts en afrekenen** blijven bij Shopify: het account-icoon en "Naar afrekenen" sturen naar je winkel.
- **`/collections/all`** kan in de Storefront API geen filters tonen; sorteren en bladeren werken wel. Bladeren gaat
  met Vorige/Volgende (cursors), niet met paginanummers.
- **Reviewaantal** (het theme had een vaste "127 beoordelingen") is niet overgenomen: dat was een ingevuld getal, geen
  echte data. Koppel later een reviews-app als je sterren op productpagina's wilt.
- **Productfoto's** in demo-modus zijn getekende plaatshouders; met Shopify komen de echte foto's mee.

## Wat er t.o.v. het theme is opgelost

- Het mobiele menu opende nooit: `theme.js` zocht `.header__burger`, maar de knop heet `.hamburger-btn`.
- De winkelwagenknop in de header had geen click-handler, het paneel werd nergens gevuld ("Filled by AJAX") en de
  teller zocht `.header__cart-count` terwijl de HTML `.cart-count` gebruikt.
- `base.css` zette een losse "A" voor elke footerlink (`content: "A"`).
- Het account-icoon was verborgen op desktop in plaats van op mobiel.
- Toevoegen aan de winkelwagen gaf een `alert()`; nu staat de foutmelding in de pagina.
- Menu's, paneel en filters sluiten met Escape en houden de focus vast; formulieren tonen foutmeldingen per veld.
- Productbeschrijvingen uit Shopify worden gesaneerd (DOMPurify) voordat ze getoond worden.
