/**
 * 消息流折叠态的外置 store（L1，react-free）：每条卡/思考块的展开状态按
 * 消息 key 寄存——组件卸载/重挂（Tab 切换、列表重渲）不丢展开态。
 * 默认折叠（Delivery_03 裁决规则一：密度于默认态）。
 *
 * 持久化（WI-03 P0-2）：传 storageKey 即按 localStorage 持久化（容错 revive，
 * 空删键）——刷新/重启后展开态恢复。
 */
export interface FoldStore {
    getSnapshot(): number;
    subscribe(fn: () => void): () => void;
    isOpen(key: string): boolean;
    /** 用户是否显式碰过该键（思考块「流式默认展开」要区分未触碰 vs 显式收起）。 */
    has(key: string): boolean;
    toggle(key: string): void;
    /** 全部收起/展开（P1-4 密度管理「一键折叠工具流」）。keys = 当前可见键集。 */
    setAll(keys: readonly string[], open: boolean): void;
}
export declare function createFoldStore(storageKey?: string): FoldStore;
