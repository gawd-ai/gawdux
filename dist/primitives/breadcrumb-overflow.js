/**
 * How a breadcrumb trail fits one line: which crumbs fold into the overflow
 * button, whether the first crumb shows as its icon alone, and whether the
 * current page ends in an ellipsis. Pure arithmetic over widths a host
 * measured once, so a resize re-plans without reading the layout again.
 *
 * The trail gives way in this order, each step only when the one before it
 * is not enough:
 *   1. the crumbs between the first and the current page fold, from the
 *      inside out, into one overflow button;
 *   2. the first crumb shows as its icon alone (when it has one);
 *   3. the current page ellipsizes, down to its readable minimum
 *      (`breadcrumbLeafMin`), never below it;
 *   4. the first crumb folds into the button too, which then stands first
 *      with no separator before it (when that narrows the trail).
 * The trailing content beside the current page never gives way. Past the
 * narrowest the trail can go, the page holds its minimum and the trail's box
 * clips the end.
 */
/** The current page's readable minimum, its separator in: four or five characters and the ellipsis. */
export const BREADCRUMB_LEAF_MIN_PX = 64;
/**
 * The narrowest the current page goes: its natural width (its separator or
 * icon included) up to `BREADCRUMB_LEAF_MIN_PX`. A page no wider than that
 * is never cut.
 */
export function breadcrumbLeafMin(natural) {
    return Math.min(natural, BREADCRUMB_LEAF_MIN_PX);
}
const NOTHING = { hidden: [], compactFirst: false, leafCut: false };
/** The widths a trail needs, rounded up as the plan rounds them. */
export function breadcrumbNeed(measure) {
    const count = measure.crumbs.length;
    if (count === 0)
        return { whole: 0, page: 0 };
    const crumbs = measure.crumbs.map((width) => Math.ceil(width));
    const trailing = Math.ceil(measure.trailing);
    const whole = crumbs.reduce((sum, width) => sum + width, 0) + trailing;
    if (count === 1)
        return { whole, page: whole };
    const first = measure.firstCompact === null ? crumbs[0] : Math.ceil(measure.firstCompact);
    const folded = count > 2 ? Math.ceil(measure.more) : 0;
    // Folding can widen a trail (a crumb narrower than the … button): the
    // page then needs no more than the whole trail.
    return { whole, page: Math.min(whole, first + folded + crumbs[count - 1] + trailing) };
}
/**
 * The order the crumbs between the first and the last fold in: the one
 * nearest the middle of the trail first, then its neighbours outward, the
 * root side before the page side on a tie. Every prefix of the order is one
 * contiguous run, and the current page's parent is the last to fold.
 */
export function breadcrumbCollapseOrder(count) {
    if (count < 3)
        return [];
    const centre = (count - 1) / 2;
    const middles = Array.from({ length: count - 2 }, (_, i) => i + 1);
    return middles.sort((a, b) => Math.abs(a - centre) - Math.abs(b - centre) || a - b);
}
export function planBreadcrumbOverflow(measure) {
    const count = measure.crumbs.length;
    if (count === 0)
        return NOTHING;
    // Widths round up and the room rounds down: a plan that fits never leaves
    // a sub-pixel overflow for the ellipsis to show.
    const available = Math.floor(measure.available);
    const crumbs = measure.crumbs.map((width) => Math.ceil(width));
    const trailing = Math.ceil(measure.trailing);
    const last = count - 1;
    const leaf = crumbs[last];
    const leafMin = Math.ceil(breadcrumbLeafMin(measure.crumbs[last]));
    /** The page can give way at all: it is wider than its minimum. */
    const leafGives = leaf > leafMin;
    /** Before the current page there is `before`: the page does not fit whole. */
    const overflows = (before) => before + leaf + trailing > available;
    if (count === 1)
        return { ...NOTHING, leafCut: leafGives && overflows(0) };
    const hidden = new Set();
    /** Everything before the current page, the first crumb `first` wide. */
    const before = (first) => {
        let sum = first;
        for (let i = 1; i < last; i++)
            if (!hidden.has(i))
                sum += crumbs[i];
        if (hidden.size > 0)
            sum += Math.ceil(measure.more);
        return sum;
    };
    const folded = () => [...hidden].sort((a, b) => a - b);
    // 1. The crumbs on the way fold, from the inside out.
    const order = breadcrumbCollapseOrder(count);
    for (let step = 0;; step++) {
        if (!overflows(before(crumbs[0])))
            return { hidden: folded(), compactFirst: false, leafCut: false };
        if (step >= order.length)
            break;
        hidden.add(order[step]);
    }
    // 2. The first crumb shows as its icon alone.
    const compactFirst = measure.firstCompact !== null;
    const rest = before(compactFirst ? Math.ceil(measure.firstCompact) : crumbs[0]);
    if (!overflows(rest))
        return { hidden: folded(), compactFirst, leafCut: false };
    // 3. The current page ellipsizes, down to its minimum.
    if (leafGives && rest + leafMin + trailing <= available) {
        return { hidden: folded(), compactFirst, leafCut: true };
    }
    // 4. The first crumb folds too: the button alone stands before the page.
    const lead = Math.ceil(measure.moreLead);
    if (lead < rest) {
        return { hidden: [0, ...folded()], compactFirst: false, leafCut: leafGives && overflows(lead) };
    }
    // Folding the first crumb would not narrow the trail: the page holds its minimum.
    return { hidden: folded(), compactFirst, leafCut: leafGives };
}
