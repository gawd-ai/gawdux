import { cleanup, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import PageTabsBelowHarness from './fixtures/PageTabsBelowHarness.svelte';

afterEach(() => cleanup());

describe('PageTabs `below` slot (additive merge)', () => {
	it('renders existing usage unchanged when no below slot is given', () => {
		const { container } = render(PageTabsBelowHarness, { props: { withBelow: false } });

		const shell = container.querySelector('.context-surface.page-tabs-shell');
		expect(shell).not.toBeNull();
		expect(screen.getByTestId('tab-body').textContent).toBe('first tab body');
		expect(screen.queryByTestId('below-content')).toBeNull();
		// The shell contains exactly the Tabs output (tab strip + content pane)
		// — an empty below slot adds no stray elements.
		expect(shell?.childElementCount).toBe(2);
	});

	it('renders persistent below content inside the same panel chrome, after the tabs', () => {
		const { container } = render(PageTabsBelowHarness, { props: { withBelow: true } });

		const shell = container.querySelector('.context-surface.page-tabs-shell')!;
		const below = screen.getByTestId('below-content');
		expect(shell.contains(below)).toBe(true);
		expect(below.textContent).toBe('persistent console');
		// Below content sits after the tab strip/content, as the panel's last region.
		expect(shell.lastElementChild?.contains(below) || shell.lastElementChild === below).toBe(
			true
		);
		// The tab machinery is unaffected.
		expect(screen.getByTestId('tab-body').textContent).toBe('first tab body');
	});
});

import PageTabsStatusHarness from './fixtures/PageTabsStatusHarness.svelte';
import postcss from 'postcss';
import tokens from '../src/lib/styles/tokens.css?raw';

describe("PageTabs draws the page's status at the end of its tab strip", () => {
	it('draws the status its host states once, in the first strip, after the tabs', () => {
		const { container } = render(PageTabsStatusHarness, { props: { nested: true } });
		const statuses = container.querySelectorAll('[data-page-status]');
		expect(statuses).toHaveLength(1);
		const status = statuses[0] as HTMLElement;
		expect(status.textContent?.trim()).toBe('Active');
		expect(status.tagName).toBe('LI');
		expect(status.getAttribute('role')).toBe('presentation');
		// In the page's own tab strip, after its tabs.
		const strip = status.parentElement!;
		expect(strip.classList.contains('page-tabs-list')).toBe(true);
		expect(strip.lastElementChild).toBe(status);
		expect(strip.querySelectorAll('[role="tab"]').length).toBeGreaterThan(0);
	});

	it('draws nothing for a page without a status, or without a host', () => {
		const { container } = render(PageTabsStatusHarness, { props: { status: null } });
		expect(container.querySelector('[data-page-status]')).toBeNull();
		cleanup();
		const plain = render(PageTabsBelowHarness, { props: { withBelow: false } });
		expect(plain.container.querySelector('[data-page-status]')).toBeNull();
	});

	it('keeps the status at the end of the strip and in sight while the tabs scroll', () => {
		const root = postcss.parse(tokens);
		const decls = (selector: string, media: string | null) => {
			const found: Record<string, string> = {};
			root.walkRules((rule) => {
				const parent = rule.parent as { type?: string; params?: string } | undefined;
				const inMedia = parent?.type === 'atrule' ? (parent.params ?? null) : null;
				if (inMedia !== media || !rule.selectors.map((s) => s.trim()).includes(selector)) return;
				rule.walkDecls((decl) => {
					found[decl.prop] = decl.value;
				});
			});
			return found;
		};
		expect(decls('.page-tabs-list > .page-tabs-status', null)).toMatchObject({
			'margin-inline-start': 'auto',
			'flex-shrink': '0'
		});
		expect(decls('.page-tabs-list > .page-tabs-status', '(max-width: 1024px)')).toMatchObject({
			position: 'sticky',
			right: '0'
		});
	});
});
