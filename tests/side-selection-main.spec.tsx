/** @vitest-environment jsdom */
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, expect, it, vi } from 'vitest'
import { AnnotateOverlay } from '../src/client/annotate/overlay.tsx'
import { captureSelection, type SelectionController } from '../src/client/annotate/selection.ts'
import { createAnnotationStore } from '../src/client/annotations/model.ts'
import type { Context } from '../src/client/host/contracts.ts'
import { resolveRange } from '../src/client/annotate/anchor.ts'
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
afterEach(() => { for (const cleanup of cleanups.splice(0)) cleanup(); document.body.replaceChildren(); window.getSelection()?.removeAllRanges(); localStorage.clear() })
function fixture(parent = 'parent') {
  const source = document.createElement('div')
  source.dataset.sidechatChatSession = 'child'; source.dataset.sidechatParentSession = parent; source.dataset.sidechatViewTitle = 'Side'
  source.innerHTML = '<div data-sidechat-message-role="assistant" data-sidechat-message-key="a:1"><div data-sidechat-quote-body data-sidechat-streaming="false">Side answer quote</div></div>'
  document.body.append(source)
  const body = source.querySelector<HTMLElement>('[data-sidechat-quote-body]')!
  body.getClientRects = () => [rect] as unknown as DOMRectList
  const range = document.createRange(); range.selectNodeContents(body); window.getSelection()?.addRange(range)
  const selection = captureSelection('parent')!
  expect(selection.source.parentSessionId).toBe(parent)
  let state = { selection }
  const listeners = new Set<() => void>()
  const controller = { getSnapshot: () => state, subscribe: (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn) } },
    clear: () => { state = { selection: null as any }; listeners.forEach(fn => fn()) }, dispose() {} } satisfies SelectionController
  const list = { current: 'parent' }
  const ctx = { sessions: { list: { getSnapshot: () => list, subscribe: () => () => {} } } } as unknown as Context
  const store = createAnnotationStore(() => 1, localStorage)
  const host = document.createElement('div'); host.dataset.dshSidechat = ''; document.body.append(host)
  const root = createRoot(host)
  act(() => root.render(<AnnotateOverlay ctx={ctx} store={store} controller={controller} />))
  cleanups.push(() => act(() => root.unmount()))
  return { source, body, host, store, list }
}
it('offers both destinations and attaches a child quote to the parent without changing source identity', () => {
  const f = fixture()
  const toolbar = f.host.querySelector('[role="toolbar"]')!
  expect(toolbar.textContent).toContain('Add to conversation'); expect(toolbar.textContent).toContain('Ask in side chat')
  act(() => toolbar.querySelector('button')!.click())
  const annotation = f.store.listActive('parent')[0]!
  expect(annotation).toMatchObject({ sessionId: 'parent', sourceSessionId: 'child', sourceSurface: 'side', text: 'Side answer quote', anchorKey: 'a:1' })
  expect(f.store.listActive('child')).toHaveLength(0)
  expect(f.host.textContent).toContain('Main conversation')
  act(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })))
  const restored = createAnnotationStore(() => 2, localStorage).listActive('parent')[0]!
  expect(restored.sourceSessionId).toBe('child'); expect(restored.sourceSurface).toBe('side')
  expect(resolveRange(restored, new Map(), 'parent')?.startContainer).toBe(f.body.firstChild)
})
it('keeps Ask in side chat attached to the original child, without forking another side session', () => {
  const f = fixture(); act(() => f.host.querySelectorAll<HTMLButtonElement>('[role="toolbar"] button')[1]!.click())
  expect(f.store.listActive('child')[0]).toMatchObject({ sessionId: 'child', sourceSessionId: 'child', sourceSurface: 'side' })
  expect(f.store.listActive('parent')).toHaveLength(0)
})
it('never directs a quote to an unrelated currently displayed main session', () => {
  const f = fixture('different-parent')
  expect(f.host.querySelector<HTMLButtonElement>('[role="toolbar"] button')!.disabled).toBe(true)
  expect(f.store.listActive('parent')).toHaveLength(0)
})
it('Escape cancels the new parent-owned annotation without touching child state', () => {
  const f = fixture(); act(() => f.host.querySelector<HTMLButtonElement>('[role="toolbar"] button')!.click())
  act(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })))
  expect(f.store.listActive('parent')).toHaveLength(0); expect(f.store.listActive('child')).toHaveLength(0)
})
