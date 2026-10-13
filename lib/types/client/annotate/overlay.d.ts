import type { ReactNode } from 'react';
import type { Context } from '../host/contracts.ts';
import type { Annotation, AnnotationStore } from '../annotations/model.ts';
import type { SelectionController } from './selection.ts';
interface Bounds {
    left: number;
    top: number;
    right: number;
    bottom: number;
}
interface OverlayProps {
    readonly ctx: Context;
    readonly store: AnnotationStore;
    readonly controller: SelectionController;
}
export declare function AnnotateOverlay(props: OverlayProps): ReactNode;
/** 「Ask in side chat」的注解编辑器（新建态同构：输入框 + ✓，允许空注解）。
 *  bridge 失败时不关编辑器、给出内联错误——用户写好的注解不丢。 */
export declare function SideChatNoteEditor(props: {
    x: number;
    y: number;
    targetTitle?: string;
    bounds?: Bounds;
    onSave: (note: string) => boolean | Promise<boolean>;
    onCancel: () => void;
}): ReactNode;
/**
 * The annotation editor popover. 新建态: input + ✓ 确认 (允许空注解直接保存;
 * 点击外部 = 确认、Esc = 取消，无显式取消按钮). 重开态: 已有注解 + 🗑 删除 +
 * 取消/保存.
 *
 * 导出供单测直接挂载（tests/annotate-editor.spec.tsx）。
 */
export declare function AnnotationEditor(props: {
    annotation: Annotation;
    mode: 'new' | 'edit';
    x: number;
    y: number;
    bounds?: Bounds;
    targetTitle?: string;
    onSave: (note: string) => void;
    onDelete: () => void;
    onCancel: () => void;
}): ReactNode;
export {};
