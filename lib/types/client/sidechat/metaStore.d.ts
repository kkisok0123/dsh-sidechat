/**
 * 侧聊 tab 的自有 meta store（Workitem_03；直连原生腿的 meta 数据源）。
 *
 * 原生右栏（DSH ≥ 0.1.5）不替插件持久化 tab meta（布局恢复因版本而异），
 * better-sidebar 转发层的 updateTab 在 native 下本就只到 seed.meta 为止——
 * 直连后 meta 全部自管：childId 绑定、parentSessionId、pendingDraft、
 * 实例编号都落这里。
 *
 * 持久化：localStorage 按「会话 + tabId」分键（dsh-sidechat:side-meta:v1:
 * <sessionId>:<tabId>）——**键必须带会话作用域**：原生 tab id 是每会话
 * 独立计数器铸造（每个会话右栏首个 tab 都叫 tab2），裸 tabId 做键会跨
 * 会话碰撞（对抗性审查 B1）。revive 容错、空删键、写失败吞错。
 *
 * 孤键清扫：不能用旧页面键判断 tab 仍存活，而
 * 「有记录 ⇒ tab 存活」是编排层的判定——残留记录会把入口折叠成聚焦一个
 * 不存在的 tab（死锁，对抗性审查 B2）。每条记录带本页面生命周期的
 * runId，插件 apply 时撤掉 runId 不匹配的活记录。仅真正挂载的 restored
 * tab（navigation revision 0）可重新绑定恢复候选；普通新开不能认领它。
 * 已知限制：同一 origin 开两个窗口时，后启动窗口的清扫会清掉先开窗口的
 * 活记录（其面板 reconcile 幂等重建，childId 丢失退回首开 fork）——
 * 多窗口为边角场景，记录在案。
 */
export interface SideChatMetaRecord {
    readonly tabId: string;
    /** 所属主会话。 */
    readonly sessionId: string;
    /** fork 出的子会话（首开 fork 完成后登记）。 */
    readonly childId?: string;
    readonly parentSessionId?: string;
    /** 待投递草稿（面板 composer 就绪后应用并清除）。 */
    readonly pendingDraft?: string;
    /** D1 折叠边界：fork 时刻父会话的最大节点 seq（busy fork 后推进覆盖
     *  被 cancel 的遗传 turn，允许小数——中断 turn 的冻结节点带小数 seq）。 */
    readonly boundarySeq?: number;
    /** busy fork 标记（Delivery_04）：fork 时主线 turn 在飞，首条侧边消息
     *  发送时拼接主线进展快照。 */
    readonly forkedMidTurn?: boolean;
    /** 零完成轮兜底（Delivery_04）：主线首轮在飞无法 fork，create 出来的
     *  纯快照会话（无继承历史）。 */
    readonly snapshotOnly?: boolean;
    /** 监护判别依据（Delivery_04）：fork 时刻主线在飞消息的前缀。 */
    readonly leakedPromptPrefix?: string;
    /** 侧聊边界块已随首条消息投递（Codex 对齐）；一次性标记。 */
    readonly boundaryDelivered?: boolean;
    readonly contextThroughSeq?: number;
    /** 遗传 turn 已中和（cancel + 边界覆盖完成）。 */
    readonly inheritedPurged?: boolean;
    /** 内容身份（Delivery_05）：首条用户消息摘要，sticky。 */
    readonly topic?: string;
    /** 实例编号（「侧边 2」的 2；单实例期恒 1）。 */
    readonly number: number;
    readonly createdAt: number;
    /** 写入时的页面生命周期 id（孤键清扫判据；缺省 = 旧版记录，视为残留）。 */
    readonly runId?: string;
}
export declare function takeRestoredSideChatMeta(sessionId: string, tabId: string): SideChatMetaRecord | undefined;
/**
 * 本页面生命周期 id。**挂在 window 上**（审查 m3）：模块级铸造会在插件
 * HMR/重载时换模块实例 → 新 runId 触发孤键清扫误删本页活记录。window
 * 级持有跨模块重载稳定；页面刷新（真正的清扫时机）window 重建。
 */
export declare const SIDECHAT_RUN_ID: string;
/** useSyncExternalStore 三件套。 */
export declare const sideChatMetaStore: {
    getSnapshot: () => number;
    subscribe(fn: () => void): () => void;
};
/** 渲染期静默写后的补通知（面板 reconcile 用——render 期写不能 notify）。 */
export declare function notifySideChatMetaListeners(): void;
export declare function readSideChatMeta(sessionId: string, tabId: string): SideChatMetaRecord | undefined;
/** 写/合并一个 tab 的 meta（整体替换语义由调用方组合：先读再写）。 */
export declare function writeSideChatMeta(record: SideChatMetaRecord, options?: {
    silent?: boolean;
}): void;
export declare function dropSideChatMeta(sessionId: string, tabId: string): void;
/** 枚举一个主会话的全部 meta 记录（按创建序升序）。 */
export declare function sideChatMetasOf(sessionId: string): SideChatMetaRecord[];
/** 枚举全部存活记录（跨会话；完成通知等全局监听用）。 */
export declare function sideChatMetasAll(): SideChatMetaRecord[];
/**
 * 下一个实例编号：当前会话存活记录的最大编号 + 1。
 * 单实例期调用方保证同会话同时至多一条存活记录（held 规则），
 * 此函数为 Delivery_02 的多实例预留正确语义。
 */
export declare function nextSideChatNumber(sessionId: string): number;
/**
 * 孤键清扫：删掉 runId 与本页面生命周期不匹配的记录（上一页面周期的
 * 残留）。插件 apply 时调用一次；撤掉活身份，等待实际恢复记录认领。
 * 返回清扫数。
 */
export declare function sweepOrphanedSideChatMeta(): number;
