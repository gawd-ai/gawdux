import type { Snippet } from 'svelte';
import type { AppSidebarProps } from '../types/sidebar.types';
type $$ComponentProps = {
    config: AppSidebarProps['config'];
    /** The address the rail marks (`sidebarActiveUrl`). */
    activeUrl: string;
    initialOpen: boolean;
    /** Where the brand leads: the app's home. */
    homeHref: string;
    /** The home link's tooltip. */
    homeLabel?: string;
    /** The host's mark and name, inside the home link. */
    brand?: Snippet<[{
        collapsed: boolean;
        drawer: boolean;
    }]>;
    ontoggle?: AppSidebarProps['ontoggle'];
    /** The rail as the navigation drawer's content. */
    drawer?: boolean;
    /** The drawer's Close button. */
    onclose?: () => void;
    closeLabel?: string;
    expandLabel?: string;
    collapseLabel?: string;
};
/**
 * The side rail's chrome around AppSidebar: the home link with the host's
 * brand at its head, and the collapse button at its foot. As the navigation
 * drawer's content (`drawer`) the head is one 56px row, the brand and a
 * Close button (a 44px target), and there is no collapse button.
 *
 * The brand is the host's (`brand`: its mark and its name): the kit names no
 * product. It is told `collapsed`, so a name can fade as the rail narrows,
 * and `drawer`.
 */
declare const ShellSidebar: import("svelte").Component<$$ComponentProps, {}, "">;
type ShellSidebar = ReturnType<typeof ShellSidebar>;
export default ShellSidebar;
