import type { ToolCardModel } from './cards.ts';
import type { FoldStore } from './viewState.ts';
export declare function ToolCard(props: {
    model: ToolCardModel;
    rowKey: string;
    fold: FoldStore;
    streaming?: boolean;
    error?: boolean;
}): import("react").JSX.Element;
