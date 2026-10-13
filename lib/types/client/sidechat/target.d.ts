import type { Context } from '../host/contracts.ts';
interface TargetChoice {
    tabId?: string;
    childId?: string;
}
export declare function captureSideChatTarget(ctx: Context, parentId: string): {
    title: string | undefined;
    resolve: (signal: AbortSignal) => Promise<{
        childId: string;
        title: string;
        isOpen(): boolean;
    }>;
};
/** Freeze a tab first and wait for that panel's actual child, with no string seed. */
export declare function ensureSideChatTarget(ctx: Context, parentId: string, signal: AbortSignal, choice?: TargetChoice): Promise<{
    childId: string;
    title: string;
    isOpen(): boolean;
}>;
export {};
