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
 * the crumbs between the first and the current page fold, from the inside
 * out, into one … button; the first crumb shows as its icon alone; the
 * current page ellipsizes, the very last resort, with its full name in a
 * tooltip. The first crumb and the current page always stay. `trailing` (a
 * status chip) rides beside the current page and never gives way.
 *
 * The … button opens a small menu, not a dialog, listing in order every level
 * the trail does not name: the first crumb when it shows as its icon, the
 * folded crumbs, the current page when it is cut. A level with an `href` is a
 * link; one without is words. Keyboard: the WAI-ARIA menu button pattern.
 * Enter, Space or ArrowDown opens on the first link, ArrowUp on the last; the
 * arrows wrap, Home and End jump, Escape closes and returns the focus to the
 * button, Tab closes and moves on. A press outside, the focus leaving and a
 * new trail close it.
 *
 * Icons. The first crumb's `icon` stands in front of its words; on every
 * later crumb `icon` is the separator before it (a chevron when it has none),
 * and the … button takes the separator of the first crumb it folds.
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
