/** View-only side-session identity. Never archive, delete, or alter the host's session authority. */
export const TEMPORARY_SIDE_KEY = 'dsh-sidechat:temporary-sessions:v1'
const safeId = (value: unknown): value is string => typeof value === 'string' && /^[A-Za-z0-9._:-]+$/.test(value)

export function createTemporarySideRegistry(storage: Storage | null) {
  const ids = new Set<string>()
  const listeners = new Set<() => void>()
  const read = (): string[] => {
    try {
      const value: unknown = JSON.parse(storage?.getItem(TEMPORARY_SIDE_KEY) ?? '[]')
      return Array.isArray(value) ? value.filter(safeId) : []
    } catch { return [] }
  }
  read().forEach(id => ids.add(id))
  const notify = () => { for (const listener of listeners) listener() }
  const refresh = (): void => {
    let changed = false
    for (const id of read()) if (!ids.has(id)) { ids.add(id); changed = true }
    if (changed) notify()
  }
  const mark = (childId: string, parentSessionId: string): void => {
    if (!safeId(childId) || !safeId(parentSessionId) || childId === parentSessionId) return
    refresh()
    if (ids.has(childId)) return
    ids.add(childId)
    try { storage?.setItem(TEMPORARY_SIDE_KEY, JSON.stringify([...ids])) }
    catch { console.warn('[dsh-sidechat] Temporary side-session visibility is retained only for this page.') }
    notify()
  }
  return { list: () => [...ids], mark, refresh, subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener) } } }
}

let registry: ReturnType<typeof createTemporarySideRegistry> | undefined
export function temporarySideRegistry() {
  if (registry === undefined) {
    let storage: Storage | null = null
    try { storage = typeof localStorage === 'undefined' ? null : localStorage } catch { /* memory-only */ }
    registry = createTemporarySideRegistry(storage)
  }
  return registry
}
export function markTemporarySideChat(childId: string, parentSessionId: string): void {
  temporarySideRegistry().mark(childId, parentSessionId)
}

/** Import only explicit plugin metadata, never guess from titles or fork ancestry. */
export function migrateTemporarySideChats(storage: Storage | null, target = temporarySideRegistry()): void {
  if (storage === null) return
  try {
    const keys = Array.from({ length: storage.length }, (_, index) => storage.key(index))
    for (const key of keys) {
      if (key === null || (!key.startsWith('dsh-sidechat:side-meta:v1:') && !key.startsWith('dsh-sidechat:closed-side:v1:'))) continue
      try {
        const value = JSON.parse(storage.getItem(key) ?? 'null')
        const entries = Array.isArray(value) ? value : [value]
        for (const entry of entries) {
          if (entry === null || typeof entry !== 'object') continue
          const parent = entry.parentSessionId ?? entry.sessionId
          if (safeId(entry.childId) && safeId(parent)) target.mark(entry.childId, parent)
        }
      } catch { /* A damaged recovery record must not affect other sessions. */ }
    }
  } catch { /* Storage may be unavailable; mounted panels still mark in memory. */ }
}
