/**
 * Wire format v3（2026-09-06 用户裁定）——发送给模型的数据形态与气泡
 * 反解析协议的唯一权威：
 *
 *   我批注了以下 2 处内容：
 *   <annotation id="1">
 *   <quote>引用原文（原样、可多行、不截断）</quote>
 *   <note>用户注解</note>
 *   </annotation>
 *   <annotation id="2">
 *   <quote>引用原文 2</quote>
 *   </annotation>
 *
 *   用户消息正文
 *
 * 为什么是 XML 块（替代 v2 的「」单行列表）：
 * - 嵌套消歧：「」在引用内容自身含「」时边界模糊（用户实测踩中）；XML 标签
 *   语义严谨、模型可读性是业界共识（Claude 官方推荐、Codex additionalContext
 *   用 <external_KEY> 同款）。
 * - 无注解的注释省略 <note>（而不是「（无注解）」占位噪音）。
 * - 气泡侧：宿主 user 气泡是纯文本渲染（UserStyleBubble/projectUserText，
 *   无 markdown 元素），隐藏手术按字符区间切文本节点完成，因此协议区必须
 *   是消息的**连续前缀**（send.ts 保证组装顺序）。
 *
 * 截断纪律（用户裁定 2026-09-06）：引用/回流内容一律全文，不截断——
 * 静默截断会让用户不知道内容少了（「产生幻觉」）。quote 是用户亲手划选的，
 * chip 预览用 CSS 省略即可，wire 上永远全文。
 */
export interface QuoteItem {
    readonly text: string;
    readonly note: string;
    /** 展示编号（与角标一致），作为 <annotation id> 供模型引用。 */
    readonly number?: number;
    readonly kind?: 'selected-text';
}
/** 协议头（双语）：zh「我批注了以下 2 处内容：」/ en 见 locales。 */
export declare function protocolHeader(n: number): string;
/** One annotation's XML block（无注解时省略 <note>）。 */
export declare function formatAnnotationXml(index: number, item: QuoteItem): string;
/** 注释协议块 = 头部句 + 每个注释一个 XML 块（行间无空行，与正文空一行）。 */
export declare function buildProtocolBlock(items: readonly QuoteItem[]): string;
/** 协议头识别（zh/en 都认）：整行匹配。 */
export declare const PROTOCOL_HEADER_RE: RegExp;
export interface ParsedAnnotation {
    readonly id: number;
    readonly quote: string;
    /** '' = 无注解。 */
    readonly note: string;
}
export interface ParsedRefFlow {
    readonly source: string;
    readonly content: string;
}
export interface ProtocolPrefix {
    /** 协议区在消息文本中的字符长度（前缀，手术按它切）。 */
    readonly length: number;
    readonly annotations: readonly ParsedAnnotation[];
    readonly reflows: readonly ParsedRefFlow[];
}
/**
 * 气泡 tooltip / 面板留痕 chip 的展示拍平：剥掉 <问>/<答> 协议标签只留内容行
 * （协议标签是 wire 形态，不出现在 UI）。仅用于 title 悬浮文案。
 */
export declare function flattenReflowContent(content: string): string;
/**
 * 从消息文本开头解析协议前缀（回流块* → 注释块）：任一命中即返回。
 * 全部不命中返回 null（普通用户消息，零开销）。
 * 注意：内容里恰好含字面 `</quote>` 会在该处截断解析（已知极限，聊天引用
 * 场景可忽略；Codex 的 <external_KEY> 同款取舍）。
 */
export declare function splitProtocolPrefix(text: string): ProtocolPrefix | null;
