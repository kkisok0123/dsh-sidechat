import { useCallback, useEffect, useRef } from 'react'
import type { RefObject } from 'react'

/** Only explicit composer actions/activation may reclaim focus; never a late hidden-tab callback. */
export function useComposerFocus(input: RefObject<HTMLTextAreaElement>, visible: boolean, identity: unknown): () => void {
  const frame = useRef<number | undefined>(undefined)
  const live = useRef(visible)
  live.current = visible
  const cancel = useCallback(() => {
    if (frame.current !== undefined) cancelAnimationFrame(frame.current)
    frame.current = undefined
  }, [])
  const request = useCallback(() => {
    cancel()
    const previous = document.activeElement
    frame.current = requestAnimationFrame(() => {
      frame.current = undefined
      const target = input.current
      if (!live.current || target === null || !target.isConnected || target.closest('[hidden], [inert]') !== null) return
      const active = document.activeElement
      // Outside clicks, annotation editors and dialogs own their own focus.
      if (active !== previous && active !== document.body && active !== target) return
      if (active !== target && (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement || (active instanceof HTMLElement && active.isContentEditable))) return
      if (document.querySelector('[role="dialog"][aria-modal="true"]') !== null) return
      target.focus({ preventScroll: true })
    })
  }, [cancel, input])
  useEffect(() => {
    if (visible) request()
    else cancel()
    return cancel
  }, [visible, identity, request, cancel])
  useEffect(() => {
    const view = input.current?.closest('[data-sidechat-chat-session]')
    view?.addEventListener('sidechat:focus-input', request)
    return () => { view?.removeEventListener('sidechat:focus-input', request) }
  }, [input, identity, request])
  useEffect(() => {
    let ownedAtBlur = false
    const onBlur = () => { ownedAtBlur = document.activeElement === input.current; cancel() }
    const onFocus = () => { if (ownedAtBlur && live.current) request(); ownedAtBlur = false }
    window.addEventListener('blur', onBlur)
    window.addEventListener('focus', onFocus)
    return () => { cancel(); window.removeEventListener('blur', onBlur); window.removeEventListener('focus', onFocus) }
  }, [input, request, cancel])
  return request
}
