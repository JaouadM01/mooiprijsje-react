import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from './ErrorBoundary'

function Bomb(): never {
  throw new Error('kapot')
}

describe('ErrorBoundary', () => {
  it('renders its children normally', () => {
    render(
      <ErrorBoundary>
        <p>alles goed</p>
      </ErrorBoundary>,
    )
    expect(screen.getByText('alles goed')).toBeInTheDocument()
  })

  it('shows a friendly message with a way out instead of a blank screen', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Er ging iets mis')
    expect(screen.getByRole('link', { name: 'Naar de homepage' })).toHaveAttribute('href', '/')
    expect(spy).toHaveBeenCalledWith('Onverwachte fout in de weergave', expect.any(Error), expect.any(String))
    spy.mockRestore()
  })
})
