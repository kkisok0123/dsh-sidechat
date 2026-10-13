import { expect, it, vi } from 'vitest'
import type { Context } from '../src/client/host/contracts.ts'
import { resolveMainSessionOpener } from '../src/client/host/navigation.ts'
it('uses the current workspace navigation API instead of the removed Session Controller open method', () => {
  const openSession = vi.fn(), legacy = vi.fn()
  const ctx = { get: () => ({ openSession }), sessions: { open: legacy } } as unknown as Context
  resolveMainSessionOpener(ctx)('saved-copy')
  expect(openSession).toHaveBeenCalledWith('saved-copy'); expect(legacy).not.toHaveBeenCalled()
})
it('preserves the old host navigation fallback', () => {
  const open = vi.fn()
  resolveMainSessionOpener({ get: () => undefined, sessions: { open } } as unknown as Context)('saved-copy')
  expect(open).toHaveBeenCalledWith('saved-copy')
})
it('rejects unsupported navigation before a caller creates a saved copy', () => {
  expect(() => resolveMainSessionOpener({ get: () => undefined, sessions: {} } as unknown as Context)).toThrow('No saved copy was created')
})
