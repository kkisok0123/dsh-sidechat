/**
 * Badge anchoring (Workitem 02): resolve a live DOM Range for an annotation.
 *
 * The range captured at creation time dies when React re-renders the message
 * (session switch, streaming rebuilds, fork/delete). We therefore re-anchor
 * on demand: find the message element by `data-chat-anchor-key`, locate the
 * Nth occurrence of the anchor text in its text nodes, and rebuild the range.
 * Anchor loss is acceptable (页面级临时语义) — the badge simply skips a
 * render; nothing here may throw into the page.
 */
import type { Annotation } from '../annotations/model.ts';
/** The badge anchor point: right edge of the selection rects, first-line height. */
export interface BadgeAnchor {
    /** max(rect.right) across the selection's client rects. */
    readonly right: number;
    /** Vertical center of the FIRST line's rect. */
    readonly centerY: number;
}
/**
 * Resolve a live range for an annotation: the cached range while its nodes
 * are still connected, otherwise a re-anchored one (cached on success).
 * Returns null when the anchor is gone — callers skip rendering, never throw.
 */
export interface CachedRange {
    range: Range;
    view: HTMLElement;
}
export declare function resolveRange(annotation: Annotation, cache: Map<number, CachedRange>, currentSessionId?: string): Range | null;
/**
 * The badge anchor point of a range: 选区矩形右缘 (max right edge across
 * client rects — the message column's right edge for full-line selections,
 * the selection's text end for inline ones) at 选区首行高度 (first rect's
 * vertical center). Null when the range lays out to nothing.
 */
export declare function badgeAnchorOf(range: Range): BadgeAnchor | null;
/**
 * 角标的 gutter 落点（Delivery_02 W03）：角标统一钉在**消息列内容右缘**、
 * 锚点首行的垂直中心——行内划选时旧策略（选区末端+6px）会压住后续文字
 * （B3-P2③「分❶治」），右缘 gutter 永不遮挡正文，多角标自然纵向排开
 * （Google Docs 页边评论同款心智）。找不到宿主消息容器时回退旧策略。
 */
export declare function gutterAnchorOf(range: Range, currentSessionId?: string): BadgeAnchor | null;
/** Client rects of a range for the active-highlight overlay (empty on failure). */
export declare function highlightRectsOf(range: Range): readonly {
    left: number;
    top: number;
    width: number;
    height: number;
}[];
/** 角标碰撞半径（px）：同点位的角标必须错开才可点击。 */
export declare const BADGE_COLLISION_RADIUS = 18;
/** 碰撞时向下错开的步长（px，大于角标直径）。 */
export declare const BADGE_SPREAD_STEP = 24;
/**
 * 角标落点错开：与已放置角标（|Δx|、|Δy| 均小于碰撞半径）冲突时按
 * BADGE_SPREAD_STEP 逐级下移——同一选区/相邻行的多个注释角标不再叠罗汉
 * （叠放时上层角标拦截下层角标的点击）。
 */
export declare function spreadBadgePoint(point: {
    x: number;
    y: number;
}, placed: readonly {
    x: number;
    y: number;
}[]): {
    x: number;
    y: number;
};
