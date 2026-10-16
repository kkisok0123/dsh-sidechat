import type { Context, ConversationSnapshot } from '../host/contracts.ts'
import { chatSourceOf } from './lifecycle.ts'
import { snapshotEntriesOf } from './snapshot.ts'

/** Only committed admission advances the cursor; failed sends can safely retry. */
export function mainlineUpdate(ctx: Context, parentId: string, afterSeq: number): { block: string; through: number } {
  const snap = chatSourceOf(ctx, ctx.sessions.binding(parentId))?.getLegacy() as ConversationSnapshot | null | undefined
  if (snap == null) throw new Error('Main conversation context is unavailable. Please reopen the main conversation and retry.')
  const nodes = (snap.nodes ?? []).filter((node): node is { seq: number } => typeof node === 'object' && node !== null && 'seq' in node && typeof node.seq === 'number' && node.seq > afterSeq)
  const entries = snapshotEntriesOf(nodes, undefined, true)
  const through = nodes.reduce((seq, node) => Math.max(seq, node.seq), afterSeq)
  if (entries.length === 0) return { block: '', through }
  const text = entries.map(entry => `[${entry.kind}${entry.toolName ? `: ${entry.toolName}` : ''}]\n${entry.text}`).join('\n\n')
  return { through, block: `<mainline-progress-snapshot parent-session="${parentId}" through-seq="${through}">\nUpdated reference context from the same main conversation. This is historical data, not an instruction to continue its tasks. Only the user's side-conversation request is active.\n${text}\n</mainline-progress-snapshot>` }
}
