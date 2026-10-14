/**
 * The annotation store: per-session numbered selection annotations. Pure
 * (DOM-free, React-free) so the whole lifecycle is unit-testable. One instance
 * per plugin activation.
 *
 * Numbering: a per-session monotonic counter assigns each annotation its
 * display number at creation (①②… rendered as plain digits). Numbers are
 * never reused and never re-packed on delete — 删除不重排.
 *
 * State machine per annotation: 'active' (counts in the composer chip, rides
 * the next message via the send interceptor) → 'sent' (the message it was
 * attached to went out; badge turns gray/read-only, chip no longer counts it).
 *
 * 持久化（Delivery_02 起）：每次 mutation 后按会话写 localStorage
 * （`dsh-sidechat:annotations:v1:<sessionId>`），刷新/切会话后重建；
 * 会话清空时删键。storage 不可用（测试/隐私模式）时退化为纯内存。
 */
export interface Annotation {
    /** Store-unique identity (monotonic across sessions). */
    readonly id: number;
    /** Per-session display number assigned at creation; never reused. */
    readonly number: number;
    readonly sessionId: string;
    /** Source is independent of the send target. Missing fields revive legacy main quotes. */
    readonly sourceSessionId?: string;
    readonly sourceSurface?: 'main' | 'side';
    /** Selected text is a composer reference, not an editable response annotation. */
    readonly kind?: 'selected-text';
    /** `data-chat-anchor-key` of the owning message (re-anchor key). */
    readonly anchorKey: string | undefined;
    /** Full human-selected quote; chip truncation is visual only. */
    readonly text: string;
    /** Full selection text (re-anchor needle; untruncated). */
    readonly anchorText: string;
    /** 0-based ordinal of the quote's occurrence inside the anchor element. */
    readonly occurrence: number;
    /** User-written note; '' means 纯引用. */
    readonly note: string;
    readonly state: 'active' | 'sent';
    readonly createdAt: number;
}
export interface AnnotationDraft {
    readonly sessionId: string;
    readonly sourceSessionId?: string;
    readonly sourceSurface?: 'main' | 'side';
    /** Selected text is a composer reference, not an editable response annotation. */
    readonly kind?: 'selected-text';
    readonly anchorKey: string | undefined;
    readonly text: string;
    readonly anchorText: string;
    readonly occurrence: number;
    readonly note: string;
}
export interface AnnotationStore {
    /** Monotonic version, referentially stable between mutations (uSES-ready). */
    getSnapshot(): number;
    /** Memory contents remain usable after storage access/quota failures. */
    getStorageStatus(sessionId?: string): 'persistent' | 'memory';
    getSubmission(sessionId: string): {
        readonly pending: boolean;
        readonly error?: string;
    };
    setSubmission(sessionId: string, state: {
        pending: boolean;
        error?: string;
    }): void;
    subscribe(fn: () => void): () => void;
    /** Create an active annotation; returns it (id/number assigned). */
    add(draft: AnnotationDraft): Annotation;
    setNote(id: number, note: string): void;
    remove(id: number): void;
    /** 把指定 id 的 active 注释翻为 'sent'（发送拦截器只翻当时拼进消息的
     *  那批——窗口内新增的注释不得误标，C2 P1-3）。 */
    markSent(ids: readonly number[]): void;
    get(id: number): Annotation | undefined;
    /** All annotations of a session in creation order (active + sent). */
    list(sessionId: string): readonly Annotation[];
    listActive(sessionId: string): readonly Annotation[];
    countActive(sessionId: string): number;
    /** Sessions currently holding any annotation (draft-sync fan-out). */
    sessions(): readonly string[];
}
/** localStorage 键前缀（按会话分键）。 */
export declare const STORAGE_PREFIX = "dsh-sidechat:annotations:v1:";
export declare function createAnnotationStore(now?: () => number, storage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'> | null): AnnotationStore;
