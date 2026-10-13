/** @vitest-environment jsdom */
import { afterEach, expect, it, vi } from 'vitest'
import { createTemporarySideRegistry, migrateTemporarySideChats, TEMPORARY_SIDE_KEY } from '../src/client/sidechat/temporary.ts'
import { installTemporaryWorkspaceRows } from '../src/client/host/temporaryRows.ts'
afterEach(() => { localStorage.clear(); document.body.replaceChildren(); document.querySelectorAll('[data-sidechat-temporary-rows]').forEach(node => node.remove()); vi.restoreAllMocks() })
it('persists only explicit child identities and preserves them beyond recent-tab history limits', () => {
  const registry = createTemporarySideRegistry(localStorage)
  for (let i = 0; i < 8; i++) registry.mark(`child-${i}`, 'parent')
  registry.mark('parent', 'parent'); registry.mark('bad"]', 'parent')
  expect(registry.list()).toHaveLength(8)
  const restored = createTemporarySideRegistry(localStorage)
  expect(restored.list()).toEqual(registry.list())
  // Save as session creates a separate ordinary fork; it has no temporary identity.
  expect(restored.list()).not.toContain('saved-copy')
})
it('imports live/recent plugin child metadata without guessing by titles or ordinary fork ancestry', () => {
  localStorage.setItem('dsh-sidechat:side-meta:v1:parent:tab2', JSON.stringify({ childId: 'live-child', sessionId: 'parent' }))
  localStorage.setItem('dsh-sidechat:closed-side:v1:parent', JSON.stringify([{ childId: 'closed-child', parentSessionId: 'parent' }]))
  localStorage.setItem('dsh-sidechat:side-meta:v1:broken:tab', 'broken')
  localStorage.setItem('other-plugin:Side', JSON.stringify({ childId: 'ordinary', parentSessionId: 'parent' }))
  const registry = createTemporarySideRegistry(localStorage); migrateTemporarySideChats(localStorage, registry)
  expect(registry.list()).toEqual(['live-child', 'closed-child'])
})
it('merges identities written by another window without losing this window’s hidden sessions', () => {
  const a = createTemporarySideRegistry(localStorage), b = createTemporarySideRegistry(localStorage)
  a.mark('child-a', 'parent'); b.mark('child-b', 'parent'); a.refresh()
  expect(a.list()).toEqual(['child-a', 'child-b'])
  expect(JSON.parse(localStorage.getItem(TEMPORARY_SIDE_KEY)!)).toEqual(['child-a', 'child-b'])
})
it('uses a scoped row-only presentation rule, preserving transcript/editor DOM and ordinary rows', () => {
  const registry = createTemporarySideRegistry(null)
  const dispose = installTemporaryWorkspaceRows(registry)
  document.body.innerHTML = '<div role="treeitem" data-row-key="session:child">temporary</div><div role="treeitem" data-row-key="session:parent">main</div><div data-conversation-session="child">transcript</div>'
  registry.mark('child', 'parent')
  expect(getComputedStyle(document.querySelector('[data-row-key="session:child"]')!).display).toBe('none')
  expect(getComputedStyle(document.querySelector('[data-row-key="session:parent"]')!).display).not.toBe('none')
  expect(getComputedStyle(document.querySelector('[data-conversation-session]')!).display).not.toBe('none')
  dispose(); expect(document.querySelector('[data-sidechat-temporary-rows]')).toBeNull()
})
it('continues hiding in memory if persistence is unavailable without any host archive/delete calls', () => {
  const storage = { getItem: () => null, setItem: () => { throw Error('quota') } } as unknown as Storage
  const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const registry = createTemporarySideRegistry(storage); registry.mark('child', 'parent')
  expect(registry.list()).toEqual(['child']); expect(warning).toHaveBeenCalledOnce()
})
