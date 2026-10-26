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
 *   3. the current page ellipsizes, the very last resort.
 * The trailing content beside the current page never gives way.
 */
const NOTHING = { hidden: [], compactFirst: false, leafCut: false };
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
    if (count === 1)
        return { ...NOTHING, leafCut: crumbs[0] + trailing > available };
    const hidden = new Set();
    const needed = (compactFirst) => {
        let sum = compactFirst ? Math.ceil(measure.firstCompact ?? 0) : crumbs[0];
        for (let i = 1; i < last; i++)
            if (!hidden.has(i))
                sum += crumbs[i];
        if (hidden.size > 0)
            sum += Math.ceil(measure.more);
        return sum + crumbs[last] + trailing;
    };
    const folded = () => [...hidden].sort((a, b) => a - b);
    const order = breadcrumbCollapseOrder(count);
    for (let step = 0;; step++) {
        if (needed(false) <= available)
            return { hidden: folded(), compactFirst: false, leafCut: false };
        if (step >= order.length)
            break;
        hidden.add(order[step]);
    }
    if (measure.firstCompact === null)
        return { hidden: folded(), compactFirst: false, leafCut: true };
    return { hidden: folded(), compactFirst: true, leafCut: needed(true) > available };
}
