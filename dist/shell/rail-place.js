function trimmed(href) {
    return href.replace(/\/+$/, '');
}
/** How much of the address an item holds it by: the length of its own
 *  address or the scope's that holds it (the scope named), 0 when it holds
 *  it not. */
function hold(href, activeUrl, scopes, isHome) {
    if (activeUrl === href)
        return { length: href.length };
    if (!isHome(href) && activeUrl.startsWith(href + '/'))
        return { length: href.length };
    for (const scope of scopes) {
        if (activeUrl === scope || activeUrl.startsWith(scope + '/'))
            return { length: scope.length, scope };
    }
    return { length: 0 };
}
/** The rail's place of `activeUrl`, null for a page no item holds. */
export function resolveRailPlace(activeUrl, config, options = {}) {
    const scopes = options.scopes ?? {};
    const home = options.home;
    const isHome = typeof home === 'function'
        ? home
        : (href) => typeof home === 'string' && trimmed(href) === trimmed(home);
    let found = null;
    let foundLength = 0;
    const consider = (item, group) => {
        if (!item.href)
            return;
        const { length, scope } = hold(item.href, activeUrl, scopes[item.href] ?? [], isHome);
        if (length === 0 || length <= foundLength)
            return;
        foundLength = length;
        found = {
            group,
            item: { id: item.id ?? item.href, label: item.label ?? '', href: item.href },
            ...(scope === undefined ? {} : { scope })
        };
    };
    for (const group of config?.groups ?? []) {
        const owner = { id: group.id ?? '', label: group.label ?? '' };
        for (const item of group.items)
            consider(item, owner);
    }
    for (const item of config?.rootItems ?? [])
        consider(item, null);
    return found;
}
/** The address of the item the rail marks, null when it marks none. */
export function resolveActiveSidebarItemHref(activeUrl, config, options = {}) {
    return resolveRailPlace(activeUrl, config, options)?.item.href ?? null;
}
/**
 * The URL the sidebar is told it is on: the item the host resolved, so the
 * sidebar's highlight and the host's are one answer by construction, never
 * two resolvers that happen to agree. A page no item holds tells it nothing,
 * so the sidebar marks no item: told the page's own path, it would mark the
 * home, whose address lies above every page.
 */
export function sidebarActiveUrl(_activeUrl, activeItemHref) {
    return activeItemHref ?? '';
}
/** A person's name as the shell shows it: the name, else the email, else `fallback`. */
export function displayNameFor(user, fallback = '') {
    return user?.name?.trim() || user?.email || fallback;
}
/** The first letters of the first and the last word of a name. */
export function initialsForDisplayName(displayName) {
    const parts = displayName.trim().split(/\s+/).filter(Boolean);
    const first = parts[0];
    if (!first)
        return '';
    const last = parts[parts.length - 1] ?? first;
    if (parts.length === 1)
        return first.charAt(0).toUpperCase();
    return (first.charAt(0) + last.charAt(0)).toUpperCase();
}
/**
 * Whether the shell's right column holds anything for this reader on this
 * page: each fact is one thing it would hold (a chat dock, a help door, an
 * open panel). Without any of them the column takes no width, the main
 * column reaches the right edge, and the header carries the theme toggle the
 * column's cap would hold.
 */
export function rightColumnHolds(facts) {
    return Object.values(facts).some(Boolean);
}
