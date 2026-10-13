export interface ReflowInjectResult {
    /** 成功注入（应从 store 移除、不拼前缀）的 item id 集。 */
    injectedIds: ReadonlySet<number>;
}
/** 尝试经宿主路由注入一批回流项；任何失败都降级为「全未注入」。 */
export declare function tryInjectReflows(parentSessionId: string, items: readonly ReflowItem[]): Promise<ReflowInjectResult>;
/** 回流内容不截断（2026-09-06 用户裁定：静默截断让用户不知道内容少了，
 *  「会产生幻觉」；结论是用户亲手选择回流的，全文注入）。 */
export interface ReflowItem {
    readonly id: number;
    readonly sessionId: string;
    /** 来源侧边聊天 Tab 标题（「侧边 2」）。 */
    readonly sideTitle: string;
    /** 结论内容（assistant 回答全文，不截断）。 */
    readonly text: string;
    /** 该回答对应的用户提问（问答成对回流；缺省 = 无，如 fork 历史里的消息）。 */
    readonly question?: string;
    readonly createdAt: number;
}
export interface ReflowStore {
    getSnapshot(): number;
    subscribe(fn: () => void): () => void;
    add(sessionId: string, sideTitle: string, text: string, question?: string): ReflowItem;
    remove(id: number): void;
    /** 发送确认后清空该会话的待回流集（一次性消费）。 */
    clearSession(sessionId: string): void;
    list(sessionId: string): readonly ReflowItem[];
}
/**
 * 回流块序列化（XML 形态，与注释协议同族）：
 *
 *   <reflow source="侧边 2" reason="用户选择从侧边聊天带回主线">
 *   <问>用户在侧边聊天里的提问</问>
 *   <答>结论全文（不截断）</答>
 *   </reflow>
 *
 * 问答成对：只有答没有问，模型理解打折；question 缺省时只有 <答>。
 * 来源与意图放在属性里，内容行保持纯净；模型对 XML 包裹的上下文理解最好
 * （Claude 官方推荐形态 / Codex additionalContext 同款思路）。
 */
export declare function buildReflowBlock(item: ReflowItem): string;
export declare function createReflowStore(now?: () => number, storage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'> | null): ReflowStore;
