/** @vitest-environment jsdom */
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, expect, it, vi } from 'vitest'
import { AnnotateOverlay } from '../src/client/annotate/overlay.tsx'
import { captureSelection, type SelectionController } from '../src/client/annotate/selection.ts'
import { createAnnotationStore } from '../src/client/annotations/model.ts'
import { buildProtocolBlock, splitProtocolPrefix } from '../src/client/annotations/format.ts'
import { sideChatBridge } from '../src/client/bridge.ts'
import { attachLocale } from '../src/client/locales.ts'
import type { Context } from '../src/client/host/contracts.ts'

vi.mock('../src/client/locale-tick.ts', () => ({ useLocaleTick() {} }))
vi.mock('../src/client/host/probes.ts', () => {
  const state = { capabilities: [{ id: 'dock', state: 'available' }] }
  return { hostDiagnostics: () => ({ subscribe: () => () => {}, getSnapshot: () => state }) }
})
vi.mock('../src/client/host/input.ts', () => ({ probeInput: () => ({ state: 'available' }) }))
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
const rect = { left: 10, top: 100, right: 210, bottom: 125, width: 200, height: 25, x: 10, y: 100, toJSON() {} } as DOMRect
Object.defineProperty(Range.prototype, 'getBoundingClientRect', { configurable: true, value: () => rect })
Object.defineProperty(Range.prototype, 'getClientRects', { configurable: true, value: () => [rect] })
const cleanups: (() => void)[] = []
afterEach(() => {
  for (const cleanup of cleanups.splice(0)) cleanup()
  sideChatBridge.current = null
  attachLocale(undefined)
  document.body.replaceChildren()
  window.getSelection()?.removeAllRanges()
  localStorage.clear()
})

function fixture() {
  attachLocale({ getSnapshot: () => ({ active: 'en' }), subscribe: () => () => {} })
  document.body.innerHTML = '<div data-conversation-session="parent"><div data-chat-anchor-key="a:1"><div data-chat-flow-kind="assistant-step">Full selected passage</div></div></div><div data-sidechat-chat-session="child"><div data-sidechat-composer><textarea>Existing question draft</textarea></div></div>'
  const body = document.querySelector<HTMLElement>('[data-chat-flow-kind]')!
  body.getClientRects = () => [rect] as unknown as DOMRectList
  const range = document.createRange(); range.selectNodeContents(body)
  window.getSelection()?.addRange(range)
  const snapshot = captureSelection('parent')!
  let state = { selection: snapshot as typeof snapshot | null }
  const listeners = new Set<() => void>()
  const controller: SelectionController = {
    getSnapshot: () => state, subscribe: fn => { listeners.add(fn); return () => { listeners.delete(fn) } },
    clear: () => { state = { selection: null }; listeners.forEach(fn => fn()) }, dispose() {},
  }
  const list = { current: 'parent' }
  const ctx = { sessions: { list: { getSnapshot: () => list, subscribe: () => () => {} } } } as unknown as Context
  const store = createAnnotationStore(() => 1, localStorage)
  const host = document.createElement('div'); host.dataset.dshSidechat = ''; document.body.append(host)
  const root = createRoot(host)
  act(() => root.render(<AnnotateOverlay ctx={ctx} store={store} controller={controller} />))
  cleanups.push(() => act(() => root.unmount()))
  const draft = document.querySelector<HTMLTextAreaElement>('textarea')!
  const submit = vi.fn(); draft.addEventListener('keydown', submit)
  return { host, store, draft, submit }
}

it('opens the side target immediately, skips note editing, attaches a reference and focuses without changing or sending the draft', async () => {
  const resolve = vi.fn(async () => ({ childId: 'child', title: 'Side', isOpen: () => true }))
  const captureTarget = vi.fn(() => ({ resolve }))
  sideChatBridge.current = { captureTarget }
  const f = fixture()
  await act(async () => { f.host.querySelectorAll<HTMLButtonElement>('[role="toolbar"] button')[1]!.click() })
  expect(captureTarget).toHaveBeenCalledWith('parent')
  expect(resolve).toHaveBeenCalledTimes(1)
  expect(f.host.querySelector('input')).toBeNull()
  expect(f.store.listActive('child')).toMatchObject([{ kind: 'selected-text', note: '', text: 'Full selected passage', sourceSessionId: 'parent' }])
  expect(f.store.listActive('parent')).toHaveLength(0)
  expect(f.host.querySelector('button[title="Full selected passage"]')).toBeNull()
  expect(f.draft.value).toBe('Existing question draft')
  await act(async () => { await new Promise(done => requestAnimationFrame(done)) })
  expect(document.activeElement).toBe(f.draft)
  expect(f.submit).not.toHaveBeenCalled()
  const revived = createAnnotationStore(() => 2, localStorage).listActive('child')
  expect(revived[0]?.kind).toBe('selected-text')
  const wire = buildProtocolBlock(revived)
  expect(wire).toContain('Selected text from the conversation (reference context):')
  expect(splitProtocolPrefix(wire + '\n\nQuestion')?.annotations[0]?.quote).toBe('Full selected passage')
})

it('retains the selection on target failure and retries without a note editor or duplicate references', async () => {
  const resolve = vi.fn().mockRejectedValueOnce(new Error('fork failed')).mockResolvedValueOnce({ childId: 'child', title: 'Side', isOpen: () => true })
  sideChatBridge.current = { captureTarget: () => ({ resolve }) }
  const f = fixture()
  await act(async () => { f.host.querySelectorAll<HTMLButtonElement>('[role="toolbar"] button')[1]!.click() })
  expect(f.host.querySelector('[role="alert"]')).not.toBeNull()
  expect(f.host.querySelector('input')).toBeNull()
  expect(f.store.listActive('child')).toHaveLength(0)
  await act(async () => { [...f.host.querySelectorAll('button')].find(button => button.textContent === 'Retry')!.click() })
  expect(resolve).toHaveBeenCalledTimes(2)
  expect(f.store.listActive('child')).toHaveLength(1)
})

it('Escape aborts a pending target; a late fork result cannot attach its quote', async () => {
  let finish!: (value: { childId: string; title: string; isOpen(): boolean }) => void
  let signal!: AbortSignal
  sideChatBridge.current = { captureTarget: () => ({ resolve: received => { signal = received; return new Promise(yes => { finish = yes }) } }) }
  const f = fixture()
  act(() => { f.host.querySelectorAll<HTMLButtonElement>('[role="toolbar"] button')[1]!.click() })
  expect(f.host.querySelector('[role="status"]')).not.toBeNull()
  act(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })) })
  expect(signal.aborted).toBe(true)
  await act(async () => { finish({ childId: 'child', title: 'Side', isOpen: () => true }) })
  expect(f.store.listActive('child')).toHaveLength(0)
  expect(f.draft.value).toBe('Existing question draft')
})

it('Add to conversation still opens the optional annotation editor and creates no side reference', () => {
  const captureTarget = vi.fn()
  sideChatBridge.current = { captureTarget }
  const f = fixture()
  act(() => { f.host.querySelector<HTMLButtonElement>('[role="toolbar"] button')!.click() })
  expect(f.host.querySelector('input')).not.toBeNull()
  expect(f.store.listActive('parent')[0]?.kind).toBeUndefined()
  expect(f.store.listActive('child')).toHaveLength(0)
  expect(captureTarget).not.toHaveBeenCalled()
})
