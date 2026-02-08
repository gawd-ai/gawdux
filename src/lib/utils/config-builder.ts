import type { Component } from 'svelte';
import type {
	SidebarConfig,
	SidebarMenuGroup,
	SidebarMenuItem,
	DomainModule,
	ModuleNav
} from '../types/sidebar.types';

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
export function sortByOrder<T extends { order?: number }>(items: T[]): T[] {
	return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/**
 * Convert a module to a sidebar menu item
 */
export function moduleToMenuItem(module: DomainModule): SidebarMenuItem | null {
	if (!module.nav?.href || !module.nav?.label) return null;
	return {
		id: module.id,
		label: module.nav.label,
		href: module.nav.href,
		icon: module.nav.icon,
		order: module.nav.order
	};
}

/**
 * Convert a ModuleNav (submodule) to a sidebar menu item
 */
export function navToMenuItem(id: string, nav: ModuleNav): SidebarMenuItem | null {
	if (!nav.href || !nav.label) return null;
	return {
		id,
		label: nav.label,
		href: nav.href,
		icon: nav.icon,
		order: nav.order
	};
}

/**
 * Filter modules by navigation group
 */
export function filterModulesByGroup(modules: DomainModule[], group: string): DomainModule[] {
	return modules.filter((m) => m?.nav?.group === group);
}

/**
 * Build menu items from modules filtered by group
 */
export function buildGroupItems(modules: DomainModule[], navGroup: string): SidebarMenuItem[] {
	return sortByOrder(
		filterModulesByGroup(modules, navGroup)
			.map(moduleToMenuItem)
			.filter((item): item is SidebarMenuItem => item !== null)
	);
}

/**
 * Build a sidebar menu group from modules
 */
export function buildGroup(
	definition: GroupDefinition,
	modules: DomainModule[],
	additionalItems: SidebarMenuItem[] = []
): SidebarMenuGroup | null {
	const moduleItems = buildGroupItems(modules, definition.navGroup);
	const allItems = sortByOrder([
		...(definition.staticItems ?? []),
		...moduleItems,
		...additionalItems
	]);

	if (allItems.length === 0) return null;

	return {
		id: definition.id,
		label: definition.label,
		icon: definition.icon,
		items: allItems,
		order: definition.order,
		defaultOpen: definition.defaultOpen
	};
}

/**
 * Build root items (modules with no submodules in the Root group)
 */
export function buildRootItems(modules: DomainModule[]): SidebarMenuItem[] {
	return sortByOrder(
		filterModulesByGroup(modules, 'Root')
			.filter((mod) => !mod.subModules || Object.keys(mod.subModules).length === 0)
			.map(moduleToMenuItem)
			.filter((item): item is SidebarMenuItem => item !== null)
	);
}

/**
 * Build groups from root modules that have submodules
 */
export function buildRootGroups(
	modules: DomainModule[],
	defaultIcon: Component
): SidebarMenuGroup[] {
	return sortByOrder(
		filterModulesByGroup(modules, 'Root')
			.filter((mod) => mod.subModules && Object.keys(mod.subModules).length > 0)
			.map((mod) => ({
				id: mod.id,
				label: mod.nav?.label ?? mod.id,
				icon: mod.nav?.icon ?? defaultIcon,
				order: mod.nav?.order,
				items: sortByOrder(
					Object.entries(mod.subModules!)
						.map(([key, nav]) => navToMenuItem(key, nav))
						.filter((item): item is SidebarMenuItem => item !== null)
				)
			}))
			.filter((group) => group.items.length > 0)
	);
}

/**
 * Build admin submodule items from a module's subModules
 */
export function buildAdminSubItems(modules: DomainModule[]): SidebarMenuItem[] {
	const adminModule = modules.find((m) => m?.id === 'admin');
	if (!adminModule?.subModules) return [];

	return sortByOrder(
		Object.entries(adminModule.subModules)
			.map(([key, nav]) => navToMenuItem(key, nav))
			.filter((item): item is SidebarMenuItem => item !== null)
	);
}

/**
 * Create a complete sidebar configuration from modules and group definitions
 */
export function createSidebarConfig(
	modules: DomainModule[],
	groupDefinitions: GroupDefinition[],
	options: ConfigBuilderOptions = {},
	extraConfig: {
		rootItems?: SidebarMenuItem[];
		rootGroups?: SidebarMenuGroup[];
		adminItems?: SidebarMenuItem[];
		isAdmin?: boolean;
	} = {}
): SidebarConfig {
	const groups: SidebarMenuGroup[] = [];

	// Add root groups (modules with submodules)
	if (extraConfig.rootGroups) {
		groups.push(...extraConfig.rootGroups);
	}

	// Build groups from definitions
	for (const def of groupDefinitions) {
		// Special handling for admin group
		if (def.id === 'settings' || def.id === 'admin') {
			const adminItems = extraConfig.isAdmin ? (extraConfig.adminItems ?? []) : [];
			const group = buildGroup(def, modules, adminItems);
			if (group) groups.push(group);
		} else {
			const group = buildGroup(def, modules);
			if (group) groups.push(group);
		}
	}

	return {
		groups: sortByOrder(groups.filter((g) => g.items.length > 0)),
		rootItems: extraConfig.rootItems ?? [],
		storageKey: options.storageKey,
		showToggleAll: options.showToggleAll ?? true,
		defaultCollapsed: options.defaultCollapsed,
		flyoutDuration: options.flyoutDuration,
		expandedWidth: options.expandedWidth,
		collapsedWidth: options.collapsedWidth
	};
}

/**
 * Create a simple sidebar config without module registry integration
 */
export function createSimpleConfig(
	groups: SidebarMenuGroup[],
	options: ConfigBuilderOptions = {},
	rootItems?: SidebarMenuItem[]
): SidebarConfig {
	return {
		groups: sortByOrder(groups.filter((g) => g.items.length > 0)),
		rootItems: rootItems ? sortByOrder(rootItems) : [],
		storageKey: options.storageKey,
		showToggleAll: options.showToggleAll ?? true,
		defaultCollapsed: options.defaultCollapsed,
		flyoutDuration: options.flyoutDuration,
		expandedWidth: options.expandedWidth,
		collapsedWidth: options.collapsedWidth
	};
}

/**
 * Helper to create a menu item
 */
export function menuItem(
	id: string,
	label: string,
	href: string,
	options: Partial<Omit<SidebarMenuItem, 'id' | 'label' | 'href'>> = {}
): SidebarMenuItem {
	return { id, label, href, ...options };
}

/**
 * Helper to create a menu group
 */
export function menuGroup(
	id: string,
	label: string,
	icon: Component,
	items: SidebarMenuItem[],
	options: Partial<Omit<SidebarMenuGroup, 'id' | 'label' | 'icon' | 'items'>> = {}
): SidebarMenuGroup {
	return { id, label, icon, items: sortByOrder(items), ...options };
}
