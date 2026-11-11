import { cleanup, render } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import PaneHeaderHarness from './fixtures/PaneHeaderHarness.svelte';
import source from '../src/lib/primitives/PaneHeader.svelte?raw';

afterEach(() => cleanup());

// A pane header reads in one order at every width: the item's icon, its
// name, its state, then the controls; the state 8px after the title above
// the compact width, and at or below it the leading control and the icon on
// 44px columns with the state 8px after the icon's glyph.

describe('PaneHeader', () => {
	it('reads icon, title, state, then the controls', () => {
		const { container } = render(PaneHeaderHarness, {
			props: { withStatus: true }
		});
		const header = container.querySelector('[data-pane-header]') as HTMLElement;
		const order = [
			...header.querySelectorAll(
				'[data-pane-leading], [data-pane-icon], [data-pane-title], [data-pane-status], [data-pane-actions]'
			)
		].map((node) => [...node.attributes].find((a) => a.name.startsWith('data-pane-'))!.name);
		expect(order).toEqual([
			'data-pane-leading',
			'data-pane-icon',
			'data-pane-title',
			'data-pane-status',
			'data-pane-actions'
		]);
		// The state sits on the title's line, not among the controls.
		const line = header.querySelector('[data-pane-title]')!.parentElement!;
		expect(line.querySelector('[data-pane-status]')).toBeTruthy();
		expect(header.querySelector('[data-pane-actions] [data-pane-status]')).toBeNull();
	});

	it('claims the page’s status and draws it when it is given none', () => {
		const { container } = render(PaneHeaderHarness, {
			props: { pageStatus: 'Running' }
		});
		expect(container.querySelector('[data-pane-status]')?.textContent?.trim()).toBe('Running');
		// The tab strip under it draws none: the header holds the claim.
		expect(container.querySelector('[data-page-status]')).toBeNull();
	});

	it('is bare with nothing to hold at the compact width', () => {
		const { container } = render(PaneHeaderHarness, { props: { bare: true } });
		expect(container.querySelector('[data-pane-header]')?.hasAttribute('data-pane-bare')).toBe(
			true
		);
	});

	it('lays the compact row on 44px columns, the state 8px after the icon’s glyph', () => {
		const css = source.slice(source.indexOf('<style>'));
		const compact = css.slice(css.indexOf('@media (max-width: 1024px)'));
		expect(compact).toMatch(/\.gawdux-pane-header-icon \{\s*width: 2\.75rem;\s*height: 2\.75rem;/);
		expect(compact).toContain(
			'margin-inline-start: calc((var(--gawdux-icon-size, 1.25rem) - 2.75rem) / 2 + 0.5rem);'
		);
		expect(compact).toMatch(
			/\.gawdux-pane-header-title,\s*\.gawdux-pane-header-subtitle \{\s*display: none;/
		);
		// Above it, the state 8px after the title.
		expect(css).toMatch(/\.gawdux-pane-header-line \{[^}]*gap: 0\.5rem;/);
	});
});
