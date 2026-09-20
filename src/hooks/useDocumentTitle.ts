import { useEffect } from 'react'
import { SITE } from '@/config/site'

/** Zet de tabtitel, zoals het Shopify-theme: "Pagina – mooiprijsje.nl". */
export function useDocumentTitle(title: string | null | undefined): void {
  useEffect(() => {
    document.title = title && !title.includes(SITE.name) ? `${title} – ${SITE.name}` : (title ?? SITE.name)
  }, [title])
}
