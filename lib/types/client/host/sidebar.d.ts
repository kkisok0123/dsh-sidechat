import type { Context, SidebarRightService } from './contracts.ts';
/** Remember the plugin root context at activation (see module docstring). */
export declare function setRootContext(ctx: Context): void;
/** Plugin root context; falls back to the caller's context (legacy behaviour). */
export declare function rootContext(fallback: Context): Context;
/**
 * betterSidebar 服务的唯一安全读取面（对抗性审查 B-1）：cordis 对「未
 * provide 且未 inject」的服务**属性访问抛错**（`cannot get property without
 * inject`），`?.` 也挡不住；`ctx.get` 返回 undefined 不抛。optional peer
 * 后 betterSidebar 不在 inject 清单——一切消费点必须走这里。
 */
export declare function betterSidebarOf(ctx: Context): Context['betterSidebar'];
/**
 * 直连腿判定（WI-05）：tab 直连注册进原生右栏的条件。
 * - betterSidebar ≥ 0.19 ⇒ 宿主必 ≥ 0.1.5（BS 0.19 只支持 0.1.5）⇒ 直连；
 * - betterSidebar 整体缺席（optional peer 后的合法形态）⇒ 只能直连；
 *   无 BS 且无原生面的非法环境（宿主 < 0.1.5）下注册静默不到、侧聊缺席，
 *   其余功能（注释/回流搭车）存活——静默缺席优于崩。
 */
export declare function directNativeLeg(ctx: Context): boolean;
/**
 * True when the host keeps sidebar tabs outside the legacy layout store
 * (better-sidebar >= 0.19). Version parse is best-effort: an unparsable
 * version reports false, which keeps the pre-0.19 behaviour.
 */
export declare function nativeSidebarHost(ctx: Context): boolean;
export declare function clearRootContext(): void;
/**
 * 聚焦一个 native tab：better-sidebar >= 0.19 的 `surface.activate` 是空操作
 * （只返回记录存在性——authority: dsh-better-sidebar src/client/native/surface.ts），
 * 真实聚焦面是 dsh 0.1.5 的 `ISidebarRight.focus`（authority:
 * dsh-client-ui-sidebar-right lib/types/client/service.d.ts `focus(tabId)`）。
 * focus 只标记活动 tab/pane，不展开折叠的栏——聚焦的语义包含「让用户看见」，
 * 故折叠时补 toggleExpanded（authority: 同文件 `isExpanded/toggleExpanded`）。
 * @returns true = 已通过 focus 聚焦；false = 面缺席（调用方回退 activateTab）。
 */
export declare function focusNativeTab(ctx: Context, tabId: string): boolean;
export declare function sidebarRightOf(ctx: Context): SidebarRightService | undefined;
