/** @vitest-environment jsdom */
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, expect, it, vi } from 'vitest'
import type { Context } from '../src/client/host/contracts.ts'
import { ModelMenu } from '../src/client/sidechat/ModelMenu.tsx'
import { selectModelConfirmed } from '../src/client/host/models.ts'

vi.mock('@deepseek-ai/dsh-client-ui-primitives', () => ({ Menu: (props: any) => <>{props.anchor}{props.open && <div>{props.items.filter((item: any) => item.label).map((item: any) => <button key={item.id} data-choice={item.id} data-checked={String(!!item.icon)} onClick={() => props.onSelect(item.id)}>{item.label}</button>)}</div>}</> }))
vi.mock('../src/client/locale-tick.ts', () => ({ useLocaleTick() {} }))
vi.mock('../src/client/host/icons.ts', () => ({ IconCheckOutline16: () => <svg />, IconChevronDownOutline14: () => <svg /> }))
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
const cleanups: (() => void)[] = []
afterEach(() => { for (const cleanup of cleanups.splice(0)) cleanup(); document.body.replaceChildren() })
function fixture() {
  let current = { provider: 'openai-codex', model: 'gpt-6.1-sol' }
  const modelCatalog = vi.fn(async () => ({ ok: true, value: { default: current, routableProviders: ['motphys', 'openai-codex'], groups: [
    { id: 'motphys', name: 'motphys', models: [{ id: 'gpt-6.1-sol', name: 'gpt-6.1-sol' }] },
    { id: 'openai-codex', name: 'ChatGPT subscription', models: [{ id: 'gpt-6.1-sol', name: 'GPT-6.1-Sol' }] },
    { id: 'custom/provider', name: 'Custom', models: [{ id: 'custom/model', name: 'Custom model' }] },
  ] } }))
  const selectModel = vi.fn(async (request: any): Promise<any> => { current = { provider: request.provider, model: request.model }; return { ok: true, value: { selected: current } } })
  const ctx = { get: (name: string) => name === 'remote.session' ? { selectModel, modelCatalog } : undefined,
    sessions: { binding: () => ({ session: { projections: { faceOf: () => ({ getSnapshot: () => ({ next: current }) }) } } }) } } as unknown as Context
  const host = document.createElement('div'); document.body.append(host)
  const root = createRoot(host)
  const switched = vi.fn(), restore = vi.fn()
  act(() => root.render(<ModelMenu ctx={ctx} sessionId="child" modelName="gpt-6.1-sol" onSwitched={switched} onRestoreInput={restore} />))
  cleanups.push(() => act(() => root.unmount()))
  const open = async () => { await act(async () => { host.querySelector('button')!.click() }) }
  const choose = async (provider: string, model = 'gpt-6.1-sol') => { await act(async () => { [...host.querySelectorAll<HTMLButtonElement>('[data-choice]')].find(button => button.dataset.choice === JSON.stringify([provider, model]))!.click() }) }
  const checked = () => [...host.querySelectorAll<HTMLElement>('[data-checked="true"]')].map(node => JSON.parse(node.dataset.choice!))
  return { host, ctx, open, choose, checked, selectModel, modelCatalog, switched, restore, external: (provider: string) => { current = { provider, model: 'gpt-6.1-sol' } } }
}
it('updates the checkmark and provider label after a confirmed switch between identical model IDs', async () => {
  const f = fixture(); await f.open(); expect(f.checked()).toEqual([['openai-codex', 'gpt-6.1-sol']])
  await f.choose('motphys')
  expect(f.selectModel).toHaveBeenCalledWith({ sessionId: 'child', provider: 'motphys', model: 'gpt-6.1-sol' })
  expect(f.host.textContent).toContain('motphys · gpt-6.1-sol')
  await f.open(); expect(f.checked()).toEqual([['motphys', 'gpt-6.1-sol']])
  await f.choose('openai-codex'); await f.open(); expect(f.checked()).toEqual([['openai-codex', 'gpt-6.1-sol']])
  expect(f.restore).toHaveBeenCalledTimes(2)
})
it('re-reads model selection on every opening, including external changes', async () => {
  const f = fixture(); await f.open(); act(() => f.host.querySelector('button')!.click()); f.external('motphys'); await f.open()
  expect(f.checked()).toEqual([['motphys', 'gpt-6.1-sol']]); expect(f.modelCatalog).toHaveBeenCalledTimes(3)
})
it('preserves the old route and displays the host error instead of silently accepting failure', async () => {
  const f = fixture(); await f.open(); f.selectModel.mockResolvedValueOnce({ ok: false, error: { message: 'Account route unavailable' } })
  await f.choose('motphys'); expect(f.host.querySelector('[role="alert"]')?.textContent).toBe('Account route unavailable')
  expect(f.switched).not.toHaveBeenCalled(); expect(f.host.textContent).toContain('ChatGPT subscription')
})
it('does not split provider or model identities containing slashes', async () => {
  const f = fixture(); await f.open(); await f.choose('custom/provider', 'custom/model')
  expect(f.selectModel).toHaveBeenCalledWith({ sessionId: 'child', provider: 'custom/provider', model: 'custom/model' })
})
it('uses the normalized selection returned by the server', async () => {
  const f = fixture(); f.selectModel.mockResolvedValueOnce({ ok: true, value: { selected: { provider: 'normalized', model: 'canonical' } } })
  await act(async () => {
    expect(await selectModelConfirmed(f.ctx, 'child', 'requested', 'alias')).toEqual({ provider: 'normalized', model: 'canonical' })
  })
})
