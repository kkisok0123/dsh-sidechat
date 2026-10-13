import type { Context, ModelSelection, RemoteSessionModelFace, SessionModelsResult } from './contracts.ts';
/**
 * Current model selection of a session, read from its `modelSelection`
 * projection (dsh >= 0.1.2): the durable selection is projected state, so no RPC
 * is needed and the read is safe for any session id. Snapshot shape authority:
 * `@deepseek-ai/dsh-api-session-controller/lib/types/types.d.ts`
 * (`ModelSelectionProjection = { lastUsed, next }`，两者均可为 null——
 * `next` 缺省时按投影文档回落 `lastUsed`）。
 */
export declare function projectedModelSelection(ctx: Context, sessionId: string): ModelSelection | undefined;
/**
 * Remote session face carrying `selectModel`/`modelCatalog`（dsh 0.1.5 删除
 * `connection.api.sessions.*` client 面后的模型 RPC 面；事实上 0.1.2-rc.1
 * 起存在——authority: dsh-api-session-controller lib/typert.remote-client.d.ts）。
 * 探测走 `ctx.get`（cordis 的 get 不受 inject 门禁限制，本插件为兼容旧宿主
 * 不声明 inject 'remote.session'；机制见 contracts.ts RemoteSessionModelFace）。
 * `ctx.get('remote')` 返回命名空间容器时下钻其 `.session` 成员。
 */
export declare function remoteSessionFace(ctx: Context): RemoteSessionModelFace | undefined;
/**
 * 读会话当前模型选择：投影面（0.1.2+，同步无 RPC）优先；旧
 * `connection.api.sessions.models` RPC（<= 0.1.2 的 client 面，0.1.5 已删）
 * 回退（双版本链，同 chatSourceOf 先例）。永不抛错。
 */
export declare function readModelSelection(ctx: Context, sessionId: string): Promise<ModelSelection | undefined>;
/**
 * 写会话模型选择：`remote.session.selectModel`（新面）优先，旧
 * `connection.api.sessions.selectModel` 回退。面在而调用失败（模型不可路由等）
 * 属真实失败，不再落旧面重试。
 */
export declare function writeModelSelection(ctx: Context, sessionId: string, selection: ModelSelection): Promise<boolean>;
/** 读子会话当前模型名（composer 模型标签用）；任何失败回退 null（默认文案）。 */
export declare function readModelName(ctx: Context, sessionId: string): Promise<string | null>;
/**
 * 拉会话模型目录：0.1.5 走 `remote.session.modelCatalog()`（目录是宿主级，
 * 菜单选中项所需的 current 由投影/旧面补上）；旧面回退
 * `connection.api.sessions.models`。失败 null → 菜单保持只读标签态。
 */
export declare function listModels(ctx: Context, sessionId: string): Promise<SessionModelsResult | null>;
/** Explicit picker switches must preserve both route identity and host errors. */
export declare function selectModelConfirmed(ctx: Context, sessionId: string, provider: string, model: string): Promise<ModelSelection>;
/** 切换子会话模型；成功返回新模型展示名，失败 null（best-effort）。 */
export declare function switchModel(ctx: Context, sessionId: string, provider: string, model: string): Promise<string | null>;
