import { describe, expect, it } from 'vitest';
import { resolveActiveItemHref } from '../src/lib/utils/resolve-active-nav';
import type { SidebarConfig } from '../src/lib/types/sidebar.types';
import {
	displayNameFor,
	initialsForDisplayName,
	resolveActiveSidebarItemHref as resolveItemHref,
	resolveRailPlace as resolvePlace,
	rightColumnHolds,
	sidebarActiveUrl,
	type RailConfig,
	type RailPlaceOptions
} from '../src/lib/shell/rail-place';

/** The host's home: the app's own address, under any tenant's prefix. */
const HOME = { home: (href: string) => /^(\/t\/[^/]+)?\/app\/?$/.test(href) };
const resolveActiveSidebarItemHref = (
	url: string,
	config: RailConfig,
	options: RailPlaceOptions = HOME
) => resolveItemHref(url, config, options);
const resolveRailPlace = (url: string, config: RailConfig, options: RailPlaceOptions = {}) =>
	resolvePlace(url, config, { ...HOME, ...options });

const sidebarConfig = {
	rootItems: [
		{ id: 'home', label: 'Home', href: '/app' },
		{ id: 'documents', label: 'Documents', href: '/app/documents' },
		{ id: 'parts-archive', label: 'Parts archive', href: '/app/parts-archive' }
	],
	groups: [
		{
			id: 'orders',
			label: 'Orders',
			icon: (() => null) as never,
			items: [
				{ id: 'parts', label: 'Parts', href: '/app/parts' },
				{ id: 'part-prices', label: 'Part prices', href: '/app/parts/prices' }
			]
		},
		{
			id: 'audit',
			label: 'Audit',
			icon: (() => null) as never,
			items: [
				{ id: 'reviews', label: 'Reviews', href: '/app/reviews' },
				{ id: 'history', label: 'History', href: '/app/admin/history' }
			]
		}
	]
} satisfies Pick<SidebarConfig, 'groups' | 'rootItems'>;

describe('the rail place of an address', () => {
	it('resolves exact active sidebar hrefs', () => {
		expect(resolveActiveSidebarItemHref('/app/documents', sidebarConfig)).toBe('/app/documents');
	});

	it('keeps detail pages highlighted on their longest matching parent href', () => {
		expect(resolveActiveSidebarItemHref('/app/parts/prices/12', sidebarConfig)).toBe(
			'/app/parts/prices'
		);
	});

	it('keeps an item active across the pages below it by its own address', () => {
		for (const path of [
			'/app/reviews',
			'/app/reviews/folder/12/34',
			'/app/reviews/folder/12/record/56'
		]) {
			expect(resolveActiveSidebarItemHref(path, sidebarConfig)).toBe('/app/reviews');
		}
		// The home holds its own address alone: a page no other item holds
		// lies in no place of the rail's.
		expect(resolveActiveSidebarItemHref('/app/reviewers', sidebarConfig)).toBeNull();
	});

	it('has no home unless it is told one: every item then holds what lies below it', () => {
		expect(resolveItemHref('/app/unknown', sidebarConfig)).toBe('/app');
		expect(resolveActiveSidebarItemHref('/app/unknown', sidebarConfig, { home: null })).toBe(
			'/app'
		);
		// The home may be told by a test of an address (a host's tenant prefix).
		expect(
			resolveActiveSidebarItemHref('/t/acme/app/unknown', {
				rootItems: [{ id: 'home', label: 'Home', href: '/t/acme/app' }]
			}, { home: (href) => href.endsWith('/app') })
		).toBeNull();
		// A trailing slash on either side names the same home.
		expect(
			resolveActiveSidebarItemHref('/app/unknown', sidebarConfig, { home: '/app/' })
		).toBeNull();
	});

	it('resolves the item the sidebar itself resolves, and hands it that item', () => {
		// One rule, longest prefix on a slash boundary, on both sides: no entry
		// opens on a sub-page that the host would have to map back. The home
		// alone holds no address below its own here; the sidebar, told the item
		// the host resolved or nothing, marks the same item.
		const config = sidebarConfig as unknown as SidebarConfig;
		for (const path of [
			'/app',
			'/app/reviews',
			'/app/reviews/folder/12/34',
			'/app/admin/history',
			'/app/parts/prices/12',
			'/app/parts-archive/2026',
			'/app/partners',
			'/settings'
		]) {
			const item = resolveActiveSidebarItemHref(path, sidebarConfig);
			if (item !== null) expect(item, path).toBe(resolveActiveItemHref(path, config));
			expect(resolveActiveItemHref(sidebarActiveUrl(path, item), config), path).toBe(item);
		}
		// A page no item holds tells the sidebar nothing, so it marks nothing.
		expect(resolveActiveSidebarItemHref('/app/partners', sidebarConfig)).toBeNull();
		expect(sidebarActiveUrl('/settings', null)).toBe('');
		expect(sidebarActiveUrl('/app/parts/prices/12', '/app/parts/prices')).toBe(
			'/app/parts/prices'
		);
	});

	it('requires a slash boundary when prefix-matching sidebar hrefs', () => {
		expect(resolveActiveSidebarItemHref('/app/parts-archive/2026', sidebarConfig)).toBe(
			'/app/parts-archive'
		);
		expect(resolveActiveSidebarItemHref('/app/partners', sidebarConfig)).toBeNull();
	});

	it('returns null when no sidebar item matches', () => {
		expect(resolveActiveSidebarItemHref('/settings', sidebarConfig)).toBeNull();
	});

	// A group whose first item and its siblings share one prefix:
	// longest-prefix keeps each child's highlight on its own item and
	// everything else on the first.
	it('resolves the children of one group by longest prefix', () => {
		const documentsGroupConfig = {
			rootItems: [],
			groups: [
				{
					id: 'documents',
					label: 'Documents',
					icon: (() => null) as never,
					items: [
						{ id: 'documents-authoring', label: 'Authoring', href: '/t/acme/app/documents' },
						{
							id: 'documents-reference',
							label: 'Reference',
							href: '/t/acme/app/documents/reference'
						},
						{ id: 'documents-control', label: 'Control', href: '/t/acme/app/documents/control' }
					]
				}
			]
		} satisfies Pick<SidebarConfig, 'groups' | 'rootItems'>;
		expect(
			resolveActiveSidebarItemHref('/t/acme/app/documents/control', documentsGroupConfig)
		).toBe('/t/acme/app/documents/control');
		expect(
			resolveActiveSidebarItemHref('/t/acme/app/documents/reference', documentsGroupConfig)
		).toBe('/t/acme/app/documents/reference');
		expect(
			resolveActiveSidebarItemHref('/t/acme/app/documents/folder/9', documentsGroupConfig)
		).toBe('/t/acme/app/documents');
		expect(resolveActiveSidebarItemHref('/t/acme/app/documents/recent', documentsGroupConfig)).toBe(
			'/t/acme/app/documents'
		);
	});

	it('gives an item the addresses its scopes name, beyond its own', () => {
		const place = resolveRailPlace('/app/inbox/7', sidebarConfig, {
			scopes: { '/app/documents': ['/app/inbox', '/app/drafts'] }
		});
		expect(place?.item).toEqual({ id: 'documents', label: 'Documents', href: '/app/documents' });
		expect(place?.group).toBeNull();
		expect(resolveRailPlace('/app/inbox/7', sidebarConfig)).toBeNull();
	});

	it('names the group holding the item', () => {
		expect(resolveRailPlace('/app/admin/history', sidebarConfig)).toEqual({
			group: { id: 'audit', label: 'Audit' },
			item: { id: 'history', label: 'History', href: '/app/admin/history' }
		});
	});
});

describe('app shell display helpers', () => {
	it('uses trimmed name, then email, then the fallback for a person', () => {
		expect(displayNameFor({ name: '  Ada Lovelace  ', email: 'ada@example.com' })).toBe(
			'Ada Lovelace'
		);
		expect(displayNameFor({ name: ' ', email: 'ada@example.com' })).toBe('ada@example.com');
		expect(displayNameFor(null, 'Someone')).toBe('Someone');
		expect(displayNameFor(null)).toBe('');
	});

	it('builds initials from first and last display-name parts', () => {
		expect(initialsForDisplayName('Ada')).toBe('A');
		expect(initialsForDisplayName('Ada Byron Lovelace')).toBe('AL');
		expect(initialsForDisplayName('   ')).toBe('');
	});

	it('draws the right column only when it holds something', () => {
		expect(rightColumnHolds({ chat: false, help: false })).toBe(false);
		expect(rightColumnHolds({ chat: false, help: true })).toBe(true);
		expect(rightColumnHolds({})).toBe(false);
	});
});
