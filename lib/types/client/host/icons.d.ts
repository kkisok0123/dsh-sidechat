import type { ComponentType } from 'react';
interface IconProps {
    size?: number;
    className?: string;
}
type IconComponent = ComponentType<IconProps>;
/** Prefer the weight-named 0.1.7 export, then fall back to the legacy size-named export. */
export declare function resolveIcon(exports: Readonly<Record<string, IconComponent | undefined>>, modernName: string, legacyName: string): IconComponent;
export declare const IconNewChatOutline16: IconComponent;
export declare const IconCheckOutline16: IconComponent;
export declare const IconListPenOutline16: IconComponent;
export declare const IconEditOutline16: IconComponent;
export declare const IconTrashOutline16: IconComponent;
export declare const IconPlayOutline16: IconComponent;
export declare const IconCordisPluginOutline14: IconComponent;
export declare const IconBranchOutline16: IconComponent;
export declare const IconShareOutline16: IconComponent;
export declare const IconChevronDownOutline14: IconComponent;
export declare const IconCloseOutline16: IconComponent;
export declare const IconRightUpOutline16: IconComponent;
export declare const IconSearchOutline16: IconComponent;
export declare const IconGlobeOutline14: IconComponent;
export declare const IconCodeOutline16: IconComponent;
export declare const IconChecklistOutline14: IconComponent;
export declare const IconThinkOutline16: IconComponent;
export declare const IconInspectOutline12: IconComponent;
export declare const IconPaperclipOutline16: IconComponent;
export declare const IconStopFill16: IconComponent;
export declare const IconSendOutline16: IconComponent;
export declare const IconWarningOutline16: IconComponent;
export declare const IconQuestionOutline14: IconComponent;
export {};
