/**
 * 侧聊边界（Codex side-conversation 对齐）单测：边界协议块的文本保真、
 * 拆分/清洗、监护判别护栏（边界前缀不误伤）、问答配对的正文清洗。
 */
import { describe, expect, it } from 'vitest'
import {
  BOUNDARY_BLOCK_MARK,
  SIDE_BOUNDARY_PROMPT,
  SIDE_DEVELOPER_INSTRUCTIONS,
  boundaryPromptBlock,
  splitBoundaryPrefix,
  stripSideProtocolBlocks,
} from '../src/client/boundary.ts'
import { SNAPSHOT_BLOCK_MARK } from '../src/client/sidechat/snapshot.ts'

describe('Codex 文本保真（与 codex-side-reference.rs 逐字对齐）', () => {
  it('边界提示含全部关键条款', () => {
    expect(SIDE_BOUNDARY_PROMPT).toContain('Side conversation boundary.')
    expect(SIDE_BOUNDARY_PROMPT).toContain('Everything before this boundary is inherited history')
    expect(SIDE_BOUNDARY_PROMPT).toContain('It is not your current task.')
    expect(SIDE_BOUNDARY_PROMPT).toContain('Only messages submitted after this boundary are active')
    expect(SIDE_BOUNDARY_PROMPT).toContain('Do not continue, execute, or complete')
    expect(SIDE_BOUNDARY_PROMPT).toContain('separate from the main thread')
    expect(SIDE_BOUNDARY_PROMPT).toContain("according to this thread's current")
    expect(SIDE_BOUNDARY_PROMPT).toContain('Any tool calls or outputs visible before this boundary happened')
    expect(SIDE_BOUNDARY_PROMPT).toContain('Do not call create_worktree here.')
    expect(SIDE_BOUNDARY_PROMPT).toContain('Sub-agents are off-limits in this side conversation.')
    expect(SIDE_BOUNDARY_PROMPT).toContain('Do not modify files')
  })

  it('开发者指示含全部关键条款', () => {
    expect(SIDE_DEVELOPER_INSTRUCTIONS).toContain('You are in a side conversation, not the main thread.')
    expect(SIDE_DEVELOPER_INSTRUCTIONS).toContain('The inherited fork history is provided only as reference context.')
    expect(SIDE_DEVELOPER_INSTRUCTIONS).toContain('You may perform non-mutating inspection')
    expect(SIDE_DEVELOPER_INSTRUCTIONS).toContain('Sub-agents are off-limits in this side conversation.')
  })
})

describe('boundaryPromptBlock / splitBoundaryPrefix（协议块往返）', () => {
  it('块以标记开头、闭合结尾；拆分后正文干净', () => {
    const block = boundaryPromptBlock()
    expect(block.startsWith(BOUNDARY_BLOCK_MARK)).toBe(true)
    expect(block.endsWith('</side-conversation-boundary>')).toBe(true)
    expect(block).toContain(SIDE_BOUNDARY_PROMPT)
    expect(block).toContain(SIDE_DEVELOPER_INSTRUCTIONS)

    const split = splitBoundaryPrefix(`${block}\n\n用户的问题`)
    expect(split).not.toBeNull()
    expect(split?.rest).toBe('用户的问题')
    expect(split?.boundary).toBe(block)
  })

  it('非边界消息 / 块未闭合 → null（不吃文本）', () => {
    expect(splitBoundaryPrefix('普通消息')).toBeNull()
    expect(splitBoundaryPrefix(`${BOUNDARY_BLOCK_MARK} 未闭合`)).toBeNull()
  })

  it('stripSideProtocolBlocks：边界 + 快照连拼全剥，正文保留', () => {
    const text = [
      boundaryPromptBlock(),
      `${SNAPSHOT_BLOCK_MARK} taken-at="x">\n快照\n</mainline-progress-snapshot>`,
      '真正的正文',
    ].join('\n\n')
    expect(stripSideProtocolBlocks(text)).toBe('真正的正文')
    expect(stripSideProtocolBlocks('没有协议块的消息')).toBe('没有协议块的消息')
  })

  it('监护护栏：用户首条消息以边界/快照标记开头时判别为用户消息（前缀在 BOUNDARY 之下的判别兼容）', () => {
    // 监护的 disarm 判据是 startsWith(BOUNDARY_BLOCK_MARK)——首条消息组装序
    // 为边界 → 快照 → 正文，边界永远在最前。
    const firstMessage = `${boundaryPromptBlock()}\n\n${SNAPSHOT_BLOCK_MARK} x>…</mainline-progress-snapshot>\n\n问题`
    expect(firstMessage.startsWith(BOUNDARY_BLOCK_MARK)).toBe(true)
    expect(firstMessage.startsWith(SNAPSHOT_BLOCK_MARK)).toBe(false)
  })
})
