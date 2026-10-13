/**
 * 「最近关闭的侧边聊天」登记处（L1，localStorage 按主会话分键）：
 * D3 后悔药之一——× 即焚观感不变，但关掉的可重开。
 *
 * 容量：每个主会话最多记 5 条（新者在前）；会话本体仍 archived 在盘
 * （× 只关 Tab），重开 = 开 Tab + meta 预置 childId（面板绑定而非 fork）。
 */
import type { SideChatMeta } from './model.ts';
export interface ClosedSideEntry {
    readonly childId: string;
    readonly parentSessionId: string;
    readonly title: string;
    /** 内容身份（Delivery_05）：首条消息摘要；老条目缺省，菜单回退 title。 */
    readonly topic?: string;
    readonly closedAt: number;
    /** Native tab recovery identity; manual reopen continues to use childId. */
    readonly tabId?: string;
    readonly savedMeta?: SideChatMeta & {
        number?: number;
    };
}
export declare function recordClosedSideChat(parentSessionId: string, entry: ClosedSideEntry): void;
/** 读某主会话的最近关闭列表（新者在前）。 */
export declare function listClosedSideChats(parentSessionId: string): readonly ClosedSideEntry[];
/** 重开消费：从列表移除（重开后若再关会重新入列）。 */
export declare function dropClosedSideChat(parentSessionId: string, childId: string): void;
/** A newly opened native occurrence may reuse a tab id. Keep manual history,
 * but revoke that old occurrence's automatic restoration identity. */
export declare function forgetClosedTabBinding(parentSessionId: string, tabId: string): void;
