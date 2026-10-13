import type { Context } from './contracts.ts'

/** Resolve before creating a saved copy, so unsupported navigation cannot create duplicate copies on retry. */
export function resolveMainSessionOpener(ctx: Context): (sessionId: string) => void {
  let ui: { openSession?: (sessionId: string) => void } | undefined
  try { ui = ctx.get('uiWorkspace') as typeof ui } catch { /* older hosts */ }
  if (typeof ui?.openSession === 'function') return id => ui!.openSession!(id)
  if (typeof ctx.sessions.open === 'function') return id => ctx.sessions.open(id)
  throw new Error('The host cannot open the saved session. No saved copy was created.')
}
