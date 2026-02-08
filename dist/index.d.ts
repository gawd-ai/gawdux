export { default as AppSidebar } from './components/AppSidebar.svelte';
export { default as SidebarFlyout } from './components/SidebarFlyout.svelte';
export { default as SidebarDropdownGroup } from './components/SidebarDropdownGroup.svelte';
export type { SidebarMenuItem, SidebarMenuGroup, SidebarConfig, SidebarContext, AppSidebarProps, ModuleNav, DomainModule } from './types/sidebar.types';
export { sortByOrder, moduleToMenuItem, navToMenuItem, filterModulesByGroup, buildGroupItems, buildGroup, buildRootItems, buildRootGroups, buildAdminSubItems, createSidebarConfig, createSimpleConfig, menuItem, menuGroup, isBrowser, getStorageItem, setStorageItem, removeStorageItem } from './utils';
export type { ConfigBuilderOptions, GroupDefinition } from './utils';
