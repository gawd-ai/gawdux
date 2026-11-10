import { type Component } from 'svelte';
import type { BreadcrumbCrumb } from '../utils/url-breadcrumb';
import { type BreadcrumbRoom } from './breadcrumb-overflow';
type $$ComponentProps = {
    /** The trail, first crumb first; the last is the current page. */
    items?: BreadcrumbCrumb[];
    /**
     * "adaptive": one line above `BREADCRUMB_STACK_QUERY`, two at or below
     * it (the path, then the current page on a line of its own); "line":
     * one line at every width.
     */
    layout?: 'adaptive' | 'line';
    /** The navigation landmark's name. */
    label?: string;
    /** The … button's name and tooltip. */
    moreLabel?: string;
    className?: string;
    /**
     * Bindable. The width the trail has and the widths it needs (`whole`,
     * `page`); null until it is measured, then the last report while a new
     * trail is measured.
     */
    room?: BreadcrumbRoom | null;
};
/**
 * A breadcrumb trail that never clips a crumb: one line above the shell's
 * compact width, two at or below it.
 *
 * One line. Every crumb shows in full while the trail fits. When it does not,
 * the trail gives way in this order, each step only when the one before is
 * not enough, so the current page keeps its title readable while anything
 * else can give way:
 * 1. the crumbs between the first and the current page fold, from the
 *    inside out, into one … button;
 * 2. the first crumb shows as its icon alone;
 * 3. the first crumb folds into the … button too, which then stands first:
 *    the trail reads "… › Package";
 * 4. the current page ellipsizes, with its full name in a tooltip, down to
 *    its readable minimum: its own width up to `BREADCRUMB_LEAF_MIN_PX`
 *    (64px, four or five characters), never below it.
 * The current page always stays. Past the narrowest the trail can go, the
 * page holds its minimum and the trail's box clips the end. The trail
 * carries no status: the page's own header wears it.
 *
 * Two lines (`layout` "adaptive", the default, at or below
 * `BREADCRUMB_STACK_QUERY`, 1024px). The current page reads on a line of its
 * own, whole: it wraps between its words and never inside one, so an
 * identifier (CC-0003, a version) never breaks, and a separator (" · ")
 * stays with the word before it. The path above it is a smaller muted line,
 * which gives way as one line does, its last crumb (the page's parent)
 * standing for the page: the crumbs between fold into the … button, then the
 * first shows as its icon, then folds, then the parent ellipsizes. Every
 * crumb stays reachable, in the path or in the menu. `layout` "line" keeps
 * one line at every width.
 *
 * The … button opens a small menu, not a dialog, listing in order every level
 * the trail does not name: the first crumb when it shows as its icon or is
 * folded, the folded crumbs, the crumb that is cut. A level with an `href` is
 * a link; one without is words. Keyboard: the WAI-ARIA menu button pattern.
 * Enter, Space or ArrowDown opens on the first link, ArrowUp on the last; the
 * arrows wrap, Home and End jump, Escape closes and returns the focus to the
 * button, Tab closes and moves on. A press outside, the focus leaving and a
 * new trail close it. An Escape from anywhere closes a menu the pointer
 * opened and is taken (`preventDefault`), so a page handler reading
 * `defaultPrevented` leaves it alone.
 *
 * The focus follows its level when the trail re-plans. A focused menu row
 * whose level comes back to the trail (the trail unfolding closes the menu)
 * hands the focus to that level's crumb: its link, or the current page when
 * it has none, and the menu closes behind it. A focused crumb that folds
 * hands it to the … button, and the button keeps it when it moves, the
 * trail narrowing or widening, its menu open or closed as it was; only the
 * trail unfolding whole hands it on, to the crumb of the first level it
 * stood for.
 *
 * Icons. The first crumb's `icon` stands in front of its words; on every
 * later crumb `icon` is the separator before it (a chevron when it has none),
 * and the … button takes the separator of the first crumb it folds, none when
 * it folds the first crumb itself. On two lines the current page has no
 * separator: its line is its own.
 *
 * Measurement. A hidden copy of the trail is measured once per trail, and
 * again when its size changes (a web font arriving, the trail crossing the
 * compact width, where the path is set smaller). A ResizeObserver on the
 * trail's box re-plans on every resize (a sidebar or a dock opening) from
 * those widths alone, so a resize reads no layout. The root grows into its
 * row (`flex: 1 1 0%`), so its width never depends on what it shows.
 *
 * The room it needs. `room` (bindable) reports, once measured, the width the
 * trail has and the widths it needs: `whole`, every crumb in full, and
 * `page`, the current page whole with the crumbs on the way folded. The
 * needs come from the measures alone, never from the room, so a host can
 * give the trail room (`createRoomYield`: an account menu showing its avatar
 * alone) and decide again without the decision undoing itself.
 *
 * Styling: the crumbs keep the token classes (`.breadcrumb-title`,
 * `.breadcrumb-section-icon`, `.breadcrumb-chevron`, `.breadcrumb-label`);
 * the layout and the menu are scoped CSS over the --gawdux-* tokens.
 */
declare const Breadcrumbs: Component<$$ComponentProps, {}, "room">;
type Breadcrumbs = ReturnType<typeof Breadcrumbs>;
export default Breadcrumbs;
