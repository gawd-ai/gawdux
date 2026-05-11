import type { SidebarConfig } from '../types/sidebar.types.js';

/**
 * Map the current URL to the longest-prefix-matching nav item href so detail
 * pages keep their parent list highlighted (`/products/123` stays on
 * `/products`). Plain prefix matching would over-match — `/products` must
 * not light up when on `/products-archive` — so we require either equality
 * or a `/` boundary.
 */
export function resolveActiveItemHref(
	activeUrl: string,
	config: SidebarConfig | null | undefined
): string | null {
	if (!config) return null;
	const all: string[] = [];
	for (const g of config.groups ?? []) {
		for (const item of g.items) if (item.href) all.push(item.href);
	}
	for (const item of config.rootItems ?? []) {
		if (item.href) all.push(item.href);
	}
	const matches = all.filter((h) => activeUrl === h || activeUrl.startsWith(h + '/'));
	if (!matches.length) return null;
	return matches.reduce((longest, h) => (h.length > longest.length ? h : longest), '');
}
