import type { ChatMessage } from '../chat/transcript.ts';
import type { FoldStore } from '../chat/viewState.ts';
import type { ReflowStore } from '../reflow.ts';
/** 空状态：💬 类图标 + 标题 + fork 语义文案（形态规格）。 */
export declare function EmptyState(): import("react").JSX.Element;
/** 加载 / 错误整屏态（标题 + 可选详情 + 可选指引）。 */
export declare function StateScreen(props: {
    title: string;
    detail?: string;
    hint?: string;
}): import("react").JSX.Element;
/**
 * 剥出首条侧边用户消息里的主线进展快照块（Delivery_04）：快照提升到继承卡
 * 区域渲染（SnapshotCard），气泡只留用户正文（零污染）。块不完整（缺闭合
 * 标签）视为无快照——消息原样渲染，绝不吃文本。
 */
export declare function splitSnapshotPrefix(text: string): {
    snapshot: string;
    takenAt: string | null;
    rest: string;
} | null;
export declare function MessageList({ messages, fold, boundarySeq, reflow, parentSessionId, sideTitle, onPromote }: {
    messages: readonly ChatMessage[];
    fold: FoldStore;
    boundarySeq: number | undefined;
    reflow: ReflowStore;
    parentSessionId: string | undefined;
    sideTitle: string;
    onPromote: () => void;
}): import("react").JSX.Element;
