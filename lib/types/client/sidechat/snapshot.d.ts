/**
 * 主线进展快照构建器（Delivery_04 / WI-02，L0 纯逻辑 + L3 读取编排）。
 *
 * 背景：busy fork 的子会话只继承到「最后一个已完成 turn」——主线在飞 turn
 * 的内容（任务、思考、工具进展）不在继承历史里。本模块在侧边首条消息发送
 * 时把这部分内容现取（不是 fork 时刻——主线还在跑，发送时才最新）序列化为
 * 协议块，拼进首条侧边消息前缀。
 *
 * 读取面：chatSourceOf 的 legacy 投影——它是**模型可见投影**：压缩过的范围
 * 投影为摘要节点、被修剪的工具结果已移除。即「最后一个压缩点之后的内容」
 * 语义由投影天然实现，尺寸天然有界（= 主线模型此刻实际所见，主线装得下
 * 我们就装得下；超窗由宿主对子会话的压缩引擎兜底——不另设安全阀）。
 *
 * 缓存对齐：快照追加在 fork 继承历史（与主线前缀逐字一致）之后，不破坏
 * 前缀缓存命中。
 */
import type { Context } from '../host/contracts.ts';
/** 快照里的一拍（当前 turn 的一段内容）。 */
export interface SnapshotEntry {
    kind: 'request' | 'reply' | 'thinking' | 'tool' | 'streaming';
    text: string;
    /** tool 拍携带工具名。 */
    toolName?: string;
}
/**
 * 投影 nodes → 当前 turn 的快照拍序列。纯函数（node 可测）。
 *
 * 当前 turn 起点 = 最后一个 user 节点（在飞 turn 的任务消息）。注意：压缩
 * 摘要在投影里也是 user 形态节点（<compacted-summary> 框定的替换消息）——
 * 若最后一个 user 节点是摘要，从它取起同样正确（摘要即主线模型此刻的上下文
 * 头部）。起点之后：assistant 拆思考/正文两拍，tool-result 成拍，其余节点
 * （context 注入、系统面）不入快照。
 */
export declare function snapshotEntriesOf(nodes: readonly unknown[], partial?: unknown, allNodes?: boolean): SnapshotEntry[];
/** 拍序列 → 协议块文本（拼进首条侧边消息前缀的形态）。 */
export declare function serializeSnapshot(entries: readonly SnapshotEntry[], takenAt: Date): string;
/** 协议块标记（WI-03 呈现层据此把快照从气泡提升到继承卡）。 */
export declare const SNAPSHOT_BLOCK_MARK = "<mainline-progress-snapshot";
/**
 * 现取主线当前 turn 的进展快照块。无任何在飞内容（主线恰在两轮之间等）
 * 返回 null（调用方跳过拼接）。
 */
export declare function buildMainlineSnapshot(ctx: Context, parentSessionId: string, now?: Date): string | null;
