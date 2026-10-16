/** Shared send admission hook. Exact session identity prevents navigation retargeting. */
export interface SendContext { block: string; accepted(): void }
const sources = new Map<string, () => SendContext>()
export function registerSideContext(childId: string, source: () => SendContext): () => void {
  sources.set(childId, source)
  return () => { if (sources.get(childId) === source) sources.delete(childId) }
}
export function prepareSideContext(childId: string): SendContext | undefined {
  return sources.get(childId)?.()
}
