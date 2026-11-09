import postcss, { type AtRule, type Root } from 'postcss';
import { describe, expect, it } from 'vitest';
import source from '../src/lib/styles/tokens.css?raw';
import packaged from '../dist/styles/tokens.css?raw';

// The page command bar's layout, read from the stylesheet as written and as
// packaged. jsdom has no layout, so these hold the rules; the geometry they
// produce (one centred row while the zones fit; when they do not, the words on
// a line of their own above the actions, centred, wrapping as whole buttons)
// was measured in real browsers.

const NARROW = '(max-width: 1024px)';
// Every width the narrow query does not match, fractional widths included: a
// zoomed browser can be 1024.5px wide, which neither `(max-width: 1024px)`
// nor `(min-width: 1025px)` matches.
const WIDE = 'not all and (max-width: 1024px)';

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

const LEFT = '.page-command-bar > .cmd-bar-left';
const CENTER = '.page-command-bar > .cmd-bar-center';
const RIGHT = '.page-command-bar > .cmd-bar-right';

for (const [name, css] of [
	['tokens.css', source],
	['the packaged tokens.css', packaged]
] as const) {
	const root = postcss.parse(css);
	const wide = mediaBlocks(root, WIDE);
	const narrow = mediaBlocks(root, NARROW);

	describe(`page command bar layout (${name})`, () => {
		it('switches layout at one boundary, so a fractional width between 1024 and 1025px still gets one', () => {
			expect(wide.length).toBeGreaterThan(0);
			// Width queries holding bar rules; the touch-target sizing that also
			// reaches bar links is a pointer query, not a layout one.
			const barRules: string[] = [];
			root.walkAtRules('media', (media) => {
				if (media.params.includes('pointer')) return;
				media.walkRules((rule) => {
					if (/page-command-bar|cmd-bar-/.test(rule.selector)) barRules.push(media.params);
				});
			});
			expect([...new Set(barRules)].sort()).toEqual([NARROW, WIDE].sort());
		});

		it('above it is a reversed wrapping row: the words wrap away first and sit on top', () => {
			expect(declarations(wide, '.page-command-bar')).toMatchObject({
				display: 'flex',
				'flex-flow': 'row-reverse wrap-reverse',
				gap: '0.5rem 0'
			});
			// Reversed twice (the order and the direction), the zones still read
			// left, center, right across one row, and top to bottom in document
			// order once they wrap; the row now fills from the right, so the left
			// zone is the one that leaves for a line of its own.
			expect(declarations(wide, RIGHT)).toMatchObject({ order: '-1' });
			expect(declarations(wide, LEFT)).toMatchObject({ order: '1' });
		});

		it('gives each side zone half a share, never less than its words up to the bar width', () => {
			// Equal shares centre the actions in a row that fits, as `1fr auto 1fr`
			// did. At half a share each, a side zone alone beside the actions takes
			// only half the free space; the other half is what centres them on
			// their own line.
			for (const side of [LEFT, RIGHT]) {
				expect(declarations(wide, side), side).toMatchObject({
					flex: '0.5 1 0',
					'min-width': 'fit-content',
					'white-space': 'normal'
				});
			}
			// A filled left zone alone on its line keeps to the left edge.
			expect(declarations(wide, '.page-command-bar > .cmd-bar-left:has(> *)')).toEqual({ 'margin-right': 'auto' });
			// Words wrap at the bar's edge instead of ending in an ellipsis.
			expect(declarations(wide, '.page-command-bar > :is(.cmd-bar-left, .cmd-bar-right) .truncate')).toEqual({
				'white-space': 'normal'
			});
		});

		it('wraps the actions as whole buttons, centred, and carries the space between the zones', () => {
			expect(declarations(wide, CENTER)).toEqual({
				flex: '0 1 auto',
				'flex-wrap': 'wrap',
				'max-width': '100%',
				'padding-inline': '1rem'
			});
			expect(declarations(wide, '.page-command-bar > .cmd-bar-zone > :is(button, a)')).toEqual({
				'flex-shrink': '0',
				'white-space': 'nowrap'
			});
			// Beside an empty left zone the free space goes after the actions.
			expect(declarations(wide, '.page-command-bar > .cmd-bar-left:not(:has(> *)) ~ .cmd-bar-center')).toEqual({
				'margin-right': 'auto'
			});
			// An empty center only spaces two filled sides.
			expect(
				declarations(
					wide,
					'.page-command-bar:is(:not(:has(> .cmd-bar-left > *)), :not(:has(> .cmd-bar-right > *))) > .cmd-bar-center:not(:has(> *))'
				)
			).toEqual({ display: 'none' });
		});

		it('leaves the bar chrome and the drawer seam to the rules every width shares', () => {
			expect(Object.keys(declarations(wide, '.page-command-bar')).filter((prop) => /^(margin|border|padding|background)/.test(prop))).toEqual(
				[]
			);
		});

		it('below it stacks the zones and wraps each in the house order, never panning', () => {
			expect(declarations([root], '.page-command-bar').display).toBe('grid');
			expect(declarations(narrow, '.page-command-bar')).toMatchObject({
				'grid-template-columns': 'minmax(0, 1fr)',
				gap: '0.5rem'
			});
			// A zone wraps its commands onto another line instead of scrolling
			// them sideways: every command shows, in the order the host gave.
			const zone = declarations(narrow, '.cmd-bar-zone');
			expect(zone).toMatchObject({
				'flex-wrap': 'wrap',
				overflow: 'visible',
				'white-space': 'normal',
				'max-width': '100%'
			});
			expect(zone).not.toHaveProperty('overflow-x');
			expect(zone).not.toHaveProperty('flex-direction');
			expect(zone).not.toHaveProperty('order');
			// A command keeps its label on one line; a zone's words (a status
			// line, a chip) wrap whole rather than end in an ellipsis.
			expect(declarations(narrow, '.page-command-bar > .cmd-bar-zone > :is(button, a)')).toEqual({
				'flex-shrink': '0',
				'white-space': 'nowrap'
			});
			expect(declarations(narrow, '.page-command-bar > :is(.cmd-bar-left, .cmd-bar-right) .truncate')).toEqual({
				overflow: 'visible',
				'text-overflow': 'clip',
				'white-space': 'normal'
			});
			// The base left zone pans at every width the narrow query does not
			// override; below the boundary nothing in the bar scrolls sideways.
			for (const media of narrow)
				media.walkRules((rule) => {
					if (!/page-command-bar|cmd-bar-/.test(rule.selector)) return;
					rule.walkDecls((decl) => {
						if (/^overflow(-x)?$/.test(decl.prop))
							expect(decl.value, `${rule.selector} ${decl}`).toBe('visible');
					});
				});
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
