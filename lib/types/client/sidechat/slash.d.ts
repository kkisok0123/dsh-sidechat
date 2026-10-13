/**
 * /side 斜杠命令（spike 落点）：经 client 侧 `ctx.commandUi.register`
 * （dsh-client-ui-commands 的 CommandContribution，ui 形态 popupSelect）
 * 注册。popupSelect 是该注册面唯一的 UI 形态 —— 菜单行被选中后弹一个
 * 选项壳，选项 = 新建 + 当前会话已并存的侧边聊天（聚焦）+ 最近关闭（重开）。
 * native 宿主（DSH ≥ 0.1.5 原生右栏；legacy 宿主由 better-sidebar ≥ 0.19
 * 转发到同一原生栏）受 dsh sidebar-right 的 held 规则约束
 * （page kind 每 pane 单实例）：有存活实例时不列「新建」与「重开」。
 *
 * 服务经 ctx.get 惰性解析（commandUi 不在 inject 清单里）：服务缺失、
 * 注册抛错（如与 host 命令撞名）都降级为「只有 Tab 入口」，绝不影响面板。
 *
 * 中文别名「侧边」：宿主命令过滤只匹配命令名、不匹配描述（B1 实测中文用户
 * 输「/侧边」候选直接清空）——注册双名让中文关键词直达。
 */
import type { Context } from '../host/contracts.ts';
/** 注册 /side 与中文别名「/侧边」；不可行时静默降级（不影响 Tab 入口）。 */
export declare function registerSideCommand(ctx: Context): void;
