import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '..')
const style = readFileSync(resolve(root, 'src/client/image-resize.module.css'), 'utf8')
const bundle = readFileSync(resolve(root, 'lib/client.js'), 'utf8')

describe('conversation image paint isolation', () => {
  it('ships the shared image-slot rule in the client bundle', () => {
    expect(style).toContain('[data-slot="conversation.message.images"]')
    expect(bundle).toContain('conversation.message.images')
    expect(bundle).toContain('translateZ(0)')
    expect(bundle).toContain('contain:layout paint')
  })

  it('covers main and fallback side transcript without changing image sizes', () => {
    expect(style).toContain('[data-conversation-session]')
    expect(style).toContain('[data-sidechat-transcript]')
    expect(style).not.toMatch(/(?:^|[;{\s])(?:width|height|object-fit|display|visibility)\s*:/)
    expect(style).not.toContain('will-change')
  })
})
