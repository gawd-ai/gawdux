import type { Snippet } from 'svelte';
import type { BreadcrumbCrumb } from '../utils/url-breadcrumb';
type $$ComponentProps = {
    /** The trail, first level first; the last is the current page. */
    trail: BreadcrumbCrumb[];
    /** The menu button's press: the host opens its navigation drawer. */
    onOpenNavigation: () => void;
    /**
     * The account menu above the compact width. `compact` is true while
     * the trail needs its room: the menu shows its avatar alone.
     */
    account?: Snippet<[{
        compact: boolean;
    }]>;
    /**
     * A switcher before the account (a tenant's, a site's). It yields its
     * room after the account has.
     */
    switcher?: Snippet<[{
        compact: boolean;
    }]>;
    /** The notices, after the account. */
    notices?: Snippet;
    /**
     * The theme toggle at the header's end, for a shell with no right
     * column to hold it: the cookie the host's server reads to draw the
     * first paint in the theme. Left out, no toggle is drawn.
     */
    themeCookieName?: string;
    openNavigationLabel?: string;
    themeLabel?: string;
    /** A control's width while it yields, until it is measured. */
    compactWidth?: number;
};
/**
 * An app shell's header: the menu button (at the compact width), the trail,
 * then above the compact width the host's controls at its end: a switcher,
 * the account, the notices and, when the shell has no right column to hold
 * it, the theme toggle.
 *
 * At or below the compact width (`SHELL_BAR_QUERY`, 1024px) the header is
 * one row 48px tall: the menu button, a 44px target tight to the screen's
 * edge with no padding or gap around it, and the current page's name beside
 * it, which opens its path (Breadcrumbs). The controls at its end are not
 * drawn there: they are at the right end of the phone shell's bar along the
 * bottom (ShellBarEnd), and the theme is a row of the account menu.
 *
 * Above it the trail is one line that grows into the room the controls
 * leave, and the controls yield their room to it (`createRoomYield`): when
 * the whole trail does not fit beside them at full size, the account shows
 * its avatar alone, and the switcher too when that is not enough. Each
 * control's snippet is told `compact` and renders itself so; its full width
 * is read from its probe (`data-room-full`), so a yield never undoes itself.
 *
 * The header draws no account and no switcher of its own: `account`,
 * `switcher` and `notices` are the host's, and a slot left empty draws
 * nothing. The strip is transparent over the shell's background, and every
 * control in it is flat.
 */
declare const ShellHeader: import("svelte").Component<$$ComponentProps, {}, "">;
type ShellHeader = ReturnType<typeof ShellHeader>;
export default ShellHeader;
