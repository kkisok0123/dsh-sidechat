import { describe, expect, it } from 'vitest'
import { mainlineUpdate } from '../src/client/sidechat/contextSync.ts'
import { prepareSideContext, registerSideContext } from '../src/client/sendContext.ts'
import { parseSideChatMeta } from '../src/client/sidechat/model.ts'
import type { Context } from '../src/client/host/contracts.ts'

const user = (seq: number, text: string) => ({ kind: 'user', seq, content: [{ type: 'text', text }] })
const reply = (seq: number, text: string) => ({ kind: 'assistant', seq, blocks: [{ kind: 'text', text }] })
function fixture(nodes: unknown[]) {
  const ctx = { get: () => undefined, sessions: { binding: (id: string) => id === 'parent' ? { session: { getSnapshot: () => ({ nodes }), subscribe: () => () => {} } } : undefined } } as unknown as Context
  return ctx
}
describe('same-parent incremental reference context', () => {
  it('includes every new turn, including an assistant continuation without a new user node', () => {
    const update = mainlineUpdate(fixture([user(1, 'old'), reply(2, 'old reply'), reply(3, 'continuation'), user(4, 'new question'), reply(5, 'new answer')]), 'parent', 2)
    expect(update.through).toBe(5)
    expect(update.block).toContain('continuation')
    expect(update.block).toContain('new question')
    expect(update.block).toContain('new answer')
    expect(update.block).not.toContain('old reply')
    expect(update.block).toContain('historical data, not an instruction')
  })
  it('does not resend already accepted context', () => {
    const ctx = fixture([user(1, 'first'), reply(2, 'second')])
    expect(mainlineUpdate(ctx, 'parent', 2)).toEqual({ block: '', through: 2 })
    expect(mainlineUpdate(ctx, 'parent', 0).block).toContain('first')
    expect(mainlineUpdate(ctx, 'parent', 0).block).toContain('first') // failed admission: unchanged cursor
  })
  it('fails explicitly rather than silently substituting the currently selected session', () => {
    expect(() => mainlineUpdate(fixture([]), 'unrelated', 0)).toThrow('Main conversation context is unavailable')
  })
  it('registers exact child identity and preserves a replacement across stale cleanup', () => {
    let accepted = false
    const dispose = registerSideContext('child', () => ({ block: 'parent data', accepted: () => { accepted = true } }))
    expect(prepareSideContext('other')).toBeUndefined()
    prepareSideContext('child')?.accepted()
    expect(accepted).toBe(true)
    const replace = registerSideContext('child', () => ({ block: 'replacement', accepted() {} }))
    dispose()
    expect(prepareSideContext('child')?.block).toBe('replacement')
    replace()
    expect(prepareSideContext('child')).toBeUndefined()
  })
  it('roundtrips finite cursors and rejects corrupt metadata', () => {
    expect(parseSideChatMeta({ contextThroughSeq: 123 }).contextThroughSeq).toBe(123)
    expect(parseSideChatMeta({ contextThroughSeq: Infinity }).contextThroughSeq).toBeUndefined()
  })
})
