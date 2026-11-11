import postcss, { type AtRule, type Root } from 'postcss';
import { describe, expect, it } from 'vitest';
import source from '../src/lib/styles/tokens.css?raw';
import packaged from '../dist/styles/tokens.css?raw';

// The shell's nesting on a phone and the command bar with nothing to hold,
// read from the stylesheet as written and as packaged. jsdom lays nothing
// out; the geometry these rules draw (the panel from edge to edge, the first
// content 8px in, no empty strip along the bottom) is measured in a real
// browser by the hosts that use them.

const NARROW = '(max-width: 1024px)';

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
				if (child.type === 'decl') found[child.prop] = child.value.replace(/\s+/g, ' ');
			});
		});
	}
	return found;
}

for (const [name, css] of [
	['tokens.css', source],
	['the packaged tokens.css', packaged]
] as const) {
	const root = postcss.parse(css);
	const narrow = mediaBlocks(root, NARROW);

	describe(`tight levels zero and one at the compact width (${name})`, () => {
		it('names level one 8px and gives it to every inset host there', () => {
			expect(declarations([root], ':root')).toMatchObject({
				'--gawdux-compact-inset': 'calc(var(--spacing, 0.25rem) * 2)',
				'--gawdux-page-inset': 'calc(var(--spacing, 0.25rem) * 4)'
			});
			expect(declarations(narrow, ':root')).toMatchObject({
				'--gawdux-page-inset': 'var(--gawdux-compact-inset)'
			});
			expect(declarations(narrow, '.filter-bar')).toEqual({
				'padding-inline': 'var(--gawdux-compact-inset)'
			});
		});

		it('runs the outermost panel, the tabs nested in it and the command bar edge to edge', () => {
			const edge = {
				'border-left-width': '0',
				'border-right-width': '0',
				'border-radius': '0',
				'box-shadow': 'none'
			};
			expect(
				declarations(narrow, 'main .context-surface:not(.context-surface .context-surface)')
			).toEqual(edge);
			expect(declarations(narrow, 'main .context-surface .page-tabs-shell.context-surface')).toEqual(
				edge
			);
			expect(declarations(narrow, 'main .page-command-bar')).toEqual({
				'border-left-width': '0',
				'border-right-width': '0',
				'border-bottom-width': '0',
				'border-radius': '0',
				'box-shadow': 'none'
			});
		});

		it("makes MasterDetailShell's card the panel's content, edge to edge, its panes carrying level one", () => {
			expect(declarations(narrow, '.master-detail-inset')).toEqual({
				margin: '0',
				padding: '0',
				height: '100%'
			});
			// Inside an inset host it spans the host's padding box.
			expect(
				declarations(
					narrow,
					':is(.scroll-surface, .editable-page-body, .page-inset, .tab-fill-scroll) .master-detail-inset'
				)
			).toEqual({
				margin: 'calc(-1 * var(--gawdux-page-inset))',
				padding: '0',
				height: 'calc(100% + 2 * var(--gawdux-page-inset))'
			});
			expect(declarations(narrow, '.master-detail-card')).toEqual({
				'min-height': '100%',
				'border-width': '0',
				'border-radius': '0'
			});
		});
	});

	describe(`a command bar with nothing to hold (${name})`, () => {
		it('is not drawn', () => {
			expect(declarations([root], '.page-command-bar:not(:has(.cmd-bar-zone > *))')).toEqual({
				display: 'none'
			});
		});

		it('leaves the surface its own bottom edge: only a drawn bar takes it', () => {
			expect(declarations([root], 'main:has(.page-command-bar .cmd-bar-zone > *) .context-surface')).toEqual({
				'border-bottom-left-radius': '0',
				'border-bottom-right-radius': '0',
				'border-bottom-width': '0'
			});
			// The panel still reaches the bottom of the column.
			expect(declarations([root], 'main:has(.page-command-bar) .context-surface')).toMatchObject({
				display: 'flex',
				flex: '1 1 auto'
			});
			expect(declarations([root], 'main:has(.page-command-bar) .context-surface')).not.toHaveProperty(
				'border-bottom-width'
			);
		});
	});
}
