/**
 * 侧边聊天的宿主接线层（L3）：fork 编排 / 归档 / 模型同步 / Tab meta 读写 /
 * 面板展开 / 会话窗口打开。SideChatPanel（L2）只调这里的编排函数，
 * 不直接碰宿主 RPC（WI-00 分层纪律：L2 无直接宿主调用）。
 *
 * off-face 探测纪律：session.open()、store.update 均为运行时可达但契约不
 * 保证的面——就地 feature-check + 吞错降级，并登记进 host/probes.ts。
 */
import type { Context, SessionFace } from '../host/contracts.ts';
import { type SideChatMeta } from './model.ts';
export { projectedModelSelection, remoteSessionFace, readModelSelection, writeModelSelection, readModelName, listModels, switchModel } from '../host/models.ts';
export { chatSourceOf, retainSession } from '../host/chat.ts';
/**
 * 主线忙碌判定（busy-fork 路由）。2026-09-22 实证的宿主 fork 语义缺口：fork
 * 一个 turn 在飞的会话，会把在飞消息以「未认领的 inbox splice」形态遗传
 * 给子会话——子会话 boot 后把它当成自己的首个任务执行，用户真正发的侧边
 * 消息则排进不可见队列（用户视角 = 「发不了」+「主线最后一条消息被抄到
 * 侧边」）。busy 时改走 busy-fork 路径（fork 后监护中和遗传 turn，见
 * armInheritedTurnPurge）。
 *
 * busy = running（Session 快照顶层，0.1.1/0.1.2/0.1.5 同在）或 pending
 * 非空（审批/提问挂起：0.1.1 在 Session 快照顶层，0.1.2 起在
 * uiConversation.chat 的 legacy 切片——双面都读，同面板 R8 链）。
 * 探测失败一律按「空闲」放行（fork 错误面兜底），绝不因读不到状态而卡死。
 */
export declare function sessionBusyOf(ctx: Context, sessionId: string): boolean;
/** 该子会话当前是否处于遗传 turn 监护/清除窗口。 */
export declare function isPurgingInheritedTurn(childId: string): boolean;
/**
 * 遗传 turn 监护（busy fork 的核心中和手段）：busy fork 的子会话日志带着
 * 主线在飞消息的未认领 inbox insert（宿主 fork cut 缺陷），boot 后会被认领
 * 执行。子会话 fork 后是休眠的（实测不 open 不 prompt 不跑）。
 *
 * 信号面（实证教训，勿回退）：Session 控制快照的 running 位由管理器的
 * 列表/活动通道驱动，**非在屏会话不实时翻牌**——watch 它永远等不到 true。
 * 可靠信号是 chat 投影（openSessionWindow 打开的事件窗驱动）：泄漏消息只在
 * 被认领（= 遗传 turn 开跑）后才落成 user 节点——**该节点在子会话投影中
 * 出现即 turn 已开跑**，此刻 cancel 恰落在首个 LLM 响应窗口内（≥1s），
 * 工具来不及执行。
 *
 * 判别（双门，防误伤）：先过 seq 门——继承节点的 seq 与父会话原值一致
 * （fork 前缀逐字拷贝），只有 seq > forkBoundarySeq 的用户节点才是 fork 后
 * 新增的（继承历史里的用户消息不参与判别）；再过文本门——expectedPrefix
 * 在场时节点的文本须命中 fork 时刻记下的在飞消息前缀，未命中（宿主已修好
 * cut 缺陷/用户自己的首个侧边消息）即解除，绝不误 cancel。前缀缺席
 * （读取失败）退化为纯 seq 门判别。
 *
 * 监护一次性：settle（cancel 完成/判别未命中/用户自己的首条消息带快照前缀）
 * 后解除并把 meta 标 inheritedPurged——面板重挂载（关 tab 重开）靠该标记
 * 跳过重复监护。cancel 后推进折叠边界覆盖 aborted turn（界面无感）。
 * **不设静置超时**：子会话休眠到用户首条消息才认领 inbox（真机实证），
 * 泄漏 turn 可能在任意晚的时刻开跑——超时撤防等于把洞留给慢用户。
 * 幂等：同一 childId 重复调用只监护一次（purgingChildren 守卫）。
 */
export declare function armInheritedTurnPurge(ctx: Context, childId: string, parentSessionId: string, tabId: string, expectedPrefix?: string, forkBoundarySeq?: number): void;
/**
 * 首开编排：fork（全量历史快照）→ 登记 meta（先行，绝不丢登记）→
 * 归档隐藏出会话列表（best-effort）→ 模型跟随主会话（best-effort）。
 * fork 失败抛错（面板组件转错误态）；后两步失败只告警不阻断。
 *
 * 主线 turn 在飞（busy）时走 busy-fork（Delivery_04）：立即 fork + 遗传
 * turn 监护 + meta 打 forkedMidTurn 标记（首条侧边消息拼进展快照）；
 * 主线零完成轮（fork-unavailable）退化为 create 纯快照会话（snapshotOnly）。
 * @returns fork/创建出的子会话 id。
 */
export declare function forkAndRegister(ctx: Context, parentSessionId: string, tabId: string, signal?: AbortSignal): Promise<string>;
/**
 * Tab meta 读-改-写。双腿：直连原生腿的 meta 在自有 metaStore（原生无
 * updateTab 面，布局 memory-only）；legacy 腿在布局快照 + betterSidebar.updateTab。
 * 分腿判据统一为 directNativeLeg（对抗性审查 m1：判据单点化——metaStore
 * 有无记录不能再当判据，否则记录缺失时 childId 登记会静默落到 no-op 的
 * legacy 面）。直连腿记录缺失 = 异常态（reconcile 应先已建）：warn 并 no-op。
 */
export declare function updateTabMeta(ctx: Context, sessionId: string, tabId: string, mutate: (meta: SideChatMeta) => SideChatMeta): void;
/**
 * 写入内容身份（Delivery_05）：meta 双腿写 + legacy 腿补标题 patch
 * （native 芯片标题槽订阅 metaStore，meta 落库即免费响应；legacy 标题是
 * 布局快照里的静态字段，必须显式 patch；topic 在时编号不参与标题，
 * 故 legacy 侧无需反推编号）。sticky 守卫沉在 mutate 里（同帧连发两次
 * submit 时面板侧 ref 守卫有相位差，审查 L2）。
 */
export declare function setSideChatTopic(ctx: Context, sessionId: string, tabId: string, topic: string): void;
/** 关闭侧聊 tab：直连腿走 ISidebarRight.close，legacy 走 betterSidebar.closeTab。 */
export declare function closeSideTab(ctx: Context, tabId: string, sessionId: string): void;
/**
 * 程序化入口（/side、bridge 划选提问）打开 Tab 时面板可能处于折叠态——
 * 类型型 openTab 不自动展开（better-sidebar 只对 path/url 内容型打开展开）。
 * 幂等展开（off-face：store.update 是 SidebarStore 公开 mutator 面；
 * feature-check + 吞错，兜底失败不影响功能）。
 */
export declare function ensurePanelOpen(store: unknown): void;
/**
 * 0.1.7 自愈：旧版本插件把侧边子会话归档隐藏，ArchivedSessionGate 会拒跑它
 * 的模型步（turn/end blocked）。面板挂载时对 childId 幂等 unarchive；
 * 旧宿主无此 API 时 no-op。
 */
export declare function unarchiveSideSession(ctx: Context, sessionId: string | undefined): void;
/**
 * 打开非 staged 会话的事件窗口（off-face：open() 在 concrete Session 上是
 * public 且幂等，但不在 SessionFace 契约上——契约面只有 staged 会话会被
 * 运行时自动 open）。feature-check + 吞错，运行时若移除则降级为只发不收。
 */
export declare function openSessionWindow(session: SessionFace | undefined): void;
