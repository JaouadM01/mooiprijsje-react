import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

let scrollLockCount = 0

function lockScroll(): void {
  scrollLockCount += 1
  document.body.classList.add('is-scroll-locked')
}

function unlockScroll(): void {
  scrollLockCount = Math.max(0, scrollLockCount - 1)
  if (scrollLockCount === 0) document.body.classList.remove('is-scroll-locked')
}

interface DialogBehaviorOptions {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly containerRef: RefObject<HTMLElement | null>
}

/**
 * Gedrag van een modaal paneel: Escape sluit, Tab blijft binnen het paneel, de pagina
 * eronder scrollt niet en de focus keert terug naar het element dat het paneel opende.
 */
export function useDialogBehavior({ isOpen, onClose, containerRef }: DialogBehaviorOptions): void {
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!isOpen) return
    const container = containerRef.current
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const getFocusable = (): HTMLElement[] =>
      container ? Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)) : []

    lockScroll()
    ;(getFocusable()[0] ?? container)?.focus()

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab') return

      const items = getFocusable()
      const first = items[0]
      const last = items[items.length - 1]
      if (!first || !last) return

      // Focus staat buiten het paneel of op het paneel zelf (bijv. nadat het gefocuste element verdween):
      // haal hem terug naar binnen in plaats van de pagina erachter te laten focussen.
      const active = document.activeElement
      if (!container || !container.contains(active) || active === container) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus()
        return
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      unlockScroll()
      previouslyFocused?.focus()
    }
  }, [isOpen, containerRef])
}
