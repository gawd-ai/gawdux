import { cleanup, render } from '@testing-library/svelte';
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
