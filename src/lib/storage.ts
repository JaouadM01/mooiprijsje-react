export type StorageKind = 'local' | 'session'

function getStorage(kind: StorageKind): Storage | null {
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage
  } catch {
    // Toegang tot opslag kan geblokkeerd zijn (privémodus, strikte cookie-instellingen).
    return null
  }
}

/**
 * Opslag is een gemak, geen vereiste: bij blokkeren of een volle opslag werkt de site
 * gewoon door, alleen zonder onthouden voorkeuren.
 */
export function readStorage(kind: StorageKind, key: string): string | null {
  try {
    return getStorage(kind)?.getItem(key) ?? null
  } catch {
    return null
  }
}

export function writeStorage(kind: StorageKind, key: string, value: string): void {
  try {
    getStorage(kind)?.setItem(key, value)
  } catch {
    // Zie readStorage: niet fataal.
  }
}

export function removeStorage(kind: StorageKind, key: string): void {
  try {
    getStorage(kind)?.removeItem(key)
  } catch {
    // Zie readStorage: niet fataal.
  }
}
