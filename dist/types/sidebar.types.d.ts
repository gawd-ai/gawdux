import type { Component, Snippet } from 'svelte';
/**
 * A single menu item in the sidebar
 */
export interface SidebarMenuItem {
    /** Unique identifier for the item */
    id: string;
    /** Display label */
    label: string;
    /** Navigation URL */
    href: string;
    /** Optional icon component */
    icon?: Component;
    /** Sort order (lower = higher in list) */
    order?: number;
    /** Optional badge text (e.g., "New", "3") */
    badge?: string;
    /** Badge color variant */
    badgeColor?: 'blue' | 'red' | 'green' | 'yellow' | 'gray';
    /** Whether the item is disabled */
    disabled?: boolean;
}
/**
 * A group of menu items displayed as a dropdown
 */
export interface SidebarMenuGroup {
    /** Unique identifier for the group */
    id: string;
    /** Display label for the group header */
    label: string;
    /** Icon component for the group */
    icon: Component;
    /** Menu items within this group */
    items: SidebarMenuItem[];
    /** Sort order (lower = higher in list) */
    order?: number;
    /** Whether the group starts expanded (default: false) */
    defaultOpen?: boolean;
}
/**
 * Context passed to header/footer snippets
 */
export interface SidebarContext {
    collapsed: boolean;
    collapsedWidth: number;
    expandedWidth: number;
}
/**
 * Configuration options for the AppSidebar component
 */
export interface SidebarConfig {
    /** Groups of menu items (dropdowns with flyouts when collapsed) */
    groups?: SidebarMenuGroup[];
    /** Top-level items (no dropdown, direct links) */
    rootItems?: SidebarMenuItem[];
    /** localStorage key for persisting collapsed state */
    storageKey?: string;
    /** Initial collapsed state (default: false = expanded) */
    defaultCollapsed?: boolean;
    /** Flyout animation duration in ms (default: 200) */
    flyoutDuration?: number;
    /** Show expand/collapse all button (default: true) */
    showToggleAll?: boolean;
    /** Expanded sidebar width in pixels (default: 256 = w-64) */
    expandedWidth?: number;
    /** Collapsed sidebar width in pixels (default: 72 = w-18) */
    collapsedWidth?: number;
    /** Custom icon for collapse button */
    collapseIcon?: Component;
    /** Custom icon for expand button */
    expandIcon?: Component;
    /** Custom icon for toggle all button */
    toggleAllIcon?: Component;
}
/**
 * Props for the AppSidebar component
 */
export interface AppSidebarProps {
    /** Sidebar configuration */
    config: SidebarConfig;
    /** Current active URL for highlighting */
    activeUrl?: string;
    /** Additional CSS classes */
    class?: string;
    /** Callback when sidebar is toggled */
    ontoggle?: (collapsed: boolean) => void;
    /** Callback when a menu item is clicked */
    onnavigate?: (href: string) => void;
    /** Custom content rendered above nav groups */
    header?: Snippet<[SidebarContext]>;
    /** Custom content rendered below nav groups */
    footer?: Snippet<[SidebarContext]>;
    /** Custom toggle bar replacing the default collapse/expand button. Rendered pinned to sidebar bottom. */
    toggleBar?: Snippet<[{
        collapsed: boolean;
        toggle: () => void;
    }]>;
}
/**
 * Module navigation definition (for integration with module registries)
 */
export interface ModuleNav {
    label: string;
    href: string;
    icon?: Component;
    order?: number;
    group?: string;
}
/**
 * Domain module definition (for integration with module registries)
 */
export interface DomainModule {
    id: string;
    nav?: ModuleNav;
    subModules?: Record<string, ModuleNav>;
}
