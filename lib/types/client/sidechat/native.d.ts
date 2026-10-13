export { setRootContext, rootContext, betterSidebarOf, directNativeLeg, nativeSidebarHost, focusNativeTab } from '../host/sidebar.ts';
interface LiveSideChat {
    readonly tabId: string;
    readonly sessionId: string;
    /** Write text into the panel composer (draft delivery). */
    seedDraft(text: string): void;
    /** Current tab meta, read at call time (the panel re-renders on meta change). */
    readMeta(): unknown;
    /** Current tab title（聚焦列表/编号数据源的读取面）。 */
    readTitle(): string;
    readStatus(): {
        phase: string;
        childId?: string;
        error?: string;
        requestId?: string;
    };
}
export declare function notifyLiveSideChats(): void;
export declare function subscribeLiveSideChats(listener: () => void): () => void;
/**
 * Publish a mounted panel so programmatic entry points can focus it and seed
 * its draft. Returns the disposer for the panel's effect cleanup.
 */
export declare function registerLiveSideChat(sessionId: string, tabId: string, seedDraft: (text: string) => void, readMeta: () => unknown, readTitle: () => string, readStatus?: LiveSideChat['readStatus']): () => void;
interface OpeningMark {
    readonly at: number;
    /** 窗口内到达的待投递草稿（面板注册时经 seedDraft 回放）。 */
    readonly drafts: string[];
    target?: LiveSideChat;
}
/** 标记一次已发起、面板尚未注册的 native 打开（create/reopen 铸造后调用）。 */
export declare function markSideChatOpening(sessionId: string): void;
/** 进行中的打开；TTL 外视为 openTab 被拒/面板未挂载，清除并返回 undefined。 */
export declare function sideChatOpening(sessionId: string): OpeningMark | undefined;
/** Live panel for a native tab id (undefined for legacy layout tabs). */
export declare function liveSideChat(tabId: string, sessionId?: string): LiveSideChat | undefined;
/** 一个会话的全部存活面板（按打开序升序；native 下枚举 side tab 的唯一数据源）。 */
export declare function liveSideChatsOf(sessionId: string): LiveSideChat[];
/**
 * Most recently OPENED live panel of a session — the open-or-focus target
 * when the legacy snapshot cannot see the tab (mirrors "last opened wins").
 * 排序锚在首次注册序号上：面板重挂载不翻序（见 birthOrder）。
 */
export declare function lastLiveSideChat(sessionId: string): LiveSideChat | undefined;
/** 插件卸载/重载时清场（apply 的 ctx.effect disposer 调用）。 */
export declare function clearNativeRuntime(): void;
/** Native tab shell for reads that go through the layout snapshot (`readTab`). */
export declare function nativeTabShell(tabId: string, type: string, sessionId?: string): {
    id: string;
    type: string;
    title: string;
    meta: unknown;
} | undefined;
