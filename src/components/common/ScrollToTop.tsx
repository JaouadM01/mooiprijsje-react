import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

/** Bij een nieuwe pagina: terug naar boven en focus naar de hoofdinhoud (voor toetsenbord/schermlezer). */
export function ScrollToTop() {
  const { pathname, hash } = useLocation()
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (hash) return
    window.scrollTo(0, 0)
    document.getElementById('MainContent')?.focus({ preventScroll: true })
  }, [pathname, hash])

  return null
}
