import postcss, { type AtRule, type Root } from 'postcss';
import { describe, expect, it } from 'vitest';
import source from '../src/lib/styles/tokens.css?raw';
import packaged from '../dist/styles/tokens.css?raw';

// The page command bar's layout, read from the stylesheet as written and as
// packaged. jsdom has no layout, so these hold the rules; the geometry they
// produce (one centred row while the zones fit, a wrapped row instead of a
// clipped zone when they do not) was measured in a real browser.

const WIDE = '(min-width: 1025px)';
const NARROW = '(max-width: 1024px)';

/** Top-level @media blocks with exactly these params. */
function mediaBlocks(root: Root, params: string): AtRule[] {
	const found: AtRule[] = [];
	root.each((node) => {
		if (node.type === 'atrule' && node.name === 'media' && node.params === params) found.push(node);
	});
	return found;
}

/** The declarations of every rule listing `selector` directly inside the scopes, later ones winning. */
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

for (const [name, css] of [
	['tokens.css', source],
	['the packaged tokens.css', packaged]
] as const) {
	const root = postcss.parse(css);
	const wide = mediaBlocks(root, WIDE);
	const narrow = mediaBlocks(root, NARROW);

	describe(`page command bar layout (${name})`, () => {
		it('above the stacking width is a wrapping row whose side zones never shrink below their content', () => {
			expect(declarations(wide, '.page-command-bar')).toMatchObject({
				display: 'flex',
				'flex-wrap': 'wrap',
				gap: '0.5rem 1rem'
			});
			// Left and right share the free space equally, as `1fr auto 1fr` did,
			// so a bar that fits keeps its centred row; unlike a 1fr track they
			// cannot be squeezed under their own words.
			for (const side of ['.page-command-bar > .cmd-bar-left', '.page-command-bar > .cmd-bar-right']) {
				expect(declarations(wide, side), side).toMatchObject({ flex: '1 1 0', 'min-width': 'max-content' });
			}
			// The center keeps its content width and is what moves to its own
			// line when the three zones cannot share one.
			expect(declarations(wide, '.page-command-bar > .cmd-bar-center')).toEqual({ flex: '0 1 auto' });
		});

		it('leaves the chrome and the drawer seam to the rules every width shares', () => {
			const props: string[] = [];
			for (const block of wide) {
				block.walkRules((rule) => {
					if (!/page-command-bar|cmd-bar-/.test(rule.selector)) return;
					rule.walkDecls((decl) => void props.push(decl.prop));
				});
			}
			expect(props.length).toBeGreaterThan(0);
			expect(props.filter((prop) => /^(margin|border|padding|background)/.test(prop))).toEqual([]);
		});

		it('below it keeps the stacked grid, each zone panning on its own', () => {
			expect(declarations([root], '.page-command-bar').display).toBe('grid');
			expect(declarations(narrow, '.page-command-bar')).toMatchObject({
				'grid-template-columns': 'minmax(0, 1fr)',
				gap: '0.5rem'
			});
			expect(declarations(narrow, '.cmd-bar-zone')).toMatchObject({ 'overflow-x': 'auto', 'max-width': '100%' });
		});

		it('still fuses an attached drawer with the bar', () => {
			expect(declarations([root], '.page-command-drawer')['border-bottom-width']).toBe('0');
			for (const selector of [
				'main:has(.page-command-drawer) .page-command-bar',
				'.page-shell:has(> main .page-command-drawer) > .page-command-bar'
			]) {
				expect(declarations([root], selector), selector).toMatchObject({
					'margin-top': '0',
					'border-top-left-radius': '0',
					'border-top-right-radius': '0',
					'border-top-width': '0'
				});
			}
		});
	});
}
