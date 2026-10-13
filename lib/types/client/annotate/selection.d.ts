/**
 * Selection capture layer (Workitem 02): document-level listeners validate
 * the live selection and publish the latest valid one to the floating
 * toolbar through a small external-store controller. Mirrors the
 * production-proven dsh-sidebar-qa contract, narrowed to assistant messages:
 *
 * - both selection endpoints must sit in the SAME `[data-chat-flow-kind=
 *   "assistant-step"]` message node (跨消息划选不弹);
 * - `[data-streaming]` messages (still streaming) are excluded;
 * - explicit side assistant bodies are admitted; other sidebar/plugin UI is
 *   excluded; both endpoints belong to the same message and source view;
 * - quote text is kept complete, while anchor offsets use one DOM projection.
 *
 * These are DSH-internal DOM attributes rather than a public contract — an
 * upstream redesign silently degrades the feature (no popup), never crashes.
 */
import { type QuoteSource } from '../annotations/source.ts';
/** One validated selection, ready for the toolbar. */
export interface SelectionSnapshot {
    /** 引用全文（发送给模型/存储；不截断——用户裁定 2026-09-06）。 */
    readonly text: string;
    /** Full selection text (re-anchor needle). */
    readonly anchorText: string;
    /** `data-chat-anchor-key` of the owning message, when present. */
    readonly anchorKey: string | undefined;
    /** 0-based ordinal of this selection among identical texts in the anchor. */
    readonly occurrence: number;
    /** Bounding box for toolbar placement. */
    readonly rect: {
        readonly left: number;
        readonly top: number;
        readonly width: number;
    };
    /** A live clone of the selection range (badge anchor until re-render). */
    readonly range: Range;
    readonly sessionId: string;
    readonly source: QuoteSource;
}
export interface SelectionState {
    readonly selection: SelectionSnapshot | null;
}
/** The assistant message node kind (v1 实测纠正值 — 勿引旧值 `assistant`). */
export declare const ASSISTANT_KIND = "assistant-step";
/** Pure validation of one candidate selection (unit-tested without DOM). */
export declare function isEligibleSelection(input: {
    readonly blank: boolean;
    readonly sameMessage: boolean;
    readonly kind: string;
    readonly streaming: boolean;
    readonly excluded: boolean;
    readonly hasSession: boolean;
}): boolean;
/**
 * The 0-based ordinal of the selection's text among its occurrences in the
 * anchor element — the disambiguator for repeated phrases (re-anchor key).
 */
export declare function occurrenceOf(anchor: HTMLElement, range: Range, text: string): number;
/** Capture and validate the current window selection, or null when invalid. */
export declare function captureSelection(currentSessionId: string): SelectionSnapshot | null;
export interface SelectionController {
    getSnapshot(): SelectionState;
    subscribe(fn: () => void): () => void;
    clear(): void;
    dispose(): void;
}
/** Create one selection controller (call once per plugin activation). */
export declare function createSelectionController(getSessionId: () => string): SelectionController;
