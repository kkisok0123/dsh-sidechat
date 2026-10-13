/**
 * 「@ 引用侧边聊天」触发源（WI-04，D4/@引用回流入口）：主输入框（任意会话）
 * 敲 @ → 候选列出当前会话的开启中侧边聊天 → 选中即在草稿插入引用 chip；
 * 提交时 codec.serialize 把侧聊内容序列化为结构化 XML 上下文块注入。
 *
 * 机制事实（技术审查修正了早先「codec 无注册面」的记录）：InputTriggerSource
 * 可自带 `codec`（trigger/types.d.ts）——serialize 在提交时按调用、异步、
 * 失败阻断发送（不静默降级）。
 *
 * 序列化形态（与回流协议同族）：<side-chat source="侧边 N"> 内按序 <问>/<答>
 * 对。不截断（用户裁定），但只含问答对——工具卡/思考不进。
 */
import type { Context } from '../host/contracts.ts';
/** 候选名消歧（导出纯可测）：重名依次追加「 · 2」「 · 3」，本批内唯一。 */
export declare function dedupeName(name: string, taken: Set<string>): string;
/** 侧聊内容 → 结构化引用块（问答成对，全文不截断）。 */
export declare function serializeSideChatRef(ctx: Context, childId: string): Promise<string>;
/** 注册「@ 侧聊」触发源；服务缺席静默降级（不影响其他入口）。 */
export declare function registerSideChatReferenceSource(ctx: Context): void;
