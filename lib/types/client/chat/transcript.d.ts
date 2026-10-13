/**
 * 会话快照 → 消息视图模型（L0 纯逻辑，node 可测）。
 *
 * WI-01 起这里是消息渲染管线的唯一入口（自 sidechat/model.ts 迁入——
 * legacy 快照字段（nodes/partial/runningCalls，官方已标 Legacy）的消费
 * 单点化：0.1.2 迁移到 ChatSnapshot 新面时只动本文件）。
 *
 * 数据源事实（权威注释）：ConversationSnapshot.nodes 是 ConversationNode
 * 联合（kind 判别，seq 稳定——「seq is the React key」），partial/
 * runningCalls 承载在途流式输出。
 */
import type { ConversationSnapshot } from '../host/contracts.ts';
import { type ToolCardModel } from './cards.ts';
/** 面板渲染用的消息视图（自绘；工具卡片等复杂节点降级为简洁块）。 */
export interface ChatMessage {
    /** React key（节点 seq / 在途 callId 派生，稳定）。 */
    key: string;
    /** 源节点 seq（D1 折叠边界判定的依据；在途项无）。 */
    seq?: number;
    role: 'user' | 'assistant' | 'tool' | 'notice' | 'error';
    /** markdown 正文（assistant）或纯文本（其他）。 */
    text: string;
    /** assistant 的思考内容（折叠渲染）；缺省 = 无。 */
    reasoning?: string;
    /** tool 角色的工具名。 */
    toolName?: string;
    /** tool 角色的失败标记。 */
    isError?: boolean;
    /** 流式中（partial / runningCalls）。 */
    streaming?: boolean;
    /** 被打断冻结的 assistant 输出（渲染「已停止」标记）。 */
    interrupted?: boolean;
    /** tool 角色的渲染意图（card union 已映射为视图模型；缺省 = 纯文本卡）。 */
    card?: ToolCardModel;
}
/** 工具结果正文截断上限（面板是窄栏，超长输出不撑爆 DOM）。 */
export declare const TOOL_TEXT_LIMIT = 4000;
export declare function truncateText(text: string, max: number): string;
/** ContentBlock[] → 纯文本：text 块拼接；image 块降级占位；其余忽略。 */
export declare function contentTextOf(content: unknown): string;
/**
 * 单个 ConversationNode → ChatMessage；返回 null = 面板不渲染
 * （context 注入、未知面事件、已取消的重试等对读者无信息的节点）。
 */
export declare function nodeToMessage(node: unknown): ChatMessage | null;
/**
 * ConversationSnapshot → 渲染消息列表：终态节点 + 在途项（按 turn/step 归并）。
 * 快照缺省（未绑定）时为空列表。
 *
 * 时序归并（WI-01）：在途项不再恒追加尾部——真实交错是「partial 文本 → 它
 * 自己 step 发出的工具卡」：partial 与同 step 的 runningCall 并存时必须文本
 * 在前（原文早于调用），不同 step 按 (turn, step) 升序；并行多 call 保持
 * 宿主 dispatch 序（同 turn/step 内稳定）。终态节点自带 seq 全序，不参与
 * 归并（在途项永远属于当前 turn 的前沿，尾部插入点天然正确）。
 */
export declare function transcriptOf(snapshot: ConversationSnapshot | undefined | null): ChatMessage[];
/**
 * D1 父历史折叠的划分：seq <= boundarySeq 的消息为继承区（fork 时刻快照，
 * 折叠进指示卡），其余（含在途项——无 seq）为新鲜区。boundarySeq 缺省 =
 * 全新鲜（升级前老 Tab 的行为不变）。
 */
export declare function partitionInherited(messages: readonly ChatMessage[], boundarySeq: number | undefined): {
    inherited: ChatMessage[];
    fresh: ChatMessage[];
};
