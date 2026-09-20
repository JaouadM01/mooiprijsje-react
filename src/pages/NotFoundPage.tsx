import { Link } from 'react-router-dom'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { EmptyState } from '@/components/common/StatusMessage'
import './pages.css'

export function NotFoundPage({ message = 'Deze pagina bestaat niet (meer).' }: { readonly message?: string }) {
  useDocumentTitle('Pagina niet gevonden')

  return (
    <div className="page-width not-found">
      <EmptyState title="Niet gevonden">
        <p>{message}</p>
        <Link to="/" className="btn-primary">
          Naar de homepage
        </Link>
      </EmptyState>
    </div>
  )
}
