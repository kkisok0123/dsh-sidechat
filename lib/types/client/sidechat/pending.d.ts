/**
 * R8 侧边审批/提问答复（L0/L1：双版本数据源探测链 + 视图模型归一）。
 *
 * 侦察依据（.vibe Delivery_04/Workitem_02 design.md）：
 * - pending 不在 projections.faceOf 体系——0.1.1 在 Session 快照顶层
 *   `pending: PendingWait[]`（mux 帧铸造，重连重放 rpcId 不变）；0.1.2 移入
 *   `ctx.get('uiSession').pendingInteractions`（Map<SessionId, Pending>，
 *   每会话至多一项，precedence 仲裁）。
 * - 写路径都是公开对象的公开方法：0.1.1 `wait.respond({ok,value})`（审批
 *   value={sessionId, approvalId, outcome}；提问整批 {sessionId, answer}，
 *   取消走 {ok:false,error:{code:'cancelled',…}}）；0.1.2 域对象
 *   `answer(outcome|answer)` / `cancel()`。
 * - 竞答安全：先答先得，settle 幂等——后答方 throw，UI catch 吞掉并回退
 *   按钮态（宿主同款 `.catch(() => setAnswered(false))`）。
 *
 * off-face 纪律：两面都 feature-check；全缺席返回 undefined（面板回退
 * pendingBar 跳转行为，不崩）。
 */
export interface PendingApprovalView {
    kind: 'approval';
    key: string;
    toolName: string;
    reason?: string | undefined;
    answer: (outcome: 'allowed-once' | 'rejected') => Promise<void>;
}
export interface PendingQuestionOption {
    label: string;
    description?: string | undefined;
}
export interface PendingQuestionView {
    kind: 'question';
    key: string;
    /** plan-review 按通用提问流降级（提交值逐字回传 asker 原 label）。 */
    planReview: boolean;
    questions: readonly {
        id: string;
        question: string;
        header?: string | undefined;
        detail?: string | undefined;
        options: readonly PendingQuestionOption[];
        multiSelect: boolean;
    }[];
    /** 整批提交（不可拆单题）：answers = [{id, selected: label[], custom?}]。 */
    answer: (answers: readonly {
        id: string;
        selected: readonly string[];
        custom?: string;
    }[]) => Promise<void>;
    cancel: () => Promise<void>;
}
export type PendingItem = PendingApprovalView | PendingQuestionView;
export interface PendingStore {
    readonly available: boolean;
    subscribe(fn: () => void): () => void;
    /** 缓存快照：底层引用不变则返回同一数组（uSES 纪律）。 */
    getSnapshot(): readonly PendingItem[];
}
interface CtxLike {
    get?: (key: string) => unknown;
}
interface SessionLike {
    subscribe(fn: () => void): () => void;
    getSnapshot(): unknown;
}
/**
 * 双版本探测链（chatSourceOf 同款纪律）：0.1.2 uiSession.pendingInteractions
 * （getSnapshot() 是 Map 才认）优先；0.1.1 Session 快照 pending 数组回退；
 * 双缺席 undefined（面板回退 pendingBar 跳转）。
 */
export declare function createPendingStore(ctx: CtxLike, session: SessionLike | undefined, childId: string): PendingStore | undefined;
export {};
