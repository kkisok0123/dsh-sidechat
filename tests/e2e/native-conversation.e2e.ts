import { expect, test } from '@playwright/test'
import { createHostApi, hostRpc } from './host'
import { prepareSeedPage, registerSeedWorkspace, sideChatOf, userMessagesOf } from './journey'

test.beforeAll(registerSeedWorkspace)
test('native side conversation reuses the main renderer and composer with child isolation', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await prepareSeedPage(page)
  const parent = process.env.DSH_E2E_SEED_SESSION!
  const parentBefore = userMessagesOf(parent)
  await page.getByRole('button', { name: /Open a side chat|打开侧边聊天/ }).first().click()
  const side = sideChatOf(page)
  await expect(side).toHaveAttribute('data-sidechat-native-conversation', 'true')
  const child = (await side.getAttribute('data-sidechat-chat-session'))!
  expect(child).not.toBe(parent)
  await expect(side.locator('[data-chat-flow-kind="assistant-step"]').filter({ hasText: 'full history snapshot' }).first()).toBeVisible()
  const input = side.locator('[data-composer-input]').first()
  await expect(input).toBeVisible()
  const api = await createHostApi()
  await hostRpc(api, 'session.selectModel', { sessionId: child, provider: 'sidechat-e2e', model: 'controlled' })
  await api.dispose()
  await input.fill('native child message [e2e:hold]')
  await input.press('Enter')
  await expect.poll(() => userMessagesOf(child).filter(text => text.includes('native child message'))).toHaveLength(1)
  await expect(side.getByText('Controlled E2E reply.', { exact: false }).first()).toBeVisible()
  await expect(side.locator('[data-composer-seat]')).toHaveCount(1)
  expect(userMessagesOf(parent)).toEqual(parentBefore)
  await page.screenshot({ path: 'test-results/native-side-conversation.png' })
  await side.getByRole('button', { name: /Stop|停止/ }).last().click()
  const answer = side.locator('[data-chat-flow-kind="assistant-step"]').filter({ hasText: 'Controlled E2E reply.' }).last()
  await answer.scrollIntoViewIfNeeded()
  await side.getByRole('button', { name: /Stop|停止/ }).last().click()
  await answer.evaluate(el => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = node.textContent ?? '', at = text.indexOf('Controlled E2E reply.')
      if (at < 0) continue
      const range = document.createRange(); range.setStart(node, at); range.setEnd(node, at + 'Controlled E2E reply.'.length)
      window.getSelection()?.removeAllRanges(); window.getSelection()?.addRange(range)
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true })); break
    }
  })
  const overlay = page.locator('[data-dsh-sidechat]')
  await overlay.getByRole('button', { name: /^(Add to conversation|添加到对话)$/ }).click()
  await overlay.locator('input').fill('native side quote to parent')
  await overlay.locator('input').press('Enter')
  const records = await page.evaluate(id => JSON.parse(localStorage.getItem('dsh-sidechat:annotations:v1:' + id) ?? '[]'), parent)
  expect(records).toMatchObject([{ sessionId: parent, sourceSessionId: child, sourceSurface: 'side', text: 'Controlled E2E reply.', note: 'native side quote to parent' }])
  await page.locator('[data-composer-input]').first().fill('parent follow-up')
  await page.locator('[data-composer-input]').first().press('Enter')
  await expect.poll(() => userMessagesOf(parent).filter(text => text.includes('<note>native side quote to parent</note>'))).toHaveLength(1)
  expect(userMessagesOf(child).filter(text => text.includes('native side quote to parent'))).toHaveLength(0)
  await answer.evaluate(el => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = node.textContent ?? '', at = text.indexOf('Controlled E2E reply.')
      if (at < 0) continue
      const range = document.createRange(); range.setStart(node, at); range.setEnd(node, at + 'Controlled E2E reply.'.length)
      window.getSelection()?.removeAllRanges(); window.getSelection()?.addRange(range)
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true })); break
    }
  })
  await overlay.getByRole('button', { name: /^(Ask in side chat|在侧边聊天中提问)$/ }).click()
  await overlay.locator('input').fill('native quote remains in child')
  await overlay.locator('input').press('Enter')
  await input.fill('child follow-up'); await input.press('Enter')
  await expect.poll(() => userMessagesOf(child).filter(text => text.includes('<note>native quote remains in child</note>'))).toHaveLength(1)
  expect(userMessagesOf(parent).filter(text => text.includes('native quote remains in child'))).toHaveLength(0)
  expect(errors).toEqual([])
})
