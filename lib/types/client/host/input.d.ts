import type { Context, SessionInput } from './contracts.ts';
export type CapabilityState = 'available' | 'unready' | 'unknown' | 'unavailable';
export type InputReason = 'ready' | 'waitSession' | 'waitService' | 'waitInput' | 'unsupported' | 'readFailed';
export interface InputProbe {
    state: CapabilityState;
    reason: InputReason;
    path: string;
    input?: SessionInput;
}
/** One resolver for both composers; scope fixes the recipient before any async work. */
export declare function resolveInput(ctx: Context, sessionId: string): SessionInput | undefined;
/** Shape and real state read share the exact resolver used by both composers. */
export declare function probeInput(ctx: Context, sessionId: string): InputProbe;
export declare function readInputDraft(input: SessionInput): string;
export declare function inputAttachmentIds(input: SessionInput): readonly string[];
export declare function addInputAttachments(input: SessionInput, ids: readonly string[]): boolean;
export declare function removeInputAttachment(input: SessionInput, id: string): void;
/** setDraft on Lexical hosts rebuilds plain paragraphs and loses reference nodes.
 * The scoped insertText application verb keeps those nodes and uses revision CAS. */
export declare function prependInputText(input: SessionInput, prefix: string): boolean;
/** Remove only this transaction's prefix; never overwrite subsequent user text. */
export declare function stripInputPrefix(input: SessionInput, prefix: string): boolean;
export declare function cancelInputRollback(input: SessionInput): void;
/** Detached native sends can restore their draft after promptError is published.
 * Watch that restoration once; a retry cancels this watch before adding its prefix. */
export declare function rollbackInputPrefix(input: SessionInput, prefix: string): void;
