import { type Component, type Snippet } from 'svelte';
import type { BreadcrumbCrumb } from '../utils/url-breadcrumb';
type $$ComponentProps = {
    /** The trail, first crumb first; the last is the current page. */
    items?: BreadcrumbCrumb[];
    /** Beside the current page, never cut (a status chip). */
    trailing?: Snippet;
    /** The navigation landmark's name. */
    label?: string;
    /** The … button's name and tooltip. */
    moreLabel?: string;
    className?: string;
};
/**
 * A breadcrumb trail on one line that never wraps and never clips a crumb.
 *
 * Every crumb shows in full while the trail fits. When it does not, the trail
 * gives way in this order, each step only when the one before is not enough:
 * 1. the crumbs between the first and the current page fold, from the inside
 *    out, into one … button;
 * 2. the first crumb shows as its icon alone;
 * 3. the current page ellipsizes, with its full name in a tooltip, down to
 *    its readable minimum: its own width up to `BREADCRUMB_LEAF_MIN_PX`
 *    (64px, four or five characters), never below it;
 * 4. the first crumb folds into the … button too, which then stands first:
 *    the trail reads "… › Pack…".
 * The current page always stays. `trailing` (a status chip) rides beside it
 * and never gives way. Past the narrowest the trail can go, the page holds
 * its minimum and the trail's box clips the end.
 *
 * The … button opens a small menu, not a dialog, listing in order every level
 * the trail does not name: the first crumb when it shows as its icon or is
 * folded, the folded crumbs, the current page when it is cut. A level with an
 * `href` is a link; one without is words. Keyboard: the WAI-ARIA menu button
 * pattern. Enter, Space or ArrowDown opens on the first link, ArrowUp on the
 * last; the arrows wrap, Home and End jump, Escape closes and returns the
 * focus to the button, Tab closes and moves on. A press outside, the focus
 * leaving and a new trail close it.
 *
 * The focus follows its level when the trail re-plans. A focused menu row
 * whose level comes back to the trail (the trail unfolding closes the menu)
 * hands the focus to that level's crumb: its link, or the current page when
 * it has none, and the menu closes behind it. A focused crumb that folds
 * hands it to the … button, and the button keeps it when it moves.
 *
 * Icons. The first crumb's `icon` stands in front of its words; on every
 * later crumb `icon` is the separator before it (a chevron when it has none),
 * and the … button takes the separator of the first crumb it folds, none when
 * it folds the first crumb itself.
 *
 * Measurement. A hidden copy of the trail is measured once per trail, and
 * again when its size changes (a web font arriving). A ResizeObserver on the
 * trail's box re-plans on every resize (a sidebar or a dock opening) from
 * those widths alone, so a resize reads no layout. The root grows into its
 * row (`flex: 1 1 0%`), so its width never depends on what it shows.
 *
 * Styling: the crumbs keep the token classes (`.breadcrumb-title`,
 * `.breadcrumb-section-icon`, `.breadcrumb-chevron`, `.breadcrumb-label`);
 * the layout and the menu are scoped CSS over the --gawdux-* tokens.
 */
declare const Breadcrumbs: Component<$$ComponentProps, {}, "">;
type Breadcrumbs = ReturnType<typeof Breadcrumbs>;
export default Breadcrumbs;
