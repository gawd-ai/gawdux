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
