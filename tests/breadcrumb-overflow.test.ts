import { describe, expect, it } from 'vitest';
import {
	BREADCRUMB_LEAF_MIN_PX,
	breadcrumbCollapseOrder,
	breadcrumbLeafMin,
	breadcrumbNeed,
	planBreadcrumbOverflow,
	type BreadcrumbOverflowMeasure
} from '../src/lib/primitives/breadcrumb-overflow';

// A five-level trail: a first crumb with its icon (36px of icon), three
// levels on the way, the current page, a chip beside it. Every separator is
// 24px; the overflow button is 24px alone, 48px with its separator. Full
// width: 126 + 114 + 174 + 94 + 294 + 80 = 882.
const TRAIL: BreadcrumbOverflowMeasure = {
	available: Infinity,
	crumbs: [126, 114, 174, 94, 294],
	more: 48,
	moreLead: 24,
	firstCompact: 36,
	trailing: 80
};

const plan = (available: number, over: Partial<BreadcrumbOverflowMeasure> = {}) =>
	planBreadcrumbOverflow({ ...TRAIL, ...over, available });

describe('breadcrumbCollapseOrder', () => {
	it('has nothing to fold without a crumb between the first and the current page', () => {
		expect(breadcrumbCollapseOrder(0)).toEqual([]);
		expect(breadcrumbCollapseOrder(1)).toEqual([]);
		expect(breadcrumbCollapseOrder(2)).toEqual([]);
	});

	it('folds from the inside out, the root side first on a tie, so the parent goes last', () => {
		expect(breadcrumbCollapseOrder(3)).toEqual([1]);
		expect(breadcrumbCollapseOrder(4)).toEqual([1, 2]);
		expect(breadcrumbCollapseOrder(5)).toEqual([2, 1, 3]);
		expect(breadcrumbCollapseOrder(6)).toEqual([2, 3, 1, 4]);
		expect(breadcrumbCollapseOrder(7)).toEqual([3, 2, 4, 1, 5]);
	});

	it('always folds one contiguous run, so one button stands for it', () => {
		for (let count = 3; count <= 9; count++) {
			const order = breadcrumbCollapseOrder(count);
			for (let step = 1; step <= order.length; step++) {
				const run = order.slice(0, step).sort((a, b) => a - b);
				expect(run[run.length - 1]! - run[0]!, `${count} crumbs, ${step} folded`).toBe(step - 1);
			}
		}
	});
});

describe('planBreadcrumbOverflow', () => {
	it('folds nothing while the whole trail fits, its chip included', () => {
		expect(plan(882)).toEqual({ hidden: [], compactFirst: false, leafCut: false });
		expect(plan(Infinity)).toEqual({ hidden: [], compactFirst: false, leafCut: false });
	});

	it('counts the chip beside the current page', () => {
		expect(plan(882, { trailing: 0 }).hidden).toEqual([]);
		expect(plan(881).hidden).toEqual([2]);
		expect(plan(802, { trailing: 0 }).hidden).toEqual([]);
	});

	it('folds the crumbs on the way from the inside out until the trail fits', () => {
		// 882 - 174 + 48 = 756
		expect(plan(756)).toEqual({ hidden: [2], compactFirst: false, leafCut: false });
		// 756 - 114 = 642
		expect(plan(755).hidden).toEqual([1, 2]);
		expect(plan(642).hidden).toEqual([1, 2]);
		// 642 - 94 = 548
		expect(plan(641)).toEqual({ hidden: [1, 2, 3], compactFirst: false, leafCut: false });
		expect(plan(548)).toEqual({ hidden: [1, 2, 3], compactFirst: false, leafCut: false });
	});

	it('shows the first crumb as its icon alone once every crumb on the way is folded', () => {
		// 126 + 48 + 294 + 80 = 548 with the first crumb in words; 36 + 48 + 294 + 80 = 458 as its icon.
		expect(plan(547)).toEqual({ hidden: [1, 2, 3], compactFirst: true, leafCut: false });
		expect(plan(458)).toEqual({ hidden: [1, 2, 3], compactFirst: true, leafCut: false });
	});

	it('cuts the current page last of all', () => {
		for (let available = 458; available <= 900; available += 1) {
			expect(plan(available).leafCut, `${available}px`).toBe(false);
		}
		expect(plan(457)).toEqual({ hidden: [1, 2, 3], compactFirst: true, leafCut: true });
	});

	it('cuts the current page after the folding when the first crumb has no icon to stand for it', () => {
		expect(plan(548, { firstCompact: null })).toEqual({ hidden: [1, 2, 3], compactFirst: false, leafCut: false });
		expect(plan(547, { firstCompact: null })).toEqual({
			hidden: [1, 2, 3],
			compactFirst: false,
			leafCut: true
		});
	});

	it('gives way in a two-crumb trail without folding, there being nothing to fold', () => {
		const two = { crumbs: [126, 294] };
		expect(plan(500, two)).toEqual({ hidden: [], compactFirst: false, leafCut: false });
		// 36 + 294 + 80 = 410
		expect(plan(499, two)).toEqual({ hidden: [], compactFirst: true, leafCut: false });
		expect(plan(410, two)).toEqual({ hidden: [], compactFirst: true, leafCut: false });
		expect(plan(409, two)).toEqual({ hidden: [], compactFirst: true, leafCut: true });
	});

	it('cuts a single crumb when it alone does not fit, and never compacts it', () => {
		const one = { crumbs: [300] };
		expect(plan(380, one)).toEqual({ hidden: [], compactFirst: false, leafCut: false });
		expect(plan(100, one)).toEqual({ hidden: [], compactFirst: false, leafCut: true });
	});

	it('rounds a sub-pixel crumb up and the room down, so a plan that fits never ellipsizes', () => {
		const fractional = { crumbs: [10.2, 80.2], trailing: 0, firstCompact: null };
		expect(plan(92, fractional).leafCut).toBe(false);
		expect(plan(91.9, fractional).leafCut).toBe(true);
	});

	it('has nothing to plan for an empty trail', () => {
		expect(plan(10, { crumbs: [] })).toEqual({ hidden: [], compactFirst: false, leafCut: false });
	});
});

describe('the current page keeps a readable minimum', () => {
	const FOLDED_FIRST = { hidden: [0, 1, 2, 3], compactFirst: false, leafCut: true };

	it('is the page at its own width, up to a few characters', () => {
		expect(BREADCRUMB_LEAF_MIN_PX).toBe(64);
		expect(breadcrumbLeafMin(294)).toBe(64);
		expect(breadcrumbLeafMin(64)).toBe(64);
		expect(breadcrumbLeafMin(50.5)).toBe(50.5);
	});

	it('cuts the current page only down to its minimum', () => {
		// 36 + 48 + 64 + 80 = 228: the icon, the button, the page at its minimum, the chip.
		expect(plan(457)).toEqual({ hidden: [1, 2, 3], compactFirst: true, leafCut: true });
		expect(plan(228)).toEqual({ hidden: [1, 2, 3], compactFirst: true, leafCut: true });
	});

	it('folds the first crumb into the menu too before the page would go below it', () => {
		// 24 + 64 + 80 = 168: the button alone, the page at its minimum, the chip.
		expect(plan(227)).toEqual(FOLDED_FIRST);
		expect(plan(168)).toEqual(FOLDED_FIRST);
	});

	it('gives nothing more past the narrowest: the page holds its minimum', () => {
		expect(plan(167)).toEqual(FOLDED_FIRST);
		expect(plan(10)).toEqual(FOLDED_FIRST);
		expect(plan(0)).toEqual(FOLDED_FIRST);
	});

	it('reads the page whole again when folding the first crumb frees enough room', () => {
		// The narrow-pane case: four levels, no chip. 36 + 48 + 64 = 148 cuts
		// the page beside the icon; below it the first crumb folds, and
		// 24 + 94 = 118 holds the page whole.
		const four = { crumbs: [126, 114, 174, 94], trailing: 0 };
		expect(plan(148, four)).toEqual({ hidden: [1, 2], compactFirst: true, leafCut: true });
		expect(plan(147, four)).toEqual({ hidden: [0, 1, 2], compactFirst: false, leafCut: false });
		expect(plan(118, four)).toEqual({ hidden: [0, 1, 2], compactFirst: false, leafCut: false });
		expect(plan(117, four)).toEqual({ hidden: [0, 1, 2], compactFirst: false, leafCut: true });
		expect(plan(97, four)).toEqual({ hidden: [0, 1, 2], compactFirst: false, leafCut: true });
		expect(plan(88, four)).toEqual({ hidden: [0, 1, 2], compactFirst: false, leafCut: true });
	});

	it('folds a first crumb without an icon the same way, from its words', () => {
		// 126 + 48 + 64 + 80 = 318
		expect(plan(318, { firstCompact: null })).toEqual({ hidden: [1, 2, 3], compactFirst: false, leafCut: true });
		expect(plan(317, { firstCompact: null })).toEqual(FOLDED_FIRST);
	});

	it('folds the first crumb of a two-crumb trail into the button alone', () => {
		const two = { crumbs: [126, 294] };
		// 36 + 64 + 80 = 180
		expect(plan(180, two)).toEqual({ hidden: [], compactFirst: true, leafCut: true });
		expect(plan(179, two)).toEqual({ hidden: [0], compactFirst: false, leafCut: true });
	});

	it('never cuts a page no wider than its minimum: the first crumb folds instead', () => {
		const short = { crumbs: [126, 114, 174, 94, 50] };
		// 36 + 48 + 50 + 80 = 214 with the first crumb as its icon
		expect(plan(214, short)).toEqual({ hidden: [1, 2, 3], compactFirst: true, leafCut: false });
		// 24 + 50 + 80 = 154 with the first crumb folded
		expect(plan(213, short)).toEqual({ hidden: [0, 1, 2, 3], compactFirst: false, leafCut: false });
		expect(plan(100, short)).toEqual({ hidden: [0, 1, 2, 3], compactFirst: false, leafCut: false });
		expect(plan(40, { crumbs: [50] })).toEqual({ hidden: [], compactFirst: false, leafCut: false });
	});

	it('keeps a first crumb that is narrower than the button alone', () => {
		// 20 + 64 + 80 = 164; the button alone would take 24 + 64 + 80 = 168.
		const tiny = { crumbs: [20, 294], firstCompact: null };
		expect(plan(163, tiny)).toEqual({ hidden: [], compactFirst: false, leafCut: true });
	});
});

describe('breadcrumbNeed: the room a trail needs, whatever room it has', () => {
	it('needs every crumb and the chip to show whole: 882px', () => {
		expect(breadcrumbNeed(TRAIL).whole).toBe(882);
		expect(plan(882)).toEqual({ hidden: [], compactFirst: false, leafCut: false });
		expect(plan(881).hidden).not.toEqual([]);
	});

	it('needs the folded middle, the first as its icon, the page and the chip to show the page whole: 458px', () => {
		// 36 (the first as its icon) + 48 (the … button) + 294 + 80.
		expect(breadcrumbNeed(TRAIL).page).toBe(458);
		expect(plan(458).leafCut).toBe(false);
		expect(plan(457).leafCut).toBe(true);
	});

	it('is the same at every width: it reads the measures, never the room', () => {
		const at = (available: number) => {
			const measure: BreadcrumbOverflowMeasure = { ...TRAIL, available };
			return breadcrumbNeed(measure);
		};
		expect(at(100)).toEqual(at(Infinity));
		expect(at(0)).toEqual({ whole: 882, page: 458 });
	});

	it('rounds the widths up as the plan does, so a trail given its need is never cut', () => {
		const measure = { ...TRAIL, crumbs: [125.2, 113.5, 173.1, 93.9, 293.4], trailing: 79.6 };
		const need = breadcrumbNeed(measure);
		expect(need).toEqual({ whole: 882, page: 458 });
		expect(planBreadcrumbOverflow({ ...measure, available: need.whole }).hidden).toEqual([]);
		expect(planBreadcrumbOverflow({ ...measure, available: need.page }).leafCut).toBe(false);
	});

	it('keeps the first crumb in words when it has no icon to stand for it', () => {
		// 126 + 48 + 294 + 80.
		expect(breadcrumbNeed({ ...TRAIL, firstCompact: null }).page).toBe(548);
		expect(plan(548, { firstCompact: null }).leafCut).toBe(false);
		expect(plan(547, { firstCompact: null }).leafCut).toBe(true);
	});

	it('folds nothing on a two-level trail: the first as its icon beside the page', () => {
		const two = { ...TRAIL, crumbs: [126, 294] };
		expect(breadcrumbNeed(two)).toEqual({ whole: 500, page: 410 });
		expect(planBreadcrumbOverflow({ ...two, available: 410 }).leafCut).toBe(false);
		expect(planBreadcrumbOverflow({ ...two, available: 409 }).leafCut).toBe(true);
	});

	it('never needs more to show the page than to show the whole trail', () => {
		// One crumb on the way narrower than the … button, and no icon for the
		// first: folding would widen the trail, so the page needs the whole of it.
		const narrow = { ...TRAIL, crumbs: [126, 30, 294], firstCompact: null };
		expect(breadcrumbNeed(narrow)).toEqual({ whole: 530, page: 530 });
		expect(planBreadcrumbOverflow({ ...narrow, available: 530 }).leafCut).toBe(false);
		expect(planBreadcrumbOverflow({ ...narrow, available: 529 }).leafCut).toBe(true);
	});

	it('needs the page and its chip alone on a one-level trail, and nothing without a trail', () => {
		expect(breadcrumbNeed({ ...TRAIL, crumbs: [294] })).toEqual({ whole: 374, page: 374 });
		expect(breadcrumbNeed({ ...TRAIL, crumbs: [] })).toEqual({ whole: 0, page: 0 });
	});
});
