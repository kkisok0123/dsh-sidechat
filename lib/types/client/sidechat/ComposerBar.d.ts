import type { Context, SessionFace } from '../host/contracts.ts';
import type { Composer } from './composer.ts';
import type { AnnotationStore } from '../annotations/model.ts';
/** 底部 composer：自绘输入框；模型标签显示子会话真实当前模型（fork 时同步主会话选择）。 */
export declare function ComposerBar(props: {
    ctx: Context;
    session: SessionFace | undefined;
    composer: Composer;
    running: boolean;
    visible: boolean;
    modelName: string | null;
    childId: string | undefined;
    onModelSwitched: (name: string) => void;
    annotations: AnnotationStore;
}): import("react").JSX.Element;
