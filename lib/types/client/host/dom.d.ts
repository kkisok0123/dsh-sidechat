/** Internal conversation DOM seams, validated by the pinned host journeys.
 * Main message markers and composer seats have no public replacement API. */
export declare const MAIN_ASSISTANT = "[data-chat-flow-kind=\"assistant-step\"]";
export declare const NON_QUOTE = "button, [role=\"button\"], input, textarea, select, [contenteditable=\"true\"], [data-code-block-banner], [data-sidechat-no-quote]";
export declare function elementOf(node: Node): Element | null;
export declare function mainMessageOf(node: Node, currentSessionId: string): {
    body: HTMLElement;
    view: HTMLElement;
    anchor: HTMLElement;
    key: string | undefined;
    sessionId: string;
    surface: "main";
    streaming: boolean;
} | null;
export declare function mainAnchorBodies(sessionId: string, anchorKey: string, currentSessionId: string): HTMLElement[];
/** Intersect every clipping ancestor, then exclude this view's composer. */
export declare function quoteClipOf(body: HTMLElement, view: HTMLElement): {
    left: number;
    top: number;
    right: number;
    bottom: number;
};
export declare function nativeSideAssistantBodies(): HTMLElement[];
export declare function mainComposerOf(node: Element): HTMLElement | null;
/** 侧边原生会话面板内的 composer 手势命中（边界注入器的识别面）。 */
export declare function sideNativeComposerGestureTarget(node: Element): HTMLElement | null;
export declare function composerSessionOf(node: Element, fallback: string): string;
export declare function composerSeatForSession(sessionId: string): HTMLElement | null;
export declare function focusMainComposer(view: HTMLElement): void;
/** Focus only the identified main view, never another pane's editor. */
/** Focus a side composer by exact child identity; never fall back to the main input. */
export declare function focusSideConversationComposer(sessionId: string): void;
export declare function focusConversationComposer(sessionId: string): void;
/** 主 composer 的宿主容器（侧边面板 textarea 不在其中，天然不串）。 */
export declare function composerSeat(): HTMLElement | null;
/** 发送按钮 = [data-composer-card] 内 DOM 序最后一个 button（仅 click 路径用，
 *  且只在非运行态作为识别面——运行态主按钮变身「停止」，整个 click 路径不拦）。 */
export declare function findSendButtonInCard(seat?: HTMLElement | null): HTMLButtonElement | null;
export declare function isMainComposerInput(target: EventTarget | null): boolean;
export declare function composerHasMenu(seat: HTMLElement): boolean;
export declare function hasConversationMessages(): boolean;
