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
export const BREADCRUMB_COMPACT_QUERY = '(max-width: 1024px)';
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
const NOTHING = {
    hidden: [],
    compactFirst: false,
    leafCut: false
};
/** The widths a trail needs, rounded up as the plan rounds them. */
export function breadcrumbNeed(measure) {
    const count = measure.crumbs.length;
    if (count === 0)
        return { whole: 0, page: 0 };
    const crumbs = measure.crumbs.map((width) => Math.ceil(width));
    const whole = crumbs.reduce((sum, width) => sum + width, 0);
    if (count === 1)
        return { whole, page: whole };
    const first = measure.firstCompact === null ? crumbs[0] : Math.ceil(measure.firstCompact);
    const folded = count > 2 ? Math.ceil(measure.more) : 0;
    // Folding can widen a trail (a crumb narrower than the … button): the
    // page then needs no more than the whole trail.
    return { whole, page: Math.min(whole, first + folded + crumbs[count - 1]) };
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
    const last = count - 1;
    const leaf = crumbs[last];
    const leafMin = Math.ceil(breadcrumbLeafMin(measure.crumbs[last]));
    /** The page can give way at all: it is wider than its minimum. */
    const leafGives = leaf > leafMin;
    /** Before the current page there is `before`: the page does not fit whole. */
    const overflows = (before) => before + leaf > available;
    if (count === 1) {
        if (!overflows(0))
            return NOTHING;
        return { ...NOTHING, leafCut: leafGives };
    }
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
            return { ...NOTHING, hidden: folded() };
        if (step >= order.length)
            break;
        hidden.add(order[step]);
    }
    // 2. The first crumb shows as its icon alone.
    const compactFirst = measure.firstCompact !== null;
    const rest = before(compactFirst ? Math.ceil(measure.firstCompact) : crumbs[0]);
    if (!overflows(rest))
        return { ...NOTHING, hidden: folded(), compactFirst };
    // 3. The first crumb folds too: the button alone stands before the page,
    // when that narrows the trail.
    const lead = Math.ceil(measure.moreLead);
    const foldFirst = lead < rest;
    const head = foldFirst ? lead : rest;
    const shape = foldFirst
        ? { hidden: [0, ...folded()], compactFirst: false }
        : { hidden: folded(), compactFirst };
    if (foldFirst && !overflows(head))
        return { ...NOTHING, ...shape };
    // 4. The current page ellipsizes, down to its minimum.
    return { ...shape, leafCut: leafGives };
}
/**
 * A level's words, each a run that never breaks inside itself, so a name
 * read in full (the path's rows) wraps only between its words: an
 * identifier (CC-0003, a version, a date) stays whole. A separator standing
 * alone (" · ", " | ", " – ") joins the word before it with a no-break
 * space, so no line starts with it.
 */
export function breadcrumbWords(label) {
    const words = [];
    for (const token of label.trim().split(/\s+/)) {
        if (!token)
            continue;
        const previous = words.length - 1;
        if (previous >= 0 && /^[·•|–—/:]+$/.test(token))
            words[previous] += ` ${token}`;
        else
            words.push(token);
    }
    return words;
}
