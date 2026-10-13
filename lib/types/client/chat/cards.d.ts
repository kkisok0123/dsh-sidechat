/**
 * 工具卡映射层（L0 纯逻辑）：宿主快照下发的渲染意图（callView/resultView
 * card union）→ 本插件自己的工具卡视图模型（ToolCardModel）。
 *
 * 为什么不直接在视图层 switch 宿主 union：
 * 1. 三层判别（card → shape/kind → null 缺省）收敛在这一处，视图层只认
 *    ToolCardModel（窄栏渲染不需要关心宿主的判别结构）；
 * 2. card 集合官方明示可扩展（"a new arm is a union edit plus a consumer
 *    branch"）——未知值必须 default 降级 generic + warn-once（T3 纪律），
 *     warn 只打一次防刷屏；
 * 3. 测试在 node 跑纯函数，不碰 React。
 *
 * 类型来源：import type 自 @deepseek-ai/dsh-tools（0.1.5 起 presentation
 * 类型从 api-remotes 迁此——0.1.1 时代的 import 源已不导出这两个类型）。
 */
import type { ToolCallView, ToolResultView } from '@deepseek-ai/dsh-tools';
/**
 * 叶子类型不从 dsh-tools 直接拉（api-remotes 未再导出；三处影子会漂移）——
 * 结构派生自已钉的联合，漂移时 typecheck 在这里变红而不是在运行时空字段。
 */
type GenericCallView = Extract<ToolCallView, {
    card: 'generic';
}>;
export type ToolCallKind = NonNullable<GenericCallView['kind']>;
type DiffCallView = Extract<ToolCallView, {
    card: 'diff';
}>;
export type FileDiff = DiffCallView['diffs'][number];
export type FileLocation = NonNullable<GenericCallView['locations']>[number];
/** 归一化工具卡视图模型（视图层唯一消费形状）。 */
export type ToolCardModel = {
    kind: 'generic';
    /** 标题（resultView.title ?? callView.title ?? 工具名兜底）。 */
    title: string;
    /** 图标类别（callView.kind，缺省 'other'）。 */
    icon: ToolCallKind;
    /** 展开的 salient 输入（string 原样 / object 走 JsonTree）。 */
    rawInput?: unknown;
    /** 结果内容（resultView.content 优先，缺省回退原始 content 文本）。 */
    bodyText?: string;
    /** 跟随文件列表。 */
    locations?: readonly FileLocation[];
} | {
    kind: 'terminal';
    /** 标题（有人话 description 时 = 「Bash · description」，否则 = 命令原文）。 */
    title: string;
    /** 命令原文（TerminalBlock 的 command——标题让位给 description 后命令仍随行）。 */
    command: string;
    description?: string;
    /** 已解析的 cwd（相对路径已按 cwdBase 折成绝对；无 base 时原样）。 */
    cwd?: string;
    output?: string;
    exitCode?: number;
    signal?: string;
} | {
    kind: 'todo';
    /** 标题（任务 · N 已完成 · N 进行中 · N 待处理，非零组才出现）。 */
    title: string;
    items: readonly {
        content: string;
        status: string;
    }[];
} | {
    kind: 'diff';
    title: string;
    diffs: readonly FileDiff[];
    locations?: readonly FileLocation[];
} | {
    kind: 'search';
    title: string;
    shape: 'matches' | 'paths';
    files?: readonly {
        path: string;
        matches: readonly {
            lineNumber: number;
            line: string;
        }[];
    }[];
    paths?: readonly string[];
    truncated: boolean;
    total: number;
} | {
    kind: 'read';
    title: string;
    path: string;
    lines: readonly {
        number: number;
        text: string;
    }[];
    totalLines: number;
    lang?: string;
} | {
    kind: 'web';
    title: string;
    webKind: 'search' | 'fetch';
    /** search 态：引用源列表。 */
    sources?: readonly {
        url: string;
        title?: string;
        snippet?: string;
    }[];
    /** search 态：provider 答案。 */
    answer?: string;
    /** fetch 态：最终 URL / 状态码 / 截断标记。 */
    url?: string;
    statusCode?: number;
    truncated?: boolean;
};
/**
 * 展示态路径缩短：>3 段的绝对路径只保末 3 段（≈仓库相对形态，与主区
 * 「Read · dsh-sidechat/scripts/x.sh」同款）。窄栏标题位只够放语义尾部。
 */
export declare function shortPath(p: string): string;
/**
 * 标题整形：「Tool /abs/path」→「Tool · 末3段」（主区同名同款）；
 * 裸绝对路径标题 → 末 3 段；不含路径的标题原样。
 */
export declare function displayTitle(title: string): string;
export interface CardModelInput {
    /** 工具名兜底（callView 缺失时的标题）。 */
    toolName: string;
    callView: ToolCallView | null | undefined;
    resultView: ToolResultView | null | undefined;
    /** 原始结果正文（resultView 缺 content 时的回退）。 */
    rawText?: string;
    /** 会话工作区（相对 cwd 解析基准）。 */
    cwdBase?: string;
}
/**
 * callView + resultView → 一张卡的视图模型。三层判别全在这里；
 * 结果态优先（title 等字段 result 覆盖 call），缺省逐字段回退。
 */
export declare function cardModelOf(input: CardModelInput): ToolCardModel;
export interface NodeCardInput {
    /** wire 工具名（tool-result 节点的 call.name）。 */
    name: string;
    /** 调用头参数原文（JSON 字符串）。 */
    argsRaw?: string | undefined;
    /** 结果 meta（presentationMeta，0.1.2 起在节点上随行）。 */
    meta?: unknown;
    /** 结果正文（已拼 text 块）。 */
    rawText: string;
    /** 失败标记（0.1.2 节点 isError）——失败结果无 meta（presentationMeta 只投
     *  影成功路径），但 write 的空-meta 回退必须先判它，否则失败的 write 也
     *  会被渲染成 diff 卡（官方 diffCardModel 显式 isError → null）。 */
    isError?: boolean | undefined;
    cwdBase?: string | undefined;
}
/**
 * 0.1.2 推导路径：节点原始字段 → ToolCardModel。与 cardModelOf（0.1.1 wire
 * 面）平级；选择点在 transcript 层（节点带不带 callView 一眼可分）。
 */
export declare function cardModelFromNode(input: NodeCardInput): ToolCardModel;
export {};
