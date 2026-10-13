import type { Context, ConversationSnapshot, SessionBinding, SessionReference } from './contracts.ts';
/** Durable conversation content; local submission echoes are never part of this face. */
export interface ChatSource {
    subscribe(fn: () => void): () => void;
    getLegacy(): ConversationSnapshot | null;
}
export declare function chatSourceOf(ctx: Context, binding: SessionBinding | undefined): ChatSource | undefined;
/** Retain the exact target generation on hosts that expose session ownership. */
export declare function retainSession(ctx: Context, sessionId: string, signal?: AbortSignal): SessionReference | undefined;
