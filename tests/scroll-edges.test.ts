import postcss from 'postcss';
import { describe, expect, it } from 'vitest';
import { scrollEdges, scrollFadeOf } from '../src/lib/primitives/scroll-edges';
import tokens from '../src/lib/styles/tokens.css?raw';
import packaged from '../dist/styles/tokens.css?raw';

// A strip that scrolls sideways says so one way: the edge where more lies
// fades. jsdom lays nothing out, so the strip's sizes are stated here; the
// fade as drawn is measured in a real browser by the hosts that use it.

function strip(sizes: { scrollLeft: number; scrollWidth: number; clientWidth: number }) {
	const node = document.createElement('div');
	let left = sizes.scrollLeft;
	Object.defineProperty(node, 'scrollWidth', { configurable: true, get: () => sizes.scrollWidth });
	Object.defineProperty(node, 'clientWidth', { configurable: true, get: () => sizes.clientWidth });
	Object.defineProperty(node, 'scrollLeft', {
		configurable: true,
		get: () => left,
		set: (value: number) => {
			left = value;
		}
	});
	document.body.append(node);
	return node;
}

describe('scrollFadeOf', () => {
	it('shows no fade while the strip shows all of itself', () => {
		expect(scrollFadeOf({ scrollLeft: 0, scrollWidth: 300, clientWidth: 300 })).toBeNull();
		expect(scrollFadeOf({ scrollLeft: 0, scrollWidth: 301, clientWidth: 300 })).toBeNull();
	});

	it('fades the side where more lies, and both in the middle', () => {
		expect(scrollFadeOf({ scrollLeft: 0, scrollWidth: 600, clientWidth: 300 })).toBe('end');
		expect(scrollFadeOf({ scrollLeft: 150, scrollWidth: 600, clientWidth: 300 })).toBe('both');
		expect(scrollFadeOf({ scrollLeft: 300, scrollWidth: 600, clientWidth: 300 })).toBe('start');
	});

	it('reads a right-to-left strip from its right edge', () => {
		expect(scrollFadeOf({ scrollLeft: -300, scrollWidth: 600, clientWidth: 300 })).toBe('start');
		expect(scrollFadeOf({ scrollLeft: 0, scrollWidth: 600, clientWidth: 300 })).toBe('end');
	});
});

describe('scrollEdges', () => {
	it('marks the strip with its fade and follows its scroll', () => {
		const node = strip({ scrollLeft: 0, scrollWidth: 600, clientWidth: 300 });
		const edges = scrollEdges(node);
		expect(node.classList.contains('gawdux-scroll-fade')).toBe(true);
		expect(node.dataset['scrollFade']).toBe('end');
		node.scrollLeft = 120;
		node.dispatchEvent(new Event('scroll'));
		expect(node.dataset['scrollFade']).toBe('both');
		node.scrollLeft = 300;
		node.dispatchEvent(new Event('scroll'));
		expect(node.dataset['scrollFade']).toBe('start');
		edges.destroy();
		expect(node.classList.contains('gawdux-scroll-fade')).toBe(false);
		expect(node.dataset['scrollFade']).toBeUndefined();
		node.remove();
	});

	it('carries no mark on a strip that fits', () => {
		const node = strip({ scrollLeft: 0, scrollWidth: 300, clientWidth: 300 });
		const edges = scrollEdges(node);
		expect(node.hasAttribute('data-scroll-fade')).toBe(false);
		edges.destroy();
		node.remove();
	});
});

for (const [name, css] of [
	['tokens.css', tokens],
	['the packaged tokens.css', packaged]
] as const) {
	describe(`the fade is the strip's own mask (${name})`, () => {
		const root = postcss.parse(css);
		const decls = (selector: string) => {
			const found: Record<string, string> = {};
			root.walkRules((rule) => {
				if (rule.parent?.type !== 'root') return;
				if (!rule.selectors.map((s) => s.trim()).includes(selector)) return;
				rule.walkDecls((decl) => {
					found[decl.prop] = decl.value.replace(/\s+/g, ' ');
				});
			});
			return found;
		};

		it('fades the end, the start or both, and draws nothing over the strip', () => {
			expect(decls(".gawdux-scroll-fade[data-scroll-fade='end']")['--gawdux-scroll-fade-mask']).toMatch(
				/^linear-gradient\( ?to right, #000 calc\(100% - var\(--gawdux-scroll-fade-size\)\), transparent ?\)$/
			);
			expect(decls(".gawdux-scroll-fade[data-scroll-fade='start']")['--gawdux-scroll-fade-mask']).toMatch(
				/^linear-gradient\( ?to left,/
			);
			expect(decls(".gawdux-scroll-fade[data-scroll-fade='both']")['--gawdux-scroll-fade-mask']).toMatch(
				/^linear-gradient\( ?to right, transparent,/
			);
			expect(decls('.gawdux-scroll-fade[data-scroll-fade]')).toMatchObject({
				'mask-image': 'var(--gawdux-scroll-fade-mask)'
			});
		});

		it("keeps a tab strip's rule along its bottom whole", () => {
			expect(decls('.gawdux-tab-strip.gawdux-scroll-fade[data-scroll-fade]')).toMatchObject({
				'mask-image': 'var(--gawdux-scroll-fade-mask), linear-gradient(#000 0 0)',
				'mask-size': '100% 100%, 100% 1px',
				'mask-position': '0 0, 0 100%'
			});
		});
	});
}
