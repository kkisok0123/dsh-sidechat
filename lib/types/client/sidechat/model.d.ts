/**
 * 侧边聊天的纯逻辑层：Tab 编号标题、meta 序列化/解析容错、状态树遍历、
 * 会话快照 → 消息流折叠、面板相位判定。全部无副作用，单测直接覆盖。
 *
 * 数据源事实（权威注释）：
 * - SidebarState 真实形态是 splits/bottomSplits 两棵 split/leaf 树
 *   （dsh-better-sidebar src/client/state.ts），leaf.tabs 持有 SidebarTab。
 * - ConversationSnapshot.nodes 是 ConversationNode 联合（kind 判别），
 *   partial/runningCalls 承载在途流式输出（dsh-client-runtime
 *   lib/types/client/sessions/conversation.d.ts）。
 */
import type { Context, SidebarTab } from '../host/contracts.ts';
import type { ChatMessage } from '../chat/transcript.ts';
/** Tab 类型 id（better-sidebar 注册表键；带包前缀防冲突）。 */
export declare const SIDE_TAB_TYPE = "dsh-sidechat:side";
/** 多实例 Tab id：`side:<uuid>`（terminal/browser 的 createTab 铸 id 先例）。 */
export declare function mintSideTabId(): string;
/**
 * 标题编号：首个「侧边」；并存时新 Tab「侧边 N」（N = 既有最大编号 + 1，
 * 从标题解析）——关掉「侧边」再新建不会重名复用「侧边 2」。
 * @param existingTitles - 创建时刻同会话侧边聊天 Tab 的标题集。
 */
export declare function sideTabTitle(existingTitles: readonly string[]): string;
/** 侧边聊天寄存在 SidebarTab.meta 上的插件自有 JSON。 */
export interface SideChatMeta {
    /** fork 出的子会话 id；缺省 = 尚未 fork（刚创建）。 */
    childId?: string;
    /** fork 来源主会话 id（面板归属校验用；面板天然落在其 sidebar 状态里）。 */
    parentSessionId?: string;
    /** 桥接（WI-03 划选提问）写入的待注入草稿；面板应用后清除。 */
    pendingDraft?: string;
    /** D1 折叠边界：fork 时刻父会话的最大节点 seq（继承区 = seq ≤ 它）。
     *  缺省（老 Tab）= 不折叠。busy fork 后会推进覆盖被 cancel 的遗传 turn
     *  （中断 turn 的冻结节点带小数 seq——允许非整数）。 */
    boundarySeq?: number;
    /** busy fork 标记（Delivery_04）：fork 时主线 turn 在飞——首条侧边消息
     *  发送时拼接主线进展快照（WI-02/03）。 */
    forkedMidTurn?: boolean;
    /** 零完成轮兜底（Delivery_04）：主线首轮在飞无法 fork，子会话是
     *  create 出来的纯快照会话（无继承历史，折叠卡不渲染）。 */
    snapshotOnly?: boolean;
    /** 遗传 turn 监护的判别依据（Delivery_04）：fork 时刻主线在飞消息的
     *  前缀（截 200 字符）——子会话首个 turn 的用户消息命中它才 cancel，
     *  防误伤用户自己的首个 turn。 */
    leakedPromptPrefix?: string;
    /** 侧聊边界块已随首条消息投递（Codex 对齐）；缺省 = 待投递。
     *  一次性标记：接受后置 true，此后不再重复拼接。 */
    boundaryDelivered?: boolean;
    /** Parent event cursor, advanced only after a side prompt is admitted. */
    contextThroughSeq?: number;
    /** 遗传 turn 已中和（cancel + 折叠边界已覆盖）；缺省 = 未监护。 */
    inheritedPurged?: boolean;
    /** 内容身份（Delivery_05）：首条用户消息摘要，sticky——只在首条
     *  发送时写入，之后不随对话漂移。 */
    topic?: string;
}
/**
 * 容错解析 tab.meta：布局持久化里的 meta 来自上一版本的自己，字段缺失或
 * 类型漂移一律降级为缺省，绝不抛错（刷新恢复路径不许崩）。
 */
export declare function parseSideChatMeta(meta: unknown): SideChatMeta;
/** 清除 meta.pendingDraft（其余字段原样保留）。 */
export declare function clearPendingDraft(meta: SideChatMeta): SideChatMeta;
/**
 * 枚举侧栏状态里的全部 Tab：splits + bottomSplits 两棵树，外加 0.16 引入的
 * 浮动窗 floats（元素形态 { id, tab, … }，tab 为窗口持有的 SidebarTab）。
 * floats 缺失（0.16 之前）时数组检查天然跳过，前后版本通吃。
 */
export declare function collectTabs(state: unknown): SidebarTab[];
/** 枚举当前并存的侧边聊天 Tab（树顺序 = 打开顺序的近似）。 */
export declare function collectSideTabs(state: unknown): SidebarTab[];
/**
 * blank 着陆页会话没有已完成 turn，fork 必败（host 返回 fork-unavailable）
 * ——+ 菜单与 /side 命令的 available 用它禁用入口；面板内错误态兜底。
 * 摘要求知（列表未就绪）时放行，交给 fork 错误态。
 */
export declare function canForkFrom(ctx: Context, sessionId: string): boolean;
/**
 * 面板相位：
 * - forking：无 childId，fork 编排进行中（或等待 effect 起跑）；
 * - fork-error：fork/归档失败（blank 会话无已完成 turn 等）；
 * - loading：有 childId，列表未就绪或 binding 尚未可解析；
 * - missing：列表就绪后子会话不在列（会话已不存在）；
 * - chat：binding 解析成功，正常聊天。
 */
export type PanelPhase = 'forking' | 'fork-error' | 'loading' | 'missing' | 'chat';
export declare function phaseOf(input: {
    childId: string | undefined;
    forkError: string | null;
    bound: boolean;
    listPhase: 'pending' | 'ready' | undefined;
    listed: boolean;
}): PanelPhase;
/** 注入草稿的拼接规则：空草稿直接落文本，否则换行追加（引文+问题的自然形态）。 */
export declare function appendDraftText(draft: string, text: string): string;
/**
 * 回流「问答成对」的数据源：为每条 assistant 消息配对它在回答的用户提问。
 * 顺序扫描消息流，记录最近一条用户消息的可见文本（剥掉注释/回流协议前缀——
 * fork 历史里的主会话消息可能携带），其后每条非流式 assistant 消息都配对到它；
 * 中间的 tool/notice 节点不打断配对。此前没有用户提问（如 fork 历史结尾
 * 恰是 assistant）则不配对，回流块退化为只有 <答>。
 * 返回 Map：assistant 消息 key → 提问全文。
 */
export declare function pairQuestions(messages: readonly ChatMessage[]): ReadonlyMap<string, string>;
