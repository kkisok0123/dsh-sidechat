import type { Context, SessionFace, SessionInput } from '../host/contracts.ts';
import type { AnnotationStore } from '../annotations/model.ts';
export { readInputDraft } from '../host/input.ts';
/**
 * 解析 childId 会话的 input 草稿机；任何一步缺失/抛错返回 null
 * （调用方走降级路径）。
 */
export declare function resolveSessionInput(ctx: Context, childId: string): SessionInput | null;
/** composer 对外脸：machine 标记实际落点（true = input 机器，false = 自绘降级）。 */
export interface Composer {
    readonly machine: boolean;
    readonly draft: string;
    readonly sendError: string | null;
    readonly canSubmit: boolean;
    setDraft(text: string): void;
    /** 拼接一段外部文本（桥接注入的引文草稿）。 */
    appendDraft(text: string): void;
    /** 发送当前草稿（空草稿 no-op）。mode 缺省 = 机器/设置裁决（busy-Enter）。
     *  首条消息前缀由 useComposer 的 firstSendPrefix 选项注入（Delivery_04）。 */
    submit(mode?: 'queue' | 'steer'): void;
    /** 斜杠/@ 触发接线需要：机器相位 + 草稿版本号（缺机器时 undefined）。 */
    readonly phase: string | undefined;
    readonly draftRev: number | undefined;
    /** 待发图片附件 id 列（附件 rail；缺机器时空）。 */
    readonly imageIds: readonly string[];
    /** 待发图片的预览（rail 渲染用；id + previewUrl）。 */
    readonly imagePreviews: readonly {
        id: string;
        url: string;
    }[];
    /** 附件能力可用（机器在 + createDraftImages 面在）。 */
    readonly canAttach: boolean;
    /** 选中文件挂为草稿图片；返回是否挂上。 */
    attachImages(files: readonly File[]): boolean;
    /** 移除一张待发图片。 */
    removeImage(id: string): void;
}
/**
 * 面板 composer hook。机器路径：草稿住在 input 机器的 store 里（随会话持久、
 * 与主输入框同语义），submit 走机器事务（序列化/裁决/默认 sink 全在机器内）。
 * 降级路径：草稿住本地 state，发送直连 session.prompt([...], 'queue')，
 * 失败时回填草稿并报错。
 *
 * firstBoundaryBlock（Codex 对齐）：首条消息的侧聊边界协议块（继承历史
 * 只读参照 + 侧边助手策略）——一次性，接受后由 onAccepted 消费。
 * firstSendPrefix：busy fork 的主线进展快照；同样一次性、真实接受后才
 * 由 onAccepted 消费。失败时剥离临时前缀，保留正文与待发注释。
 *
 * onSubmitText（Delivery_05 内容身份）：每次 submit 拿到干净 body（不含
 * 快照前缀），供面板捕获首条消息主题为 topic；是否首条的判定归调用方。
 */
export declare function useComposer(ctx: Context, session: SessionFace | undefined, childId: string | undefined, options?: {
    annotations?: AnnotationStore;
    firstBoundaryBlock?: () => string | null;
    firstSendPrefix?: () => string | null;
    onSubmitText?: (body: string) => void;
    onAccepted?: () => void;
}): Composer;
