import { type Component, type Snippet } from 'svelte';
type $$ComponentProps = {
    /** The item's name; the trail's row names it at the compact width. */
    title: string;
    /** One line under the title, its description; null draws none. */
    subtitle?: string | null | undefined;
    /** A subtitle of the host's own markup, in place of `subtitle`. */
    subtitleContent?: Snippet | undefined;
    /** The item's icon, from the house set, drawn at the house size. */
    icon?: Component | null | undefined;
    /** Before the icon: a folder tree's toggle, a 44px target at the compact width. */
    leading?: Snippet | undefined;
    /** The item's state: the chip and its lock (HeaderStatus). */
    status?: Snippet | undefined;
    /** At the row's end: the item's icon buttons (the channel, Close). */
    actions?: Snippet | undefined;
    className?: string;
};
/**
 * The header of a pane that shows one item (a document, a record, a run, a
 * form): one row that reads, at every width, in one order: the item's icon,
 * its name, its state, then the controls.
 *
 * Above the compact width (1024px) the row is 60px: the leading control (a
 * folder tree's toggle, where the page has one), the item's icon, the title
 * with its state 8px after it (the chip and the lock as one group, which
 * never truncates: the title truncates first), the subtitle under the title,
 * and the controls (the channel, Close) at the row's end.
 *
 * At or below the compact width the trail's row names the item, so the row
 * holds no title and no subtitle: at its start the leading control and the
 * item's icon, each on a 44px column from the pane's edge, the columns of a
 * tab strip under it that shows its icons alone, so the icons line up; the
 * state 8px after the icon's glyph; at its end the controls, 44px targets
 * 4px apart and 4px from the pane's edge, the columns of the tools at the
 * end of a tab strip's row. Nothing else is in the row. A header with
 * nothing to hold there (no leading control, no state, no control) is not
 * drawn, and the pane opens on its content.
 *
 * The state shows once. A pane header claims the page's status
 * (PAGE_STATUS_CONTEXT), so a tab strip under it draws none; it draws the
 * `status` it is given, else the page's.
 */
declare const PaneHeader: Component<$$ComponentProps, {}, "">;
type PaneHeader = ReturnType<typeof PaneHeader>;
export default PaneHeader;
