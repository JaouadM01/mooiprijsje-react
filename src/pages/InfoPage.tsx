import { useParams } from 'react-router-dom'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { FaqAccordion } from '@/components/common/FaqAccordion'
import { FAQ_ITEMS, RETURN_SECTIONS, SHIPPING_SECTIONS, SITE, type InfoSection } from '@/config/site'
import { useServices } from '@/context/ServicesContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { NotFoundPage } from './NotFoundPage'
import './pages.css'

export type InfoPageKind = 'faq' | 'shipping' | 'returns' | 'policy'

const POLICY_TITLES: Readonly<Record<string, string>> = {
  'privacy-policy': 'Privacybeleid',
  'terms-of-service': 'Algemene voorwaarden',
}

const PAGE_TITLES: Readonly<Record<Exclude<InfoPageKind, 'policy'>, string>> = {
  faq: 'Veelgestelde vragen',
  shipping: 'Verzending & levering',
  returns: 'Retourbeleid',
}

function Sections({ sections }: { readonly sections: readonly InfoSection[] }) {
  return (
    <>
      {sections.map((section) => (
        <div key={section.heading}>
          <h2>{section.heading}</h2>
          <ul>
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </>
  )
}

function PolicyBody({ handle }: { readonly handle: string }) {
  const { meta } = useServices()
  const storeOrigin = meta.accountUrl ? new URL(meta.accountUrl).origin : null

  return storeOrigin ? (
    <p>
      Onze voorwaarden en beleid staan op onze webwinkel:{' '}
      <a href={`${storeOrigin}/policies/${handle}`} rel="noopener noreferrer">
        bekijk het volledige document
      </a>
      .
    </p>
  ) : (
    <p>
      In de demo-modus is deze tekst nog niet ingevuld. Met een gekoppelde Shopify-winkel verwijst deze pagina naar het
      beleid dat je in Shopify hebt ingesteld. Vragen? Mail ons via <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
    </p>
  )
}

export function InfoPage({ page }: { readonly page: InfoPageKind }) {
  const { handle = '' } = useParams()
  // hasOwn: een handle als "constructor" of "__proto__" mag geen eigenschap van Object zijn.
  const policyTitle = Object.hasOwn(POLICY_TITLES, handle) ? POLICY_TITLES[handle] : undefined
  const title = page === 'policy' ? policyTitle : PAGE_TITLES[page]
  useDocumentTitle(title ?? 'Pagina niet gevonden')

  if (title === undefined) return <NotFoundPage />

  return (
    <section className="page-width info-page">
      <Breadcrumb items={[{ label: 'Thuis', to: '/' }, { label: title }]} />
      <h1 className="info-page__title">{title}</h1>
      <div className="info-page__body rte">
        {page === 'faq' && <FaqAccordion items={FAQ_ITEMS} />}
        {page === 'shipping' && <Sections sections={SHIPPING_SECTIONS} />}
        {page === 'returns' && <Sections sections={RETURN_SECTIONS} />}
        {page === 'policy' && <PolicyBody handle={handle} />}
      </div>
    </section>
  )
}
