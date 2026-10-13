import { type ReactNode } from 'react';
import type { InputZone } from '../host/contracts.ts';
import type { ReflowStore } from '../reflow.ts';
interface ChipProps {
    readonly session: InputZone['session'];
    readonly input: InputZone['input'];
}
/** 「侧边回流」chip（dock order 11）：主会话待回流对象的可预览/可移除入口。 */
export declare function createReflowChip(reflow: ReflowStore): (props: ChipProps) => ReactNode;
export {};
