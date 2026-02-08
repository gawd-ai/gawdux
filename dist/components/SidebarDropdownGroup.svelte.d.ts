import type { SidebarMenuGroup } from '../types/sidebar.types';
interface Props {
    group: SidebarMenuGroup;
    expanded: boolean;
    isOpen: boolean;
    flyoutActive: boolean;
    onMouseEnter?: (event: MouseEvent) => void;
    onMouseLeave?: () => void;
}
declare const SidebarDropdownGroup: import("svelte").Component<Props, {}, "isOpen">;
type SidebarDropdownGroup = ReturnType<typeof SidebarDropdownGroup>;
export default SidebarDropdownGroup;
