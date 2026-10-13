/** @vitest-environment jsdom */
import { act, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, expect, it, vi } from 'vitest'
import { useComposerFocus } from '../src/client/sidechat/composer/focus.ts'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
let next = 0
const frames = new Map<number, FrameRequestCallback>()
const cleanups: (() => void)[] = []
vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { frames.set(++next, callback); return next })
vi.stubGlobal('cancelAnimationFrame', (id: number) => { frames.delete(id) })
function flush() { const pending = [...frames.values()]; frames.clear(); act(() => { for (const callback of pending) callback(0) }) }
afterEach(() => { for (const cleanup of cleanups.splice(0)) cleanup(); document.body.replaceChildren(); frames.clear() })
function fixture() {
  const host = document.createElement('div'); document.body.append(host)
  const root = createRoot(host)
  function View({ visible = true, identity = 'child' }: { visible?: boolean; identity?: string }) {
    const ref = useRef<HTMLTextAreaElement>(null)
    const request = useComposerFocus(ref, visible, identity)
    return <div data-sidechat-chat-session="child"><div data-sidechat-composer><textarea ref={ref} defaultValue="abc" /><button onClick={request}>Model</button></div></div>
  }
  const render = (visible = true, identity = 'child') => act(() => root.render(<View visible={visible} identity={identity} />))
  render(); cleanups.push(() => act(() => root.unmount()))
  const input = host.querySelector('textarea')!, button = host.querySelector('button')!
  return { host, input, button, render }
}
it('restores the textarea after an explicit composer action without changing its caret', () => {
  const f = fixture(); flush(); f.input.setSelectionRange(1, 1); f.button.focus()
  act(() => f.button.click()); flush(); expect(document.activeElement).toBe(f.input); expect(f.input.selectionStart).toBe(1)
})
it('cancels pending bridge/activation focus when a panel becomes hidden', () => {
  const f = fixture(); f.render(false); flush(); expect(document.activeElement).not.toBe(f.input)
  act(() => f.host.firstElementChild!.dispatchEvent(new Event('sidechat:focus-input'))); flush(); expect(document.activeElement).not.toBe(f.input)
})
it('does not steal a click to another editor or a foreground dialog', () => {
  const f = fixture(); const note = document.createElement('input'); document.body.append(note); note.focus(); flush(); expect(document.activeElement).toBe(note)
  const dialog = document.createElement('div'); dialog.setAttribute('role', 'dialog'); dialog.setAttribute('aria-modal', 'true'); document.body.append(dialog)
  f.button.focus(); act(() => f.button.click()); flush(); expect(document.activeElement).toBe(f.button)
})
it('recovers window-return focus only when this visible textarea owned focus at blur', () => {
  const f = fixture(); flush(); expect(document.activeElement).toBe(f.input)
  act(() => window.dispatchEvent(new Event('blur'))); f.input.blur(); act(() => window.dispatchEvent(new Event('focus'))); flush(); expect(document.activeElement).toBe(f.input)
  f.button.focus(); act(() => window.dispatchEvent(new Event('blur'))); f.button.blur(); act(() => window.dispatchEvent(new Event('focus'))); flush(); expect(document.activeElement).toBe(document.body)
})
it('does not execute a stale request after the user moves to a different control', () => {
  const f = fixture(); const other = document.createElement('button'); document.body.append(other); other.focus(); flush(); expect(document.activeElement).toBe(other)
})
