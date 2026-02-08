/**
 * Sort items by order property
 */
export function sortByOrder(items) {
    return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
/**
 * Convert a module to a sidebar menu item
 */
export function moduleToMenuItem(module) {
    if (!module.nav?.href || !module.nav?.label)
        return null;
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
export function navToMenuItem(id, nav) {
    if (!nav.href || !nav.label)
        return null;
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
export function filterModulesByGroup(modules, group) {
    return modules.filter((m) => m?.nav?.group === group);
}
/**
 * Build menu items from modules filtered by group
 */
export function buildGroupItems(modules, navGroup) {
    return sortByOrder(filterModulesByGroup(modules, navGroup)
        .map(moduleToMenuItem)
        .filter((item) => item !== null));
}
/**
 * Build a sidebar menu group from modules
 */
export function buildGroup(definition, modules, additionalItems = []) {
    const moduleItems = buildGroupItems(modules, definition.navGroup);
    const allItems = sortByOrder([
        ...(definition.staticItems ?? []),
        ...moduleItems,
        ...additionalItems
    ]);
    if (allItems.length === 0)
        return null;
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
export function buildRootItems(modules) {
    return sortByOrder(filterModulesByGroup(modules, 'Root')
        .filter((mod) => !mod.subModules || Object.keys(mod.subModules).length === 0)
        .map(moduleToMenuItem)
        .filter((item) => item !== null));
}
/**
 * Build groups from root modules that have submodules
 */
export function buildRootGroups(modules, defaultIcon) {
    return sortByOrder(filterModulesByGroup(modules, 'Root')
        .filter((mod) => mod.subModules && Object.keys(mod.subModules).length > 0)
        .map((mod) => ({
        id: mod.id,
        label: mod.nav?.label ?? mod.id,
        icon: mod.nav?.icon ?? defaultIcon,
        order: mod.nav?.order,
        items: sortByOrder(Object.entries(mod.subModules)
            .map(([key, nav]) => navToMenuItem(key, nav))
            .filter((item) => item !== null))
    }))
        .filter((group) => group.items.length > 0));
}
/**
 * Build admin submodule items from a module's subModules
 */
export function buildAdminSubItems(modules) {
    const adminModule = modules.find((m) => m?.id === 'admin');
    if (!adminModule?.subModules)
        return [];
    return sortByOrder(Object.entries(adminModule.subModules)
        .map(([key, nav]) => navToMenuItem(key, nav))
        .filter((item) => item !== null));
}
/**
 * Create a complete sidebar configuration from modules and group definitions
 */
export function createSidebarConfig(modules, groupDefinitions, options = {}, extraConfig = {}) {
    const groups = [];
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
            if (group)
                groups.push(group);
        }
        else {
            const group = buildGroup(def, modules);
            if (group)
                groups.push(group);
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
export function createSimpleConfig(groups, options = {}, rootItems) {
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
export function menuItem(id, label, href, options = {}) {
    return { id, label, href, ...options };
}
/**
 * Helper to create a menu group
 */
export function menuGroup(id, label, icon, items, options = {}) {
    return { id, label, icon, items: sortByOrder(items), ...options };
}
