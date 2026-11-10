import { cleanup, render, screen } from '@testing-library/svelte';
import postcss, { type AtRule, type Root } from 'postcss';
import { afterEach, describe, expect, it } from 'vitest';
import source from '../src/lib/styles/tokens.css?raw';
import packaged from '../dist/styles/tokens.css?raw';
import ShellBarHarness from './fixtures/ShellBarHarness.svelte';
import * as primitives from '../src/lib/primitives/index';
import { SHELL_BAR_QUERY, SHELL_BAR_SPACE_VAR } from '../src/lib/primitives/shell-bar';

// The phone shell's one bar along the bottom of the screen: an occupant's
// controls (a chat rail) first, the host's account controls at its end.
// jsdom lays nothing out, so the layout is read from the stylesheet as written
// and as packaged; the geometry it draws (one row, every control 44px, clear
// of the safe-area inset, fitting 360px) is measured in a real browser by the
// hosts that use it.

const NARROW = '(max-width: 1024px)';
const WIDE = 'not all and (max-width: 1024px)';
const BAR = ".gawdux-shell-bar[data-shell-bar]";

function mediaBlocks(root: Root, params: string): AtRule[] {
	const found: AtRule[] = [];
	root.each((node) => {
		if (node.type === 'atrule' && node.name === 'media' && node.params === params) found.push(node);
	});
	return found;
}

function declarations(scopes: Array<Root | AtRule>, selector: string): Record<string, string> {
	const found: Record<string, string> = {};
	for (const scope of scopes) {
		scope.each((node) => {
			if (node.type !== 'rule' || !node.selectors.map((s) => s.trim()).includes(selector)) return;
			node.each((child) => {
				if (child.type === 'decl') found[child.prop] = child.value;
			});
		});
	}
	return found;
}

afterEach(() => cleanup());

describe('the shell bar names the width it shows at and the room it takes', () => {
	it('is a bar at the shell compact width', () => {
		expect(SHELL_BAR_QUERY).toBe(NARROW);
		expect(SHELL_BAR_SPACE_VAR).toBe('--gawdux-shell-bar-space');
		expect(primitives.SHELL_BAR_QUERY).toBe(NARROW);
		expect(primitives.ShellBar).toBeTruthy();
		expect(primitives.inShellBar).toBeTypeOf('function');
	});
});

for (const [name, css] of [
	['tokens.css', source],
	['the packaged tokens.css', packaged]
] as const) {
	const root = postcss.parse(css);
	const narrow = mediaBlocks(root, NARROW);
	const wide = mediaBlocks(root, WIDE);

	describe(`shell bar layout (${name})`, () => {
		it('names its height and the safe-area inset below it as the room a host leaves', () => {
			expect(declarations([root], ':root')).toMatchObject({
				'--gawdux-shell-bar-height': '48px',
				'--gawdux-shell-bar-space':
					'calc(var(--gawdux-shell-bar-height) + env(safe-area-inset-bottom, 0px))'
			});
		});

		it('at the compact width is one row along the bottom of the screen, clear of the inset', () => {
			expect(declarations(narrow, BAR)).toMatchObject({
				position: 'fixed',
				'inset-inline': '0',
				bottom: '0',
				display: 'flex',
				'flex-direction': 'row',
				'align-items': 'center',
				width: 'auto',
				height: 'var(--gawdux-shell-bar-space)',
				'padding-bottom': 'env(safe-area-inset-bottom, 0px)'
			});
			// The occupant's groups give their controls to the bar's one row, each
			// centred in an equal share of the room; a part that belongs to a
			// column is not drawn.
			expect(declarations(narrow, `${BAR} > [data-shell-bar-group]`)).toEqual({ display: 'contents' });
			expect(declarations(narrow, `${BAR} > [data-shell-bar-group] > *`)).toEqual({
				'margin-inline': 'auto'
			});
			expect(declarations(narrow, `${BAR} > [data-shell-bar-column]`)).toEqual({ display: 'none' });
		});

		it("keeps the host's end at the bar's right end, whether anything occupies the bar or not", () => {
			expect(declarations(narrow, `${BAR} > .gawdux-shell-bar-end`)).toEqual({
				display: 'flex',
				flex: '0 0 auto',
				'align-items': 'center',
				gap: '0.25rem',
				'margin-inline-start': 'auto',
				'padding-inline-end': '0.25rem'
			});
		});

		it('keeps a 44px target for every control in it, and none in a sheet it opens', () => {
			expect(
				declarations(
					narrow,
					`${BAR} :is(button, a[href], [role='button']):not(.gawdux-shell-bar-sheet *)`
				)
			).toMatchObject({ 'min-width': '44px', 'min-height': '44px' });
		});

		it('opens a menu or a panel upward, above the bar, inside the screen gutter', () => {
			expect(declarations(narrow, '.gawdux-shell-bar-sheet')).toMatchObject({
				position: 'fixed',
				'inset-inline': '0.5rem',
				bottom: 'calc(var(--gawdux-shell-bar-space) + 0.5rem)',
				'overflow-y': 'auto'
			});
			// Open, the bar stands above the page's own floating layers.
			expect(declarations(narrow, `${BAR}:has(.gawdux-shell-bar-sheet)`)).toMatchObject({
				'z-index': '90'
			});
		});

		it('above the compact width draws no bar of its own and hides the host end of a column', () => {
			expect(declarations(wide, ".gawdux-shell-bar[data-shell-bar='hidden']")).toEqual({ display: 'none' });
			expect(declarations(wide, '.gawdux-shell-bar > .gawdux-shell-bar-end')).toEqual({ display: 'none' });
			// A column keeps its owner's layout there.
			expect(declarations(wide, ".gawdux-shell-bar[data-shell-bar='column']")).toEqual({});
		});
	});
}

describe('ShellBar', () => {
	it("holds the occupant's controls first, then the host's at its end", () => {
		render(ShellBarHarness);
		const bar = screen.getByTestId('bar');
		expect(bar.classList.contains('gawdux-shell-bar')).toBe(true);
		expect(bar.getAttribute('data-shell-bar')).toBe('hidden');
		expect(Array.from(bar.querySelectorAll('button'), (b) => b.textContent)).toEqual([
			'Show chat',
			'Channels',
			'Notices',
			'Account'
		]);
		expect(bar.lastElementChild?.classList.contains('gawdux-shell-bar-end')).toBe(true);
	});

	it('tells a control at its end that it sits in the bar, and one outside that it does not', () => {
		render(ShellBarHarness);
		const probes = Array.from(document.querySelectorAll<HTMLElement>('[data-in-bar]'));
		expect(probes.map((probe) => probe.dataset.inBar)).toEqual(['yes', 'no']);
	});

	it("is a column's bar when an occupant keeps its column above the compact width", () => {
		render(ShellBarHarness, { props: { wide: 'column' } });
		expect(screen.getByTestId('bar').getAttribute('data-shell-bar')).toBe('column');
	});

	it("holds the host's controls alone when nothing occupies it", () => {
		render(ShellBarHarness, { props: { occupant: false } });
		expect(Array.from(screen.getByTestId('bar').querySelectorAll('button'), (b) => b.textContent)).toEqual([
			'Notices',
			'Account'
		]);
	});
});
