/**
 * dsh-sidechat host half（Workitem_06：reflow 注入通道对齐官方侧会话提案）。
 *
 * 职责：POST /sidechat/reflow——把回流内容以 `agent.inject(UserMessage,
 * {source:{kind:'plugin', plugin:'dsh-sidechat', form:'notice', summary}})`
 * 注入父会话日志（下轮领取、不唤醒；对齐 2026-07-08 官方侧会话提案的
 * handback 语义——其 `context/message` 形态在 07-20 去封套时移除，inject
 * 是现行等价物，见 Workitem_01 spike 的 design.md）。
 *
 * 为什么需要宿主半包：`agent.inject` 只在宿主侧可达（agents registry）；
 * 客户端的 session.prompt 只有 queue/steer（会唤醒开轮次，语义不符）。
 *
 * 降级纪律：webServer 面缺席（headless/CLI 形态）→ 路由不注册，客户端
 * 回落搭车形态；agents/webRuntime 缺席 → handler 内降级（no-live-agent /
 * fence 退化为只信 loopback——fail-closed）。能力可选，绝不阻塞插件装载。
 *
 * 信任栅栏（对抗性审查 M3）：本路由能把任意文本注入用户主会话上下文
 * （间接 prompt injection 面）——每个请求先过 trust-fence（移植自
 * dsh-better-sidebar src/trust-fence.ts，BSD-3-Clause 同源复制）。
 */
import type { IncomingHttpHeaders } from 'node:http';
/** Plugin identity for cordis.yml rows. */
export declare const name = "dsh-sidechat";
interface HttpRequestLike {
    headers: IncomingHttpHeaders;
    [Symbol.asyncIterator](): AsyncIterator<string | Uint8Array>;
}
interface HttpResponseLike {
    writeHead(status: number, headers?: Record<string, string>): void;
    end(body?: string | Uint8Array): void;
}
interface HostContext {
    get(name: string): unknown;
    effect(fn: () => void | (() => void), label?: string): unknown;
}
/** reflow 注入处理：父会话 agent 在 → inject；不在 → ok:false（客户端回落搭车）。
 *  导出供单测（宿主 handler 的 fence/校验/降级路径）。 */
export declare function makeReflowHandler(ctx: HostContext): (req: HttpRequestLike, res: HttpResponseLike) => Promise<void>;
export declare function apply(ctx: unknown): void;
export {};
