import type { Context, NativeTabRecord } from '../host/contracts.ts';
import type { ReflowStore } from '../reflow.ts';
import type { AnnotationStore } from '../annotations/model.ts';
import { type SideChatMeta } from './model.ts';
/** openTab params 的形态（窗口期投递的初始 meta；宿主管道，JSON-shaped）。 */
export interface SideChatOpenParams {
    /** 面板归属的主会话（metaStore 初始记录的 sessionId）。 */
    parentSessionId: string;
    /** 首开待投递草稿。 */
    pendingDraft?: string;
    /** 后悔药重开：既有子会话（走绑定恢复，不重新 fork）。 */
    childId?: string;
    /** 后悔药重开：内容身份随恢复走（Delivery_05）——否则重开即丢 topic。 */
    topic?: string;
    quoteRequestId?: string;
    savedMeta?: SideChatMeta & {
        number?: number;
    };
}
export declare function parseOpenParams(params: unknown): SideChatOpenParams | undefined;
/**
 * 渲染期把 params 的初始值幂等落进 metaStore（静默写，不 notify——渲染期
 * notify 会让订阅者（title 槽）触发 React「渲染中更新」警告；由调用方在
 * effect 里补 notify）。必须在渲染期完成：子组件 SideChatPanel 的 fork
 * effect 先于本组件的 effect 执行（React effect 自底向上），reopen 场景
 * 若在 effect 里登记，子面板会先按「无 childId」错误地重新 fork 出孤儿会话。
 * @returns true = 本次新建了记录（调用方 effect 里补 notify）。
 */
export declare function reconcileMeta(record: NativeTabRecord, sessionId: string): {
    created: boolean;
    meta: import('./metaStore.ts').SideChatMetaRecord;
};
/** 芯片标题：metaStore 兑现（topic 优先，编号回退——Delivery_05 单源）。 */
export declare function titleOf(sessionId: string, tabId: string): string;
/**
 * 直连注册：类型 + body/title 槽。返回 disposer（插件 fiber 撤销时清场）。
 * 探测与分腿在调用方（sidechat/index.tsx）；本函数只在 sidebarRightTabs
 * 存在时被调用。
 */
export declare function registerNativeSideChatTab(ctx: Context, reflow: ReflowStore, annotations: AnnotationStore): void;
