// gawdux - UI Component Library

// Components
export { default as AppSidebar } from './components/AppSidebar.svelte';
export { default as SidebarFlyout } from './components/SidebarFlyout.svelte';
export { default as SidebarDropdownGroup } from './components/SidebarDropdownGroup.svelte';

// Types
export type {
	SidebarMenuItem,
	SidebarMenuGroup,
	SidebarConfig,
	SidebarContext,
	AppSidebarProps,
	ModuleNav,
	DomainModule
} from './types/sidebar.types';

// Utilities
export {
	// Config builders
	sortByOrder,
	moduleToMenuItem,
	navToMenuItem,
	filterModulesByGroup,
	buildGroupItems,
	buildGroup,
	buildRootItems,
	buildRootGroups,
	buildAdminSubItems,
	createSidebarConfig,
	createSimpleConfig,
	menuItem,
	menuGroup,
	// Browser utilities
	isBrowser,
	getStorageItem,
	setStorageItem,
	removeStorageItem
} from './utils';

export type { ConfigBuilderOptions, GroupDefinition } from './utils';
