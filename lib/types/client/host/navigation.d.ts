import type { Context } from './contracts.ts';
/** Resolve before creating a saved copy, so unsupported navigation cannot create duplicate copies on retry. */
export declare function resolveMainSessionOpener(ctx: Context): (sessionId: string) => void;
