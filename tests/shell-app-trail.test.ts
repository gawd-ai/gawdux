import { describe, expect, it } from 'vitest';
import {
	BadgeCheckOutline,
	ChartOutline,
	ChevronRightOutline,
	ClipboardListOutline,
	CogOutline,
	FolderOutline,
	HomeOutline
} from 'flowbite-svelte-icons';
import { createAppTrail, segmentLabel, type PageCrumb } from '../src/lib/shell/app-trail';

/** A host whose addresses carry a tenant's prefix above the app's root. */
const stripTenant = (pathname: string) => pathname.replace(/^\/t\/[^/]+(?=\/|$)/, '') || '/';

function trailFor(tenant: string | null) {
	return createAppTrail({
		icons: {
			documents: FolderOutline,
			admin: CogOutline,
			audit: ClipboardListOutline,
			reviews: BadgeCheckOutline
		},
		home: { label: 'Dashboard', icon: ChartOutline },
		appPath: stripTenant,
		href: (path) => (tenant ? `/t/${tenant}${path}` : path),
		root: '/app',
		unlinked: ['admin'],
		// History and System keep their Admin addresses, Reviews its own:
		// navigation files all three under Audit, which has no page.
		filed(segments, pathCrumbs) {
			const audit = { label: 'Audit' };
			if (
				segments.length === 2 &&
				segments[0] === 'admin' &&
				['history', 'system'].includes(segments[1]!)
			) {
				return {
					crumbs: [audit, { label: segments[1] === 'history' ? 'History' : 'System' }],
					iconKey: 'audit'
				};
			}
			return segments[0] === 'reviews'
				? { crumbs: [audit, ...pathCrumbs(segments)], iconKey: 'audit' }
				: null;
		}
	});
}

const { buildPageBreadcrumb, buildExplicitBreadcrumb } = trailFor(null);

/** Breadcrumbs draws a later crumb's icon as the separator in front of it,
 *  so a trail is right only when crumb 0 alone carries the section's icon. */
function expectSectionIconThenChevrons(crumbs: PageCrumb[], sectionIcon: unknown) {
	expect(crumbs[0]?.icon).toBe(sectionIcon);
	for (const crumb of crumbs.slice(1)) expect(crumb.icon, crumb.label).toBe(ChevronRightOutline);
}

describe('trails of addresses the navigation files under another parent', () => {
	it.each(['history', 'system'])(
		'places the preserved %s address under a parent that is no link',
		(page) => {
			for (const prefix of ['', '/t/acme']) {
				const crumbs = buildPageBreadcrumb(`${prefix}/app/admin/${page}`);
				expect(crumbs.map((crumb) => crumb.label)).toEqual([
					'Audit',
					page === 'history' ? 'History' : 'System'
				]);
				expect(crumbs.every((crumb) => crumb.href === undefined)).toBe(true);
				expectSectionIconThenChevrons(crumbs, ClipboardListOutline);
			}
		}
	);

	it.each(['', '/folder/12/34', '/folder/12/record/56', '/runs'])(
		'puts Reviews%s under the same parent',
		(suffix) => {
			const crumbs = trailFor('acme').buildPageBreadcrumb(`/t/acme/app/reviews${suffix}`);
			expect(crumbs.slice(0, 2).map((crumb) => crumb.label)).toEqual(['Audit', 'Reviews']);
			expect(crumbs[0]?.href).toBeUndefined();
			for (const crumb of crumbs)
				if (crumb.href) {
					expect(crumb.href).toMatch(/^\/t\/acme\/app\/reviews(?:\/|$)/);
					expect(crumb.href).not.toContain('/app/audit');
				}
			// Below the item, it opens the address the sidebar opens.
			if (suffix) expect(crumbs[1]?.href).toBe('/t/acme/app/reviews');
			// The parent is prepended before the icons are given, so the
			// section's icon is its own and never a separator after it.
			expectSectionIconThenChevrons(crumbs, ClipboardListOutline);
		}
	);

	it('names path crumbs in sentence case', () => {
		expect(buildPageBreadcrumb('/app/reviews/runs').map((c) => c.label)).toEqual([
			'Audit',
			'Reviews',
			'Runs'
		]);
		expect(buildPageBreadcrumb('/app/admin/history-settings').map((c) => c.label)).toEqual([
			'Admin',
			'History settings'
		]);
		// Ids are shown as they are.
		expect(buildPageBreadcrumb('/app/documents/folder/12').map((c) => c.label)).toEqual([
			'Documents',
			'Folder',
			'12'
		]);
		expect(segmentLabel('0f8fad5b-d9cb-469f-a165-70867728950e')).toBe(
			'0f8fad5b-d9cb-469f-a165-70867728950e'
		);
		// A segment that is no encoding reads as written, never a throw.
		expect(segmentLabel('100%')).toBe('100%');
	});

	it('keeps other pages and similar-looking routes unchanged', () => {
		for (const page of ['users', 'tenant', 'history-settings', 'system-tools']) {
			expect(buildPageBreadcrumb(`/app/admin/${page}`)[0]?.label).toBe('Admin');
		}
		expect(buildPageBreadcrumb('/app/reviews-tools')[0]?.label).toBe('Reviews tools');
		expect(buildPageBreadcrumb('/app')[0]?.label).toBe('Dashboard');
	});

	it('never links a first level with no page of its own', () => {
		const crumbs = buildPageBreadcrumb('/app/admin/users/12');
		expect(crumbs.map((crumb) => crumb.href)).toEqual([undefined, '/app/admin/users', undefined]);
	});
});

describe('crumb icons: crumb 0 carries the section, every later crumb the chevron', () => {
	it('on trails built from the path', () => {
		expectSectionIconThenChevrons(buildPageBreadcrumb('/app'), ChartOutline);
		expectSectionIconThenChevrons(buildPageBreadcrumb('/app/documents/control'), FolderOutline);
		expectSectionIconThenChevrons(buildPageBreadcrumb('/t/acme/app/admin/users/12'), CogOutline);
		expectSectionIconThenChevrons(buildPageBreadcrumb('/app/unmapped/page'), HomeOutline);
	});

	it('on trails a page supplies, ignoring an iconKey after crumb 0', () => {
		const room = buildExplicitBreadcrumb([
			{ label: 'Audit', iconKey: 'audit' },
			{ label: 'Reviews', iconKey: 'reviews', href: '/t/acme/app/reviews' },
			{ label: 'Package' }
		]);
		expectSectionIconThenChevrons(room, ClipboardListOutline);
		expect(room.map((crumb) => crumb.href)).toEqual([undefined, '/t/acme/app/reviews', undefined]);

		// Crumb 0 without a known key takes its section from its link, else the fallback.
		expectSectionIconThenChevrons(
			buildExplicitBreadcrumb([
				{ label: 'Documents', iconKey: 'unknown', href: '/t/acme/app/documents' },
				{ label: 'Reference', iconKey: 'documents' }
			]),
			FolderOutline
		);
		expectSectionIconThenChevrons(buildExplicitBreadcrumb([{ label: 'Profile' }]), HomeOutline);
		// An item's own icon is the one its sidebar item shows.
		expect(buildExplicitBreadcrumb([{ label: 'Reviews', iconKey: 'reviews' }])[0]?.icon).toBe(
			BadgeCheckOutline
		);
	});

	it('marks the last level the page header names, and only the last', () => {
		const crumbs = buildExplicitBreadcrumb([
			{ label: 'Documents', namedByHeader: true },
			{ label: 'SOP-001', namedByHeader: true }
		]);
		expect(crumbs.map((crumb) => crumb.namedByHeader)).toEqual([undefined, true]);
	});

	it('works with no options: the address as it is, a house for its icon', () => {
		const plain = createAppTrail();
		expect(plain.buildPageBreadcrumb('/')[0]).toEqual({ label: 'Home', icon: HomeOutline });
		expect(plain.buildPageBreadcrumb('/reports/2026').map((c) => [c.label, c.href])).toEqual([
			['Reports', '/reports'],
			['2026', undefined]
		]);
	});
});
