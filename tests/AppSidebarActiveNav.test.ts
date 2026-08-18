import { cleanup, fireEvent, render, waitFor } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import { ChartOutline } from 'flowbite-svelte-icons';
import AppSidebar from '../src/lib/components/AppSidebar.svelte';
import type { SidebarConfig } from '../src/lib/types/sidebar.types';

afterEach(() => cleanup());

/**
 * Two nav-correctness contracts (wave-1.2 flow-back from a consumer that
 * papered over both with a DOM/CSS controller):
 *
 * 1. Top-level items highlight by LONGEST-PREFIX match with a `/` boundary
 *    (resolveActiveItemHref), not exact match — a detail page keeps its
 *    parent list lit, and `/products` never lights on `/products-archive`.
 * 2. The dropdown group holding the current page opens on first paint,
 *    unless the host explicitly declared `defaultOpen: false`.
 */

const HIGHLIGHT = 'bg-gray-100';

function rootConfig(): SidebarConfig {
	return {
		rootItems: [
			{ id: 'products', label: 'Products', href: '/products' },
			{ id: 'archive', label: 'Archive', href: '/products-archive' }
		]
	};
}

function activeRootLabels(container: HTMLElement): string[] {
	// classList token match, not substring: flowbite's base classes carry
	// `hover:bg-gray-100`, which a substring selector would count as active.
	return [...container.querySelectorAll('a')]
		.filter((anchor) => anchor.classList.contains(HIGHLIGHT))
		.map((anchor) => anchor.textContent?.trim() ?? '');
}

describe('AppSidebar top-level active highlight', () => {
	it('keeps the parent item lit on a detail page (longest-prefix, / boundary)', () => {
		const { container } = render(AppSidebar, {
			props: { config: rootConfig(), activeUrl: '/products/123', initialOpen: true }
		});
		expect(activeRootLabels(container)).toEqual(['Products']);
	});

	it('does not over-match a sibling that shares the prefix without the boundary', () => {
		const { container } = render(AppSidebar, {
			props: { config: rootConfig(), activeUrl: '/products-archive', initialOpen: true }
		});
		expect(activeRootLabels(container)).toEqual(['Archive']);
	});

	it('exact match still wins, and no match lights nothing', () => {
		const exact = render(AppSidebar, {
			props: { config: rootConfig(), activeUrl: '/products', initialOpen: true }
		});
		expect(activeRootLabels(exact.container)).toEqual(['Products']);
		cleanup();
		const none = render(AppSidebar, {
			props: { config: rootConfig(), activeUrl: '/settings', initialOpen: true }
		});
		expect(activeRootLabels(none.container)).toEqual([]);
	});

	it('highlights the single longest match when a root item and a group item both prefix-match', () => {
		const config: SidebarConfig = {
			rootItems: [{ id: 'app', label: 'Home', href: '/app' }],
			groups: [
				{
					id: 'devices',
					label: 'Devices',
					icon: ChartOutline,
					items: [{ id: 'list', label: 'Device List', href: '/app/devices' }]
				}
			]
		};
		const { container } = render(AppSidebar, {
			props: { config, activeUrl: '/app/devices/42', initialOpen: true }
		});
		// The group's sub-item is the longest match; the root Home item must
		// NOT also light up just because /app prefixes the URL.
		expect(activeRootLabels(container)).toEqual([]);
	});
});

function groupedConfig(defaultOpen?: boolean): SidebarConfig {
	return {
		groups: [
			{
				id: 'devices',
				label: 'Devices',
				icon: ChartOutline,
				items: [{ id: 'list', label: 'Device List', href: '/app/devices' }],
				...(defaultOpen === undefined ? {} : { defaultOpen })
			},
			{
				id: 'alerts',
				label: 'Alerts',
				icon: ChartOutline,
				items: [{ id: 'rules', label: 'Alert Rules', href: '/app/alerts' }]
			}
		]
	};
}

function openGroupLabels(container: HTMLElement): string[] {
	return [...container.querySelectorAll('.sidebar-dropdown-group.open, .open')]
		.map((el) => el.querySelector('button, [role="button"]')?.textContent?.trim() ?? '')
		.filter(Boolean);
}

describe('AppSidebar active-group open seeding', () => {
	it('opens the group holding the current page on first paint; siblings stay closed', () => {
		const { container } = render(AppSidebar, {
			props: { config: groupedConfig(), activeUrl: '/app/devices/42', initialOpen: true }
		});
		const open = openGroupLabels(container);
		expect(open.some((label) => label.includes('Devices'))).toBe(true);
		expect(open.some((label) => label.includes('Alerts'))).toBe(false);
	});

	it('an explicit defaultOpen: false wins over the active page', () => {
		const { container } = render(AppSidebar, {
			props: { config: groupedConfig(false), activeUrl: '/app/devices/42', initialOpen: true }
		});
		expect(openGroupLabels(container).some((label) => label.includes('Devices'))).toBe(false);
	});

	it('nothing opens when no group holds the active page', () => {
		const { container } = render(AppSidebar, {
			props: { config: groupedConfig(), activeUrl: '/settings', initialOpen: true }
		});
		expect(openGroupLabels(container)).toEqual([]);
	});
});

/**
 * The rail's WIDTH owns group open-state.
 *
 * The seeding above used to run exactly once, when the key set was first
 * built, and never read the collapsed state. Two field-reported defects fell
 * out of that, and they are the first two tests here:
 *
 *  - a host that resolves its collapsed state in onMount (the localStorage
 *    path, where `sidebarOpen` is still nominally true at script init) seeded
 *    the active group OPEN and then collapsed around it, leaving an open
 *    group behind a collapsed rail;
 *  - expanding the rail again re-seeded nothing, so the active group stayed
 *    shut exactly when there was finally room to show it.
 *
 * A consumer worked around both from outside with a timed DOM-click loop.
 * These pin the behaviour so it does not need working around.
 */
describe('AppSidebar group open-state follows the rail width', () => {
	it('does not leave the active group open behind a collapsed rail', () => {
		const { container } = render(AppSidebar, {
			props: { config: groupedConfig(), activeUrl: '/app/devices/42', initialOpen: false }
		});
		expect(openGroupLabels(container)).toEqual([]);
	});

	it('closes the group its own seed opened when onMount restores a collapsed rail', async () => {
		// The exact reported path: no `initialOpen`, so `sidebarOpen` starts
		// true and the seed runs while the rail is nominally open; onMount then
		// reads localStorage and collapses. Before the fix the group stayed
		// open, its labels faded to opacity 0 by the collapsed CSS — which
		// reads as unexplained blank space in the rail, not as an open group.
		localStorage.setItem('test.sidebarOpen', 'false');
		const config: SidebarConfig = { ...groupedConfig(), storageKey: 'test.sidebarOpen' };
		const { container } = render(AppSidebar, {
			props: { config, activeUrl: '/app/devices/42' }
		});
		await waitFor(() => {
			expect(container.querySelector('.app-sidebar.collapsed')).not.toBeNull();
		});
		expect(openGroupLabels(container)).toEqual([]);
		localStorage.removeItem('test.sidebarOpen');
	});

	it('opens the group holding the current page when the rail is expanded', async () => {
		const { container, getByLabelText } = render(AppSidebar, {
			props: { config: groupedConfig(), activeUrl: '/app/devices/42', initialOpen: false }
		});
		expect(openGroupLabels(container)).toEqual([]);

		await fireEvent.click(getByLabelText('Expand sidebar'));

		await waitFor(() => {
			expect(openGroupLabels(container).some((label) => label.includes('Devices'))).toBe(true);
		});
		expect(openGroupLabels(container).some((label) => label.includes('Alerts'))).toBe(false);
	});

	// NOTE: this one already passed before the open-state fix — `toggleSidebar`
	// has always called `resetDropdowns()` on the way down. It is a regression
	// guard for that path, not evidence for the fix. What was missing is the
	// case below it: collapsing WITHOUT going through the toggle (the onMount
	// localStorage restore) left the groups open, which is the reported bug.
	it('closes every group when the rail collapses', async () => {
		const { container, getByLabelText } = render(AppSidebar, {
			props: { config: groupedConfig(), activeUrl: '/app/devices/42', initialOpen: true }
		});
		expect(openGroupLabels(container).some((label) => label.includes('Devices'))).toBe(true);

		await fireEvent.click(getByLabelText('Collapse sidebar'));

		await waitFor(() => {
			expect(openGroupLabels(container)).toEqual([]);
		});
	});

	it('opens a section’s group when navigation lands inside it', async () => {
		// A closed group renders no sub-items at all, so without this the
		// active item has no element to highlight and the rail does not
		// participate in showing where you are.
		const { container, rerender } = render(AppSidebar, {
			props: { config: groupedConfig(), activeUrl: '/app/devices/42', initialOpen: true }
		});
		expect(openGroupLabels(container).some((label) => label.includes('Alerts'))).toBe(false);

		await rerender({ config: groupedConfig(), activeUrl: '/app/alerts', initialOpen: true });

		await waitFor(() => {
			expect(openGroupLabels(container).some((label) => label.includes('Alerts'))).toBe(true);
		});
	});

	it('leaves a group the user opened by hand open across a navigation', async () => {
		// Opening is additive: only collapsing the rail closes things. A
		// navigation that closed the sibling groups would silently undo the
		// user's own arrangement of the rail.
		const { container, getByText, rerender } = render(AppSidebar, {
			props: { config: groupedConfig(), activeUrl: '/settings', initialOpen: true }
		});
		expect(openGroupLabels(container)).toEqual([]);

		await fireEvent.click(getByText('Alerts'));
		await waitFor(() => {
			expect(openGroupLabels(container).some((label) => label.includes('Alerts'))).toBe(true);
		});

		await rerender({ config: groupedConfig(), activeUrl: '/app/devices/42', initialOpen: true });

		await waitFor(() => {
			expect(openGroupLabels(container).some((label) => label.includes('Devices'))).toBe(true);
		});
		expect(openGroupLabels(container).some((label) => label.includes('Alerts'))).toBe(true);
	});
});
