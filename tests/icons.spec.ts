import { describe, expect, it } from 'vitest'
import * as primitives from '@deepseek-ai/dsh-client-ui-primitives'
import * as icons from '../src/client/host/icons.ts'
import { resolveIcon } from '../src/client/host/icons.ts'

const Modern = () => null
const Legacy = () => null

describe('resolveIcon', () => {
  it('优先选择 0.1.7 的 weight 命名导出', () => {
    expect(resolveIcon({ Modern, Legacy }, 'Modern', 'Legacy')).toBe(Modern)
  })

  it('在旧宿主回退到 size 命名导出', () => {
    expect(resolveIcon({ Legacy }, 'Modern', 'Legacy')).toBe(Legacy)
  })

  it('导出都缺席时返回空图标组件而非 undefined', () => {
    expect(resolveIcon({}, 'Modern', 'Legacy')).toBeTypeOf('function')
  })

  it('23 个映射均命中 0.1.5 primitives 的同名旧导出', () => {
    const mapped = Object.entries(icons).filter(([name]) => name.startsWith('Icon'))
    const legacy = primitives as unknown as Readonly<Record<string, unknown>>
    expect(mapped).toHaveLength(23)
    for (const [name, component] of mapped) expect(component).toBe(legacy[name])
  })
})
