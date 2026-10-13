/**
 * Client half of dsh-sidechat: the side-chat tabs (Workitem 01) and the
 * selection annotations (Workitem 02).
 *
 * 双模（Workitem_05）：betterSidebar 是 optional peer——
 * - 宿主 ≥ 0.1.5（有 sidebarRightTabs）：侧聊直连原生右栏（无论 BS 在不在）；
 * - 宿主 ≤ 0.1.2 + BS < 0.19：legacy 腿（betterSidebar 布局）。
 * betterSidebar 不在 inject 清单（required 会让无-BS 环境拒绝启动插件）；
 * 运行时经 directNativeLeg(ctx) 分腿，消费点全部判空。
 */
import type { Context } from './host/contracts.ts';
export declare const inject: string[];
export declare function apply(ctx: Context): void;
