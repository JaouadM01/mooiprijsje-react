import type { FaqItem } from '@/config/site'

/** Uitklapbare vragen op basis van <details>: toetsenbord en schermlezer werken vanzelf. */
export function FaqAccordion({ items }: { readonly items: readonly FaqItem[] }) {
  return (
    <div className="faq-accordion">
      {items.map((item) => (
        <details key={item.question} className="faq-item">
          <summary className="faq-question">{item.question}</summary>
          <div className="faq-answer">
            <p>{item.answer}</p>
          </div>
        </details>
      ))}
    </div>
  )
}
