export interface QuoteSource {
    body: HTMLElement;
    anchor: HTMLElement;
    view: HTMLElement;
    sessionId: string;
    parentSessionId?: string;
    surface: 'main' | 'side';
    streaming: boolean;
    key?: string;
}
/** Explicit side bodies are the sole exception to the legacy sidebar exclusion. */
export declare function quoteSourceOf(node: Node, currentSessionId: string): QuoteSource | null;
export declare function sourceKey(source: QuoteSource): string | undefined;
export declare function sourceBodies(sessionId: string, surface: 'main' | 'side', anchorKey: string, currentSessionId: string): HTMLElement[];
/** The same text-node projection is used at capture and when rebuilding anchors.
 * Browser selections contain block newlines; anchor offsets deliberately do not. */
export declare function quoteTextNodes(body: HTMLElement): Text[];
export declare function projectedRangeText(body: HTMLElement, range: Range): string;
export declare function selectedQuoteText(range: Range, browserText: string, anchorText: string): string;
export declare function sourceClip(source: QuoteSource): {
    left: number;
    top: number;
    right: number;
    bottom: number;
};
export declare function focusSourceComposer(source: QuoteSource): void;
