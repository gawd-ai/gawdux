import type { Snippet } from 'svelte';
import type { SidebarMenuItem } from '../types/sidebar.types';
interface Props {
    label?: string;
    items?: SidebarMenuItem[];
    children?: Snippet;
    top: number;
    left: number;
    headerHeight?: number;
    duration?: number;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    onItemClick?: (href: string) => void;
    class?: string;
}
declare const SidebarFlyout: import("svelte").Component<Props, {}, "">;
type SidebarFlyout = ReturnType<typeof SidebarFlyout>;
export default SidebarFlyout;
