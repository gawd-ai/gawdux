/**
 * The rail and the trail name the same place: the trail's place, its first
 * levels, is the group and the item the side rail marks, on every page
 * family the rail reaches. An unknown or refused address under a section
 * names its section, so a hidden item reads exactly as an unknown one; an
 * address an item holds beyond its own names its scope under the item the
 * rail marks. The rail's mark comes from `resolveRailPlace`, the one
 * resolution a host hands the rail, and the trail from `buildAppTrail`, with
 * the trail each page states.
 */
import { describe, expect, it } from 'vitest';
import { ChartOutline, ClipboardListOutline, CogOutline, FolderOutline } from 'flowbite-svelte-icons';
import type { AppBreadcrumbData } from '../src/lib/primitives/page-chrome';
import { createAppTrail, type PageCrumb } from '../src/lib/shell/app-trail';
import { resolveRailPlace, type RailConfig, type RailPlace } from '../src/lib/shell/rail-place';

const TENANT = '/t/acme';
const withTenant = (suffix: string) => `${TENANT}${suffix}`;
const stripTenant = (pathname: string) => pathname.replace(/^\/t\/[^/]+(?=\/|$)/, '') || '/';

const { buildAppTrail } = createAppTrail({
	icons: {
		documents: FolderOutline,
		admin: CogOutline,
		audit: ClipboardListOutline,
		dashboard: ChartOutline
	},
	home: { label: 'Dashboard', icon: ChartOutline },
	appPath: stripTenant,
	href: withTenant,
	root: '/app',
	unlinked: ['admin', 'work']
});

const item = (id: string, label: string, suffix: string) => ({
	id,
	label,
	href: withTenant(suffix)
});

/** An administrator's rail, every section shown. */
function adminRail(): RailConfig {
	return {
		rootItems: [item('dashboard', 'Dashboard', '/app')],
		groups: [
			{
				id: 'documents',
				label: 'Documents',
				items: [
					item('documents-authoring', 'Authoring', '/app/documents'),
					item('documents-reference', 'Reference', '/app/documents/reference'),
					item('documents-control', 'Control', '/app/documents/control'),
					item('documents-archive', 'Archive', '/app/documents/archive')
				]
			},
			{
				id: 'work',
				label: 'Work',
				items: [
					item('records', 'Records', '/app/work/records'),
					item('forms', 'Forms', '/app/work/forms'),
					item('runs', 'Runs', '/app/work/runs'),
					item('definitions', 'Definitions', '/app/work/runs/definitions')
				]
			},
			{
				id: 'tasks',
				label: 'Tasks',
				items: [
					item('tasks-mine', 'My tasks', '/app/tasks/mine'),
					item('tasks-team', 'My team', '/app/tasks/team'),
					item('tasks-calendar', 'Calendar', '/app/tasks/calendar')
				]
			},
			{
				id: 'admin',
				label: 'Admin',
				items: [
					item('admin-tenant', 'Tenant', '/app/admin/tenant'),
					item('admin-users', 'Users', '/app/admin/users'),
					item('admin-ai', 'AI + Bots', '/app/admin/ai')
				]
			},
			{
				id: 'audit',
				label: 'Audit',
				items: [
					item('reviews', 'Reviews', '/app/reviews'),
					item('history', 'History', '/app/admin/history'),
					item('system', 'System', '/app/admin/system')
				]
			}
		]
	};
}

/** A member who reads documents and nothing to manage: no Control, no Archive, no Admin. */
function memberRail(): RailConfig {
	const rail = adminRail();
	return {
		rootItems: rail.rootItems!,
		groups: [
			{
				...rail.groups![0]!,
				items: rail.groups![0]!.items.filter((entry) =>
					['documents-authoring', 'documents-reference'].includes(entry.id ?? '')
				)
			},
			rail.groups![1]!
		]
	};
}

/** The addresses an item holds beyond its own: the scopes its page opens. */
const SCOPES = {
	[withTenant('/app/tasks/mine')]: [
		withTenant('/app/tasks/assigned'),
		withTenant('/app/tasks/completed')
	]
};
const OPTIONS = { scopes: SCOPES, home: withTenant('/app') };

const stated = (...labels: string[]): AppBreadcrumbData => ({
	items: labels.map((label) => ({ label }))
});
/** A page whose address holds no item states a trail of no levels. */
const NONE: AppBreadcrumbData = { items: [] };

type Family = {
	name: string;
	pathname: string;
	/** What the page states: its trail, or nothing (the shell composes it). */
	appBreadcrumb?: AppBreadcrumbData;
	/** The trail's levels as they read, for the families whose words matter. */
	reads?: string[];
};

function families(): Family[] {
	return [
		// Documents · Authoring: its index, each scope, a folder, a document.
		{
			name: 'Authoring, All documents',
			pathname: '/app/documents',
			appBreadcrumb: stated('Documents', 'Authoring', 'All documents'),
			reads: ['Documents', 'Authoring', 'All documents']
		},
		...(['recent', 'my-drafts', 'inbox', 'unfiled', 'review-due'] as const).map((key) => ({
			name: `Authoring, scope ${key}`,
			pathname: `/app/documents/${key}`,
			appBreadcrumb: stated('Documents', 'Authoring', key)
		})),
		{
			name: 'Authoring, a folder',
			pathname: '/app/documents/folder/5',
			appBreadcrumb: stated('Documents', 'Authoring', 'Quality', 'Procedures'),
			reads: ['Documents', 'Authoring', 'Quality', 'Procedures']
		},
		{
			name: 'Authoring, a document',
			pathname: '/app/documents/folder/5/42',
			appBreadcrumb: stated('Documents', 'Authoring', 'Quality', 'Procedures', 'Method transfer'),
			reads: ['Documents', 'Authoring', 'Quality', 'Procedures', 'Method transfer']
		},
		// An id no document the reader may open holds: unknown and hidden alike.
		{
			name: 'Authoring, an unknown or hidden id',
			pathname: '/app/documents/99999999',
			appBreadcrumb: NONE,
			reads: ['Documents', 'Authoring']
		},
		{
			name: 'Authoring, an unknown id in a folder',
			pathname: '/app/documents/folder/5/99999999',
			appBreadcrumb: NONE,
			reads: ['Documents', 'Authoring']
		},
		{
			name: 'Control, an address no document holds',
			pathname: '/app/documents/control/99999999',
			appBreadcrumb: NONE,
			reads: ['Documents', 'Control']
		},
		{
			name: 'Control',
			pathname: '/app/documents/control',
			appBreadcrumb: stated('Documents', 'Control')
		},
		{
			name: 'Archive',
			pathname: '/app/documents/archive',
			appBreadcrumb: stated('Documents', 'Archive')
		},
		{
			name: 'Archive, a signed copy',
			pathname: '/app/documents/archive/7',
			appBreadcrumb: stated('Documents', 'Archive', 'Copy 7')
		},
		{
			name: 'Reference',
			pathname: '/app/documents/reference',
			appBreadcrumb: stated('Documents', 'Reference'),
			reads: ['Documents', 'Reference']
		},
		{
			name: 'Reference, a document',
			pathname: '/app/documents/reference/folder/5/42',
			appBreadcrumb: stated('Documents', 'Reference', 'Quality', 'Document control')
		},
		{
			name: 'Reference, a signed copy',
			pathname: '/app/documents/reference/signed/7',
			appBreadcrumb: stated('Documents', 'Reference', 'Copy 7')
		},
		// Its own address family, filed under Audit by the rail.
		{
			name: 'Reviews, a record',
			pathname: '/app/reviews/folder/10/record/3',
			appBreadcrumb: stated('Audit', 'Reviews', 'Change controls', 'CC-0001'),
			reads: ['Audit', 'Reviews', 'Change controls', 'CC-0001']
		},
		// Work.
		...(
			[
				['Records', '/app/work/records', ['Work', 'Records']],
				['a record', '/app/work/records/7', ['Work', 'Records', 'R-0007']],
				['Forms', '/app/work/forms', ['Work', 'Forms']],
				['a form', '/app/work/forms/7', ['Work', 'Forms', 'F-0007']],
				['Runs', '/app/work/runs', ['Work', 'Runs']],
				['a run', '/app/work/runs/7', ['Work', 'Runs', 'Run 7']],
				['Definitions', '/app/work/runs/definitions', ['Work', 'Definitions']],
				['a definition', '/app/work/runs/definitions/7', ['Work', 'Definitions', 'D-7']]
			] as const
		).map(([name, pathname, levels]) => ({
			name: `Work, ${name}`,
			pathname,
			appBreadcrumb: stated(...levels)
		})),
		// Tasks: two scopes lie under an item whose address they do not share.
		{
			name: 'Tasks, Calendar',
			pathname: '/app/tasks/calendar',
			appBreadcrumb: stated('Tasks', 'Calendar')
		},
		...(
			[
				['mine', ['Tasks', 'My tasks']],
				['team', ['Tasks', 'My team']],
				['assigned', ['Tasks', 'My tasks', 'Assigned by me']],
				['completed', ['Tasks', 'My tasks', 'Completed']]
			] as const
		).map(([scope, reads]) => ({
			name: `Tasks, ${scope}`,
			pathname: `/app/tasks/${scope}`,
			appBreadcrumb: stated(...reads),
			reads: [...reads]
		})),
		// Pages that state no trail: the shell composes it from the rail.
		...(
			[
				['/app/admin/tenant', ['Admin', 'Tenant']],
				['/app/admin/users', ['Admin', 'Users']],
				['/app/admin/users/12', ['Admin', 'Users', '12']],
				['/app/admin/ai', ['Admin', 'AI + Bots']],
				['/app/admin/history', ['Audit', 'History']],
				['/app/admin/system', ['Audit', 'System']],
				['/app/reviews/runs', ['Audit', 'Reviews', 'Runs']],
				['/app', ['Dashboard']]
			] as const
		).map(([pathname, reads]) => ({ name: pathname, pathname, reads: [...reads] }))
	];
}

/** The trail's first levels name the rail's group and item. */
function placeOf(trail: PageCrumb[], place: RailPlace): string[] {
	return trail.slice(0, place.group ? 2 : 1).map((crumb) => crumb.label);
}

describe('the rail and the trail name the same place', () => {
	it.each(families().map((family) => [family.name, family] as const))('%s', (_name, family) => {
		const rail = adminRail();
		const pathname = withTenant(family.pathname);
		const place = resolveRailPlace(pathname, rail, OPTIONS);
		expect(place, 'the rail marks an item').not.toBeNull();
		const trail = buildAppTrail({
			pathname,
			pageData: family.appBreadcrumb ? { appBreadcrumb: family.appBreadcrumb } : {},
			place
		});
		const expected = place!.group ? [place!.group.label, place!.item.label] : [place!.item.label];
		expect(placeOf(trail, place!)).toEqual(expected);
		if (family.reads) expect(trail.map((crumb) => crumb.label)).toEqual(family.reads);
	});

	it("names the section a refused address lies under, by the reader's own rail", () => {
		// A member's rail holds no Control: the address lies under Authoring,
		// which the rail marks, and the trail names it.
		const rail = memberRail();
		const pathname = withTenant('/app/documents/control/99999999');
		const place = resolveRailPlace(pathname, rail, OPTIONS);
		expect(place?.item.label).toBe('Authoring');
		const trail = buildAppTrail({ pathname, pageData: { appBreadcrumb: NONE }, place });
		expect(trail.map((crumb) => crumb.label)).toEqual(['Documents', 'Authoring']);
	});

	it('marks no item where the rail holds none, never the home above every page', () => {
		const rail = adminRail();
		expect(resolveRailPlace(withTenant('/app/profile'), rail, OPTIONS)).toBeNull();
		expect(resolveRailPlace(withTenant('/app'), rail, OPTIONS)?.item.label).toBe('Dashboard');
		// With no place, the trail is the address's own levels.
		const trail = buildAppTrail({
			pathname: withTenant('/app/profile'),
			pageData: {},
			place: null
		});
		expect(trail.map((crumb) => crumb.label)).toEqual(['Profile']);
		expect(
			buildAppTrail({
				pathname: withTenant('/app/profile/9'),
				pageData: { appBreadcrumb: NONE },
				place: null
			}).map((crumb) => crumb.label)
		).toEqual(['Profile', '9']);
	});

	it('links the place on a page under it, and names the page itself unlinked', () => {
		const rail = adminRail();
		const unknown = withTenant('/app/documents/99999999');
		const trail = buildAppTrail({
			pathname: unknown,
			pageData: { appBreadcrumb: NONE },
			place: resolveRailPlace(unknown, rail, OPTIONS)
		});
		expect(trail.at(-1)?.href).toBe(withTenant('/app/documents'));
		const tenant = withTenant('/app/admin/tenant');
		const own = buildAppTrail({
			pathname: tenant,
			pageData: {},
			place: resolveRailPlace(tenant, rail, OPTIONS)
		});
		expect(own.at(-1)?.href).toBeUndefined();
		// Below the item, each level links to its own address under the item.
		const user = withTenant('/app/admin/users/12/roles');
		const below = buildAppTrail({
			pathname: user,
			pageData: {},
			place: resolveRailPlace(user, rail, OPTIONS)
		});
		expect(below.map((crumb) => crumb.href)).toEqual([
			undefined,
			withTenant('/app/admin/users'),
			withTenant('/app/admin/users/12'),
			undefined
		]);
	});

	// A page an item holds by a scope lies outside the item's own address.
	// Read as "below the item", its address was cut by the item's length:
	// a name cut mid-word and links under the item that lead nowhere.
	it('names the scope under the item on a scoped page that states no trail, each level a link to its own address', () => {
		const rail = adminRail();
		const assigned = withTenant('/app/tasks/assigned/42/steps');
		const trail = buildAppTrail({
			pathname: assigned,
			pageData: {},
			place: resolveRailPlace(assigned, rail, OPTIONS)
		});
		expect(trail.map((crumb) => crumb.label)).toEqual([
			'Tasks',
			'My tasks',
			'Assigned',
			'42',
			'Steps'
		]);
		expect(trail.map((crumb) => crumb.href)).toEqual([
			undefined,
			withTenant('/app/tasks/mine'),
			withTenant('/app/tasks/assigned'),
			withTenant('/app/tasks/assigned/42'),
			undefined
		]);
		// The scope's own page is named, not linked.
		const scope = withTenant('/app/tasks/completed');
		const own = buildAppTrail({
			pathname: scope,
			pageData: {},
			place: resolveRailPlace(scope, rail, OPTIONS)
		});
		expect(own.map((crumb) => [crumb.label, crumb.href])).toEqual([
			['Tasks', undefined],
			['My tasks', withTenant('/app/tasks/mine')],
			['Completed', undefined]
		]);
	});

	it('names a scope of another section whole, never the letters left after the item', () => {
		const devices = withTenant('/app/devices');
		const rail: RailConfig = { rootItems: [item('devices', 'Devices', '/app/devices')] };
		const options = { scopes: { [devices]: [withTenant('/app/agent-updates')] } };
		const page = withTenant('/app/agent-updates/rollouts/7');
		const trail = buildAppTrail({
			pathname: page,
			pageData: {},
			place: resolveRailPlace(page, rail, options)
		});
		expect(trail.map((crumb) => [crumb.label, crumb.href])).toEqual([
			['Devices', devices],
			['Agent updates', withTenant('/app/agent-updates')],
			['Rollouts', withTenant('/app/agent-updates/rollouts')],
			['7', undefined]
		]);
	});

	it("adds the address's own levels for a place that names no scope", () => {
		const place: RailPlace = {
			group: null,
			item: { id: 'devices', label: 'Devices', href: withTenant('/app/devices') }
		};
		const trail = buildAppTrail({
			pathname: withTenant('/app/agent-updates/rollouts/7'),
			pageData: {},
			place
		});
		expect(trail.map((crumb) => [crumb.label, crumb.href])).toEqual([
			['Devices', withTenant('/app/devices')],
			['Agent updates', withTenant('/app/agent-updates')],
			['Rollouts', withTenant('/app/agent-updates/rollouts')],
			['7', undefined]
		]);
	});

	it("leads the trail with the icon of the rail's group, else of its item", () => {
		const rail = adminRail();
		const history = withTenant('/app/admin/history');
		expect(
			buildAppTrail({
				pathname: history,
				pageData: {},
				place: resolveRailPlace(history, rail, OPTIONS)
			})[0]?.icon
		).toBe(ClipboardListOutline);
		const home = withTenant('/app');
		expect(
			buildAppTrail({ pathname: home, pageData: {}, place: resolveRailPlace(home, rail, OPTIONS) })[0]
				?.icon
		).toBe(ChartOutline);
	});
});
