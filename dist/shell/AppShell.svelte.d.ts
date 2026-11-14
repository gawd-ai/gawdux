import { type Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
type $$ComponentProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class'> & {
    /** The side rail above the compact width (ShellSidebar). */
    sidebar?: Snippet;
    /** The navigation drawer (ShellNavigationDrawer), drawn while open. */
    drawer?: Snippet<[{
        close: () => void;
    }]>;
    /** The main column (ShellMainColumn). */
    children?: Snippet;
    /**
     * The right column (ShellRightColumn), when it holds something for
     * this reader on this page. Its rail is the phone shell's bar.
     */
    rightColumn?: Snippet | null;
    /**
     * The host's controls at the bar's end (ShellBarEnd). Drawn in the
     * shell's own bar when there is no right column; a right column's
     * rail carries them itself.
     */
    barEnd?: Snippet;
    /** Bindable: the navigation drawer is open. */
    navigationOpen?: boolean;
    /** Bindable: the screen is at or below the compact width. */
    compact?: boolean;
    class?: string;
};
/**
 * The app shell's frame: the side rail, the main column and the right
 * column side by side, filling the screen and never scrolling as a whole.
 *
 * At or below the compact width (`SHELL_BAR_QUERY`, 1024px) it is the phone
 * shell. The side rail is not drawn; the header's menu button opens it as
 * the navigation drawer (`drawer`, drawn while `navigationOpen`). The phone
 * shell's one bar runs along the bottom: the right column's rail when the
 * column holds something (`rightColumn`, which then carries the host's
 * controls at the bar's end itself), the shell's own bar otherwise
 * (`barEnd`: ShellBarEnd), so the account is at the bar's right end with
 * chat on or off. The shell leaves the bar's room under the page, and the
 * safe-area insets at its sides.
 *
 * `compact` (bindable) is the shell's one reading of the compact width in
 * script. The drawer is drawn at or below it only: one left open closes
 * when the screen grows past it, and `navigationOpen` set on a wider screen
 * is put back, so nothing is inert behind a drawer nobody asked for there.
 *
 * Above the compact width the rail ends level with the page's panel
 * (PageFrame's): it stands the frame's gutter off the screen's bottom, its
 * inner corner rounded.
 *
 * A printout is the page: the shell grows to its content, and the rail,
 * the shell's own bar with its room, and an open drawer are left out.
 *
 * The parts are the host's: ShellSidebar, ShellNavigationDrawer,
 * ShellMainColumn with ShellHeader, ShellRightColumn. A part left out is
 * not drawn.
 */
declare const AppShell: import("svelte").Component<$$ComponentProps, {}, "compact" | "navigationOpen">;
type AppShell = ReturnType<typeof AppShell>;
export default AppShell;
