import type { Context } from '../host/contracts.ts';
/** 全局瞬态通知入口（任何模块可调；未挂载宿主时静默丢弃）。 */
export declare function showToast(text: string): void;
/** 挂载全局 toast 宿主（registerSideChat 里调用一次）。 */
export declare function registerToastHost(ctx: Context): void;
