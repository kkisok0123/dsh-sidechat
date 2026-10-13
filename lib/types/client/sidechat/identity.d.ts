/**
 * 首条用户消息 → topic。折叠全部空白（含换行）为单空格，截 20 码点，
 * 超长加省略号；清洗后为空返回 undefined（调用方回退编号标题）。
 * 快照前缀（Delivery_04）在 composer 层就不进 body，这里无需剥离。
 * 划选提问的种子草稿是「> 引用行 + note 行」（buildSideChatQuote）：
 * 引用行剥除（用户自己的话才是主题），机械占位行（noNote）丢弃；
 * 剥完为空（未补充直接发送）时退回引用内容——引用即主题。
 */
export declare function topicOf(text: string): string | undefined;
/** 标题计算的最小入参：编号 + 可选 topic（两种 meta 形状都满足）。 */
export interface SideChatIdentity {
    readonly number: number;
    readonly topic?: string;
}
/**
 * 侧边聊天标题：topic 优先（「侧边 · {topic}」），缺席回退编号
 * （「侧边」/「侧边 N」——单实例期恒前者）。
 */
export declare function sideChatTitleOf(meta: SideChatIdentity | undefined): string;
/**
 * 关闭时刻的相对时间（重开行 detail）：刚刚 / N 分钟前 / N 小时前 /
 * 昨天 / M月d日（跨年带年）。小时档只用于当天（日历日）；跨过午夜即落
 * 「昨天」——日历语义比「15 小时前」更好认。手写五档，不引依赖。
 */
export declare function formatClosedAt(closedAt: number, now?: number): string;
