import type { ReactNode } from 'react'
import type { Context } from './contracts.ts'

type Selector<T> = <R>(select: (value: T) => R) => R
interface NativeConversationProps {
  sessionId: string
  useSession: Selector<{ blank?: boolean; awaitingFirstTurn?: boolean; running?: boolean; openState?: string; promptAttempted?: boolean }>
  useConversation: Selector<{ activeTargets: ReadonlySet<string> }>
  useSessions: Selector<{ byId: Record<string, { blank?: boolean } | undefined> }>
  renderFactorySlot: (name: 'conversation.content', owner: object, options?: object) => ReactNode
}

/** Uses exactly the embedded Conversation Factory that DSH's own sidebar chat uses. */
function NativeConversation(props: NativeConversationProps): ReactNode {
  const session = props.useSession(value => value)
  const activeTargets = props.useConversation(value => value.activeTargets)
  const summaryBlank = props.useSessions(value => value.byId[props.sessionId]?.blank)
  const active = activeTargets.size > 0 || (!session.blank && !session.awaitingFirstTurn) || session.running
  const settling = !active && session.openState === 'loading' && summaryBlank !== true
  const hero = !active && (session.openState === 'open' || summaryBlank === true)
  return props.renderFactorySlot('conversation.content', {
    variant: 'embedded', phase: settling ? 'settling' : hero ? 'hero' : 'active', hero,
  })
}

export function registerNativeConversation(ctx: Context): void {
  ctx.slots.inject('dsh-sidechat.conversation', () => ctx.slots.register({
    name: 'dsh-sidechat.conversation', id: 'dsh-sidechat-native-conversation',
  }, NativeConversation))
}

/** Feature-detect the native Factory; do not claim parity on old hosts. */
export function supportsNativeConversation(ctx: Context): boolean {
  const slots = ctx.get('slots') as { snapshot?: (root: string) => readonly unknown[] } | undefined
  try { return typeof slots?.snapshot === 'function' && slots.snapshot('factory:conversation.content').length > 0 }
  catch { return false }
}
