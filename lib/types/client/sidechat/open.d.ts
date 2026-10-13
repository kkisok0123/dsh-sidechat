/**
 * 「新建或聚焦一个侧边聊天 Tab」的共享编排：桥接（WI-03 划选提问
 * askInSideChat）与 /side 斜杠命令共用。
 *
 * 双腿（Workitem_04 单路化）：
 * - 直连腿（BS ≥ 0.19 ⇒ 宿主 DSH ≥ 0.1.5）：tab 注册在原生右栏，meta 在
 *   自有 metaStore，聚焦走 ISidebarRight.focus，枚举走原生快照的扁平
 *   tabs map + live registry（面板挂载自登记）+ openings 窗口期标记。
 *   单实例语义：held 规则下同 pane 同 kind 去重，「新建」折叠为聚焦既有
 *   ——草稿投递必须命中三处之一（seedDraft / openings 暂存 / metaStore
 *   的 pendingDraft），任一缺失即静默丢草稿（PR#3 前的活伤）。
 * - legacy 腿（BS < 0.19）：布局快照即注册表，openTab 同步落快照。
 *
 * 聚焦策略：同一主会话并存多个时聚焦最后一个（最近打开的）。
 * 草稿注入：目标 Tab 已 fork 且 input 机器可达 → 直接写机器草稿；
 * 否则写 meta.pendingDraft 移交面板（面板在 composer 就绪后应用并清除）。
 */
import type { Context, SidebarTab } from '../host/contracts.ts';
import { type SideChatMeta } from './model.ts';
export { sidebarRightOf } from '../host/sidebar.ts';
/**
 * 从最新快照读一个 Tab（meta 合并写入前的读取面；布局即注册表）。
 * 直连腿：metaStore 是 meta 权威（原生布局无 meta 面）。
 */
export declare function readTab(ctx: Context, sessionId: string, tabId: string): SidebarTab | undefined;
/**
 * 为 sessionId 新建或聚焦一个侧边聊天 Tab；draftText 给出时写入其草稿。
 * @returns false = 未能打开（调用方保持自己的流程）。
 */
export declare function openOrFocusSideChat(ctx: Context, sessionId: string, draftText?: string): boolean;
/**
 * 无条件新建一个侧边聊天 Tab（/side「新建侧边聊天」选项的语义）。
 * 直连腿（单实例期）：折叠为「聚焦既有 + 草稿正确投递」（= openOrFocus；
 * 多实例随 Delivery_02 的 multiple 放开）。
 * @returns false = 未能创建（调用方保持自己的流程）。
 */
export declare function createSideChat(ctx: Context, sessionId: string, draftText?: string): boolean;
/**
 * 桥接/命令的目标预览：askInSideChat 此时若执行会落在哪个 Tab 的标题
 * （既有并存 = 最后一个；无 = 即将新建的首个标题）。用于编辑器上标明
 * 「发送至：侧边 N」。会话不在屏上/状态缺失时返回 undefined。
 */
export declare function sideChatTargetTitle(ctx: Context, sessionId: string): string | undefined;
/**
 * 重开最近关闭的侧边聊天（D3 后悔药）：开 Tab + meta 预置 childId/
 * parentSessionId——面板挂载后走绑定恢复路径（不重新 fork）。
 * 会话本体必须仍 archived 在列（若被清理，面板落「会话已不存在」态——
 * 有现成错误态兜着）。
 * opts.topic（Delivery_05）：内容身份随恢复走——否则重开后 reconcile
 * 铸造的是无 topic 的新记录，身份丢一次关闭就回不来了。
 */
export declare function reopenSideChat(ctx: Context, sessionId: string, childId: string, opts?: {
    title?: string;
    topic?: string;
    savedMeta?: SideChatMeta & {
        number?: number;
    };
}): boolean;
