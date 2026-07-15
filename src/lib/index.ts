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
	buildModuleSubItems,
	createSidebarConfig,
	createSimpleConfig,
	menuItem,
	menuGroup,
	// Browser utilities
	isBrowser,
	getStorageItem,
	setStorageItem,
	removeStorageItem,
	// Layout / chrome utilities (Phase K)
	createBreadcrumbBuilder,
	slideFadeIn,
	slideFadeOut,
	createActiveSubitemStylesheet,
	DEFAULT_PALETTE,
	resolveActiveItemHref,
	createCancellableScheduler,
	DEFAULT_SCHEDULE_DELAY_MS
} from './utils';

export type {
	ConfigBuilderOptions,
	GroupDefinition,
	BreadcrumbCrumb,
	BreadcrumbBuilder,
	BreadcrumbBuilderOptions,
	ActiveSubitemPalette,
	ActiveSubitemStylesheetOptions,
	ActiveSubitemStylesheetController,
	CancellableScheduler
} from './utils';
