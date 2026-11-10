/**
 * How a breadcrumb trail fits one line: which crumbs fold into the overflow
 * button, whether the first crumb shows as its icon alone, and whether the
 * current page ends in an ellipsis. Pure arithmetic over widths a host
 * measured once, so a resize re-plans without reading the layout again.
 *
 * The trail gives way in this order, each step only when the one before it
 * is not enough, so the current page keeps its title readable as long as
 * anything else can give way:
 *   1. the crumbs between the first and the current page fold, from the
 *      inside out, into one overflow button;
 *   2. the first crumb shows as its icon alone (when it has one);
 *   3. the first crumb folds into the button too, which then stands first
 *      with no separator before it (when that narrows the trail);
 *   4. the current page ellipsizes, down to its readable minimum
 *      (`breadcrumbLeafMin`), never below it.
 * Past the narrowest the trail can go, the page holds its minimum and the
 * trail's box clips the end. The trail carries no status: the page's own
 * header wears it.
 *
 * At the shell's compact width an adaptive trail is one row naming the
 * current page alone, a button that opens the whole path (Breadcrumbs,
 * `layout` "adaptive"); nothing is planned there.
 */
/** The width at or below which an adaptive trail names the current page alone, opening its path. */
export declare const BREADCRUMB_COMPACT_QUERY = "(max-width: 1024px)";
/** The current page's readable minimum, its separator in: four or five characters and the ellipsis. */
export declare const BREADCRUMB_LEAF_MIN_PX = 64;
/**
 * The narrowest the current page goes: its natural width (its separator or
 * icon included) up to `BREADCRUMB_LEAF_MIN_PX`. A page no wider than that
 * is never cut.
 */
export declare function breadcrumbLeafMin(natural: number): number;
export type BreadcrumbOverflowMeasure = {
    /** The width the trail has: its box's content width. */
    available: number;
    /** Each crumb at its natural width, its separator or icon included, in order. */
    crumbs: readonly number[];
    /** The overflow button with its separator. */
    more: number;
    /** The overflow button alone, standing first once the first crumb folds too. */
    moreLead: number;
    /** The first crumb as its icon alone; null when it has no icon to stand for it. */
    firstCompact: number | null;
};
export type BreadcrumbOverflowPlan = {
    /**
     * The crumbs folded into the overflow button, ascending; always one
     * contiguous run. The first crumb is among them only at the last step.
     */
    hidden: number[];
    /** The first crumb shows as its icon alone (never while it is folded). */
    compactFirst: boolean;
    /** The current page does not fit whole and ends in an ellipsis. */
    leafCut: boolean;
};
/**
 * The widths a trail needs, read from its measures alone, never from the
 * room it has: a host can give it room (a control beside it shrinking) and
 * decide again without the decision undoing itself.
 */
export type BreadcrumbNeed = {
    /** Every crumb in full. */
    whole: number;
    /**
     * The current page whole: the crumbs on the way folded and the first as
     * its icon. From this width up the plan never cuts the page.
     */
    page: number;
};
/** What a trail reports to its host: the room it has and the room it needs. */
export type BreadcrumbRoom = BreadcrumbNeed & {
    /** The width the trail has now: its box's content width. */
    available: number;
};
/** The widths a trail needs, rounded up as the plan rounds them. */
export declare function breadcrumbNeed(measure: Omit<BreadcrumbOverflowMeasure, 'available'>): BreadcrumbNeed;
/**
 * The order the crumbs between the first and the last fold in: the one
 * nearest the middle of the trail first, then its neighbours outward, the
 * root side before the page side on a tie. Every prefix of the order is one
 * contiguous run, and the current page's parent is the last to fold.
 */
export declare function breadcrumbCollapseOrder(count: number): number[];
export declare function planBreadcrumbOverflow(measure: BreadcrumbOverflowMeasure): BreadcrumbOverflowPlan;
/**
 * A level's words, each a run that never breaks inside itself, so a name
 * read in full (the path's rows) wraps only between its words: an
 * identifier (CC-0003, a version, a date) stays whole. A separator standing
 * alone (" · ", " | ", " – ") joins the word before it with a no-break
 * space, so no line starts with it.
 */
export declare function breadcrumbWords(label: string): string[];
