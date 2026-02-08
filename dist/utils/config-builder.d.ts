import type { Component } from 'svelte';
import type { SidebarConfig, SidebarMenuGroup, SidebarMenuItem, DomainModule, ModuleNav } from '../types/sidebar.types';
/**
 * Options for building a sidebar config from modules
 */
export interface ConfigBuilderOptions {
    /** localStorage key for persisting collapsed state */
    storageKey?: string;
    /** Show expand/collapse all button */
    showToggleAll?: boolean;
    /** Default collapsed state */
    defaultCollapsed?: boolean;
    /** Flyout animation duration in ms */
    flyoutDuration?: number;
    /** Expanded width in pixels */
    expandedWidth?: number;
    /** Collapsed width in pixels */
    collapsedWidth?: number;
}
/**
 * Group definition for the config builder
 */
export interface GroupDefinition {
    /** Group identifier */
    id: string;
    /** Display label */
    label: string;
    /** Icon component */
    icon: Component;
    /** Navigation group name to match modules against */
    navGroup: string;
    /** Sort order */
    order?: number;
    /** Static items to always include */
    staticItems?: SidebarMenuItem[];
    /** Whether the group starts expanded */
    defaultOpen?: boolean;
}
/**
 * Sort items by order property
 */
export declare function sortByOrder<T extends {
    order?: number;
}>(items: T[]): T[];
/**
 * Convert a module to a sidebar menu item
 */
export declare function moduleToMenuItem(module: DomainModule): SidebarMenuItem | null;
/**
 * Convert a ModuleNav (submodule) to a sidebar menu item
 */
export declare function navToMenuItem(id: string, nav: ModuleNav): SidebarMenuItem | null;
/**
 * Filter modules by navigation group
 */
export declare function filterModulesByGroup(modules: DomainModule[], group: string): DomainModule[];
/**
 * Build menu items from modules filtered by group
 */
export declare function buildGroupItems(modules: DomainModule[], navGroup: string): SidebarMenuItem[];
/**
 * Build a sidebar menu group from modules
 */
export declare function buildGroup(definition: GroupDefinition, modules: DomainModule[], additionalItems?: SidebarMenuItem[]): SidebarMenuGroup | null;
/**
 * Build root items (modules with no submodules in the Root group)
 */
export declare function buildRootItems(modules: DomainModule[]): SidebarMenuItem[];
/**
 * Build groups from root modules that have submodules
 */
export declare function buildRootGroups(modules: DomainModule[], defaultIcon: Component): SidebarMenuGroup[];
/**
 * Build admin submodule items from a module's subModules
 */
export declare function buildAdminSubItems(modules: DomainModule[]): SidebarMenuItem[];
/**
 * Create a complete sidebar configuration from modules and group definitions
 */
export declare function createSidebarConfig(modules: DomainModule[], groupDefinitions: GroupDefinition[], options?: ConfigBuilderOptions, extraConfig?: {
    rootItems?: SidebarMenuItem[];
    rootGroups?: SidebarMenuGroup[];
    adminItems?: SidebarMenuItem[];
    isAdmin?: boolean;
}): SidebarConfig;
/**
 * Create a simple sidebar config without module registry integration
 */
export declare function createSimpleConfig(groups: SidebarMenuGroup[], options?: ConfigBuilderOptions, rootItems?: SidebarMenuItem[]): SidebarConfig;
/**
 * Helper to create a menu item
 */
export declare function menuItem(id: string, label: string, href: string, options?: Partial<Omit<SidebarMenuItem, 'id' | 'label' | 'href'>>): SidebarMenuItem;
/**
 * Helper to create a menu group
 */
export declare function menuGroup(id: string, label: string, icon: Component, items: SidebarMenuItem[], options?: Partial<Omit<SidebarMenuGroup, 'id' | 'label' | 'icon' | 'items'>>): SidebarMenuGroup;
