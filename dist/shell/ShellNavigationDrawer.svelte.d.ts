import { type Snippet } from 'svelte';
import type { AppSidebarProps } from '../types/sidebar.types';
type $$ComponentProps = {
    config: AppSidebarProps['config'];
    activeUrl: string;
    homeHref: string;
    homeLabel?: string;
    /** The host's mark and name (ShellSidebar's `brand`). */
    brand?: Snippet<[{
        collapsed: boolean;
        drawer: boolean;
    }]>;
    onclose: () => void;
    /** The dialog's name. */
    label?: string;
    closeLabel?: string;
};
/**
 * The navigation drawer of the phone shell: the side rail as a modal drawer
 * from the screen's left edge, at or below the compact width. The host
 * renders it while its navigation is open (AppShell's `drawer`), and the
 * header's menu button opens it.
 *
 * While it is open the focus stays inside it (Tab wraps), Escape and a press
 * on the backdrop close it, a press on a link of the rail closes it and lets
 * the navigation run, everything beside it is inert, and the page does not
 * scroll. Closing gives back the focus, the inert state and the scroll as
 * they were. All of it is `activateFocusScope`; the drawer adds none of its
 * own.
 *
 * The rail never stores its open state here: the drawer is always open at
 * its full width.
 */
declare const ShellNavigationDrawer: import("svelte").Component<$$ComponentProps, {}, "">;
type ShellNavigationDrawer = ReturnType<typeof ShellNavigationDrawer>;
export default ShellNavigationDrawer;
