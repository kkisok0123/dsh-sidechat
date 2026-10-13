import type { Context } from '../../host/contracts.ts';
/** TriggerGuard 推导（宿主 guardOf 的 3 行复刻：plain 全活 / claimed 只活 @ / 其余全灭）。 */
export declare function guardOf(phase: string | undefined): 'plain' | 'claimed' | 'frozen';
/** MenuState 的最小镜像（input-trigger core/contract.d.ts）。 */
export interface SlashMenuState {
    readonly open: boolean;
    readonly groups: readonly {
        readonly source: string;
        readonly status: 'pending' | 'ready';
        readonly items: readonly {
            readonly name: string;
            readonly description?: string;
            readonly icon?: string;
            readonly hint?: string;
        }[];
    }[];
    readonly highlight: {
        readonly source: string;
        readonly index: number;
    } | null;
}
/** 可视分组（候选带**原始索引**——pick 的 CAS 要它；过滤挪位不改索引）。 */
export interface VisibleGroup {
    readonly source: string;
    readonly status: 'pending' | 'ready';
    readonly items: readonly {
        readonly item: SlashMenuState['groups'][number]['items'][number];
        readonly index: number;
    }[];
}
/** 触发控制器镜像（公开契约面；技术审查 A3 实证非 off-face）。 */
export interface TriggerController {
    readonly menu: {
        subscribe(fn: () => void): () => void;
        getSnapshot(): SlashMenuState;
    };
    track(draft: string, caret: number, guard: 'plain' | 'claimed' | 'frozen', draftRev: number): void;
    pick(source: string, index: number): void;
    arbitrate(key: string, composing: boolean): 'consumed' | 'pick-highlighted' | 'pass';
    dismiss(): void;
}
/** 解析侧边会话的触发控制器（缺席/异常 → null，菜单整体不出现）。 */
export declare function resolveTriggerController(ctx: Context, childId: string | undefined): TriggerController | null;
export interface SlashMenuHandle {
    readonly state: SlashMenuState;
    readonly controller: TriggerController;
}
/** 订阅控制器 menu store；controller 缺席返回 null。 */
export declare function useSlashMenuState(controller: TriggerController | null): SlashMenuState | null;
/** 过滤后的可视分组（排除不可嵌套候选名 + 空组；候选保留原始索引供 pick）。 */
export declare function visibleGroups(state: SlashMenuState | null): VisibleGroup[];
/** 键盘键 → 仲裁键映射（非仲裁键返回 null = 放行）。 */
export declare function arbitrateKeyOf(key: string): 'up' | 'down' | 'enter' | 'escape' | null;
/**
 * 斜杠菜单浮层（composer 上方，绝对定位）。分组渲染（source 组头）+
 * 高亮跟随 controller 的 highlight store + 点击 pick。
 */
export declare function SlashMenuView(props: {
    state: SlashMenuState;
    onPick: (source: string, index: number) => void;
}): import("react").JSX.Element | null;
