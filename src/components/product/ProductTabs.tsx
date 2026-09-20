import { useId, useRef, useState, type KeyboardEvent } from 'react'
import {
  DEFAULT_SPECIFICATIONS,
  PRODUCT_FAQ_ITEMS,
  RETURN_SECTIONS,
  SHIPPING_SECTIONS,
  type InfoSection,
} from '@/config/site'
import type { Product } from '@/types/shop'
import { FaqAccordion } from '../common/FaqAccordion'
import { RichText } from '../common/RichText'
import './product.css'

type TabId = 'description' | 'specs' | 'faq' | 'shipping'

const TABS: readonly { readonly id: TabId; readonly label: string }[] = [
  { id: 'description', label: 'Beschrijving' },
  { id: 'specs', label: 'Specificaties' },
  { id: 'faq', label: 'Veelgestelde vragen' },
  { id: 'shipping', label: 'Verzending & Retour' },
]

function InfoSections({ sections }: { readonly sections: readonly InfoSection[] }) {
  return (
    <>
      {sections.map((section) => (
        <div key={section.heading}>
          <h3>{section.heading}</h3>
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

function nextTabIndex(key: string, index: number): number | null {
  const last = TABS.length - 1
  switch (key) {
    case 'ArrowRight':
      return index === last ? 0 : index + 1
    case 'ArrowLeft':
      return index === 0 ? last : index - 1
    case 'Home':
      return 0
    case 'End':
      return last
    default:
      return null
  }
}

export function ProductTabs({ product }: { readonly product: Product }) {
  const [activeTab, setActiveTab] = useState<TabId>('description')
  const baseId = useId()
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number): void => {
    const next = nextTabIndex(event.key, index)
    const target = next === null ? undefined : TABS[next]
    if (next === null || !target) return
    event.preventDefault()
    setActiveTab(target.id)
    tabRefs.current[next]?.focus()
  }

  return (
    <div className="product__tabs">
      <div className="product__tabs-nav" role="tablist" aria-label="Productinformatie">
        {TABS.map((tab, index) => (
          <button
            key={tab.id}
            ref={(element) => {
              tabRefs.current[index] = element
            }}
            type="button"
            role="tab"
            id={`${baseId}-tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`${baseId}-panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            className={activeTab === tab.id ? 'product__tab-btn product__tab-btn--active' : 'product__tab-btn'}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {TABS.map((tab) => (
        <div
          key={tab.id}
          id={`${baseId}-panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${tab.id}`}
          tabIndex={0}
          hidden={activeTab !== tab.id}
          className="product__tab-panel"
        >
          {tab.id === 'description' &&
            (product.descriptionHtml.trim() ? (
              <RichText html={product.descriptionHtml} />
            ) : (
              <p>Voor dit product is nog geen beschrijving beschikbaar.</p>
            ))}

          {tab.id === 'specs' &&
            (product.specificationsHtml ? (
              <RichText html={product.specificationsHtml} />
            ) : (
              <table className="specs-table">
                <tbody>
                  {DEFAULT_SPECIFICATIONS.map(([label, value]) => (
                    <tr key={label}>
                      <th scope="row">{label}</th>
                      <td>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ))}

          {tab.id === 'faq' &&
            (product.faqHtml ? <RichText html={product.faqHtml} /> : <FaqAccordion items={PRODUCT_FAQ_ITEMS} />)}

          {tab.id === 'shipping' && (
            <div className="product__shipping">
              <InfoSections sections={SHIPPING_SECTIONS} />
              <InfoSections sections={RETURN_SECTIONS} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
