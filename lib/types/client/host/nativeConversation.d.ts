import type { Context } from './contracts.ts';
export declare function registerNativeConversation(ctx: Context): void;
/** Feature-detect the native Factory; do not claim parity on old hosts. */
export declare function supportsNativeConversation(ctx: Context): boolean;
