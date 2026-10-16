/** Shared send admission hook. Exact session identity prevents navigation retargeting. */
export interface SendContext {
    block: string;
    accepted(): void;
}
export declare function registerSideContext(childId: string, source: () => SendContext): () => void;
export declare function prepareSideContext(childId: string): SendContext | undefined;
