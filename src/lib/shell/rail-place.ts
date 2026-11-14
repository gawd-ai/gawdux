/**
 * The place a page lies in, as the side rail names it: the rail's item the
 * address falls under and the group holding it. One resolution for both the
 * rail's mark and the trail's place (`buildAppTrail`), so the two never name
 * different places. An item holds its own address and every address below
 * it, the longest on a slash boundary winning, except the app's home: every
 * page lies under its address, so it holds its own address alone, and a page
 * no other item holds lies in no place of the rail's.
 */
export type RailPlace = {
	/** The group holding the item; null for an item at the rail's root. */
	group: { id: string; label: string } | null;
	item: { id: string; label: string; href: string };
	/**
	 * The scope the item holds the page by, when the page lies outside the
	 * item's own address: the trail names it under the item.
	 */
	scope?: string;
};

type RailItem = { id?: string; label?: string; href?: string };

/** The part of a sidebar's config the resolution reads. */
export type RailConfig = {
	groups?: ReadonlyArray<{ id?: string; label?: string; items: ReadonlyArray<RailItem> }>;
	rootItems?: ReadonlyArray<RailItem>;
};

export interface RailPlaceOptions {
	/**
	 * Per item address, the addresses it holds beyond its own: an item whose
	 * page opens addresses that do not lie under its own.
	 */
	scopes?: Readonly<Record<string, readonly string[]>>;
	/**
	 * The app's home among the rail's items: its address, or a test of an
	 * item's address. Every page lies under the home's address, so it holds
	 * its own address alone. Left out, the rail has no home and every item
	 * holds what lies below it: a host whose rail has a home names it, or a
	 * page no item holds would be marked as the home.
	 */
	home?: string | ((href: string) => boolean) | null;
}

function trimmed(href: string): string {
	return href.replace(/\/+$/, '');
}

/** How much of the address an item holds it by: the length of its own
 *  address or the scope's that holds it (the scope named), 0 when it holds
 *  it not. */
function hold(
	href: string,
	activeUrl: string,
	scopes: readonly string[],
	isHome: (href: string) => boolean
): { length: number; scope?: string } {
	if (activeUrl === href) return { length: href.length };
	if (!isHome(href) && activeUrl.startsWith(href + '/')) return { length: href.length };
	for (const scope of scopes) {
		if (activeUrl === scope || activeUrl.startsWith(scope + '/'))
			return { length: scope.length, scope };
	}
	return { length: 0 };
}

/** The rail's place of `activeUrl`, null for a page no item holds. */
export function resolveRailPlace(
	activeUrl: string,
	config: RailConfig | null | undefined,
	options: RailPlaceOptions = {}
): RailPlace | null {
	const scopes = options.scopes ?? {};
	const home = options.home;
	const isHome =
		typeof home === 'function'
			? home
			: (href: string) => typeof home === 'string' && trimmed(href) === trimmed(home);
	let found: RailPlace | null = null;
	let foundLength = 0;
	const consider = (item: RailItem, group: RailPlace['group']) => {
		if (!item.href) return;
		const { length, scope } = hold(item.href, activeUrl, scopes[item.href] ?? [], isHome);
		if (length === 0 || length <= foundLength) return;
		foundLength = length;
		found = {
			group,
			item: { id: item.id ?? item.href, label: item.label ?? '', href: item.href },
			...(scope === undefined ? {} : { scope })
		};
	};
	for (const group of config?.groups ?? []) {
		const owner = { id: group.id ?? '', label: group.label ?? '' };
		for (const item of group.items) consider(item, owner);
	}
	for (const item of config?.rootItems ?? []) consider(item, null);
	return found;
}

/** The address of the item the rail marks, null when it marks none. */
export function resolveActiveSidebarItemHref(
	activeUrl: string,
	config: RailConfig | null | undefined,
	options: RailPlaceOptions = {}
): string | null {
	return resolveRailPlace(activeUrl, config, options)?.item.href ?? null;
}

/**
 * The URL the sidebar is told it is on: the item the host resolved, so the
 * sidebar's highlight and the host's are one answer by construction, never
 * two resolvers that happen to agree. A page no item holds tells it nothing,
 * so the sidebar marks no item: told the page's own path, it would mark the
 * home, whose address lies above every page.
 */
export function sidebarActiveUrl(_activeUrl: string, activeItemHref: string | null): string {
	return activeItemHref ?? '';
}

/** A person's name as the shell shows it: the name, else the email, else `fallback`. */
export function displayNameFor(
	user: { name?: string | null; email?: string | null } | null | undefined,
	fallback = ''
): string {
	return user?.name?.trim() || user?.email || fallback;
}

/** The first letters of the first and the last word of a name. */
export function initialsForDisplayName(displayName: string): string {
	const parts = displayName.trim().split(/\s+/).filter(Boolean);
	const first = parts[0];
	if (!first) return '';
	const last = parts[parts.length - 1] ?? first;
	if (parts.length === 1) return first.charAt(0).toUpperCase();
	return (first.charAt(0) + last.charAt(0)).toUpperCase();
}

/**
 * Whether the shell's right column holds anything for this reader on this
 * page: each fact is one thing it would hold (a chat dock, a help door, an
 * open panel). Without any of them the column takes no width, the main
 * column reaches the right edge, and the header carries the theme toggle the
 * column's cap would hold.
 */
export function rightColumnHolds(facts: Readonly<Record<string, boolean>>): boolean {
	return Object.values(facts).some(Boolean);
}
