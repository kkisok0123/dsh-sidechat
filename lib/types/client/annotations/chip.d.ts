import type { ReactNode } from 'react';
import type { InputZone } from '../host/contracts.ts';
import type { AnnotationStore } from './model.ts';
/** Props the dock skeleton hands us: the InputZone owner share (point-in-time). */
interface ChipProps {
    readonly session: InputZone['session'];
    readonly input: InputZone['input'];
}
export declare function AnnotationChip(props: {
    store: AnnotationStore;
    targetSessionId: string;
    side?: boolean;
}): ReactNode;
/** Main dock adapter; side composers render the same AnnotationChip directly. */
export declare function createAnnotationChip(store: AnnotationStore): (props: ChipProps) => ReactNode;
export {};
