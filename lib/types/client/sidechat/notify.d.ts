/**
 * 完成通知（WI-03，L3 常驻监听层）：侧聊子会话 running true→false 翻转时
 * toast 提醒——用户焦点在主对话时侧聊长任务跑完能被看见（Zed
 * notify_when_agent_waiting 先例）。
 *
 * 事件源是 session.subscribe 快照推送（非轮询）；宿主 notifier 入账不依赖
 * 订阅者——面板不可见（SideChatPanel 的 uSES 断订阅）期间事件不丢。
 * 本层是常驻 ctx.effect：Tab 开闭由 betterSidebar.subscribeState 重扫驱动。
 */
import type { Context } from '../host/contracts.ts';
/**
 * 翻转侦测核心（抽出来纯可测）：running true→false 且距挂接超过保护窗
 * 时返回 true。调用方持状态。
 */
export declare function shouldNotify(wasRunning: boolean, running: boolean, attachedAt: number, now: number): boolean;
export declare function registerCompletionNotify(ctx: Context): void;
