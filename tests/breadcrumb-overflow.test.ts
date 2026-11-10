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
// levels on the way, the current page. Every separator is 24px; the overflow
// button is 24px alone, 48px with its separator. Full width: 126 + 114 + 174
// + 94 + 294 = 802. The trail carries no status: the page's own header does.
const TRAIL: BreadcrumbOverflowMeasure = {
	available: Infinity,
	crumbs: [126, 114, 174, 94, 294],
	more: 48,
	moreLead: 24,
	firstCompact: 36
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

/** A plan: the folded crumbs, the first as its icon, the page cut. */
const P = (hidden: number[], compactFirst = false, leafCut = false) => ({
	hidden,
	compactFirst,
	leafCut
});

describe('planBreadcrumbOverflow', () => {
	it('folds nothing while the whole trail fits', () => {
		expect(plan(802)).toEqual(P([]));
		expect(plan(Infinity)).toEqual(P([]));
		expect(plan(801).hidden).toEqual([2]);
	});

	it('folds the crumbs on the way from the inside out until the trail fits', () => {
		// 802 - 174 + 48 = 676
		expect(plan(676)).toEqual(P([2]));
		// 676 - 114 = 562
		expect(plan(675).hidden).toEqual([1, 2]);
		expect(plan(562).hidden).toEqual([1, 2]);
		// 562 - 94 = 468
		expect(plan(561)).toEqual(P([1, 2, 3]));
		expect(plan(468)).toEqual(P([1, 2, 3]));
	});

	it('shows the first crumb as its icon alone once every crumb on the way is folded', () => {
		// 126 + 48 + 294 = 468 with the first crumb in words; 36 + 48 + 294 = 378 as its icon.
		expect(plan(467)).toEqual(P([1, 2, 3], true));
		expect(plan(378)).toEqual(P([1, 2, 3], true));
	});

	it('folds the first crumb into the button next, the page whole', () => {
		// 24 + 294 = 318: the button alone, the page.
		expect(plan(377)).toEqual(P([0, 1, 2, 3]));
		expect(plan(318)).toEqual(P([0, 1, 2, 3]));
	});

	it('cuts the current page last of all', () => {
		for (let available = 318; available <= 900; available += 1) {
			expect(plan(available).leafCut, `${available}px`).toBe(false);
		}
		expect(plan(317)).toEqual(P([0, 1, 2, 3], false, true));
	});

	it('folds a first crumb without an icon from its words, before anything else gives way', () => {
		expect(plan(468, { firstCompact: null })).toEqual(P([1, 2, 3]));
		expect(plan(467, { firstCompact: null })).toEqual(P([0, 1, 2, 3]));
	});

	it('gives way in a two-crumb trail without folding the middle, there being nothing to fold', () => {
		const two = { crumbs: [126, 294] };
		expect(plan(420, two)).toEqual(P([]));
		// 36 + 294 = 330
		expect(plan(419, two)).toEqual(P([], true));
		expect(plan(330, two)).toEqual(P([], true));
		// 24 + 294 = 318
		expect(plan(329, two)).toEqual(P([0]));
		expect(plan(318, two)).toEqual(P([0]));
		expect(plan(317, two)).toEqual(P([0], false, true));
	});

	it('cuts a single crumb when it does not fit, and never compacts it', () => {
		const one = { crumbs: [300] };
		expect(plan(300, one)).toEqual(P([]));
		expect(plan(299, one)).toEqual(P([], false, true));
		expect(plan(100, one)).toEqual(P([], false, true));
	});

	it('rounds a sub-pixel crumb up and the room down, so a plan that fits never ellipsizes', () => {
		const fractional = { crumbs: [10.2, 80.2], firstCompact: null };
		expect(plan(92, fractional).leafCut).toBe(false);
		expect(plan(91.9, fractional).leafCut).toBe(true);
	});

	it('has nothing to plan for an empty trail', () => {
		expect(plan(10, { crumbs: [] })).toEqual(P([]));
	});
});

describe('the current page keeps a readable minimum', () => {
	const NARROWEST = P([0, 1, 2, 3], false, true);

	it('is the page at its own width, up to a few characters', () => {
		expect(BREADCRUMB_LEAF_MIN_PX).toBe(64);
		expect(breadcrumbLeafMin(294)).toBe(64);
		expect(breadcrumbLeafMin(64)).toBe(64);
		expect(breadcrumbLeafMin(50.5)).toBe(50.5);
	});

	it('gives nothing more past the narrowest: the page holds its minimum', () => {
		expect(plan(317)).toEqual(NARROWEST);
		expect(plan(88)).toEqual(NARROWEST);
		expect(plan(10)).toEqual(NARROWEST);
		expect(plan(0)).toEqual(NARROWEST);
	});

	it('reads the page whole by folding the first crumb before it cuts the page', () => {
		// Four levels: 36 + 48 + 94 = 178 with the first as its icon; below it
		// the first crumb folds, and 24 + 94 = 118 holds the page whole.
		const four = { crumbs: [126, 114, 174, 94] };
		expect(plan(178, four)).toEqual(P([1, 2], true));
		expect(plan(177, four)).toEqual(P([0, 1, 2]));
		expect(plan(118, four)).toEqual(P([0, 1, 2]));
		expect(plan(117, four)).toEqual(P([0, 1, 2], false, true));
		expect(plan(88, four)).toEqual(P([0, 1, 2], false, true));
	});

	it('never cuts a page no wider than its minimum', () => {
		const short = { crumbs: [126, 114, 174, 94, 50] };
		// 36 + 48 + 50 = 134 with the first crumb as its icon
		expect(plan(134, short)).toEqual(P([1, 2, 3], true));
		// 24 + 50 = 74 with the first crumb folded
		expect(plan(133, short)).toEqual(P([0, 1, 2, 3]));
		expect(plan(74, short)).toEqual(P([0, 1, 2, 3]));
		expect(plan(40, short)).toEqual(P([0, 1, 2, 3]));
		expect(plan(40, { crumbs: [50] })).toEqual(P([]));
	});

	it('keeps a first crumb that is narrower than the button alone', () => {
		// 20 + 294 = 314; the button alone would be wider than the crumb.
		const tiny = { crumbs: [20, 294], firstCompact: null };
		expect(plan(314, tiny)).toEqual(P([]));
		expect(plan(313, tiny)).toEqual(P([], false, true));
	});
});

describe('breadcrumbNeed: the room a trail needs, whatever room it has', () => {
	it('needs every crumb to show whole: 802px', () => {
		expect(breadcrumbNeed(TRAIL).whole).toBe(802);
		expect(plan(802)).toEqual(P([]));
		expect(plan(801).hidden).not.toEqual([]);
	});

	it('needs the folded middle, the first as its icon and the page to show the page whole: 378px', () => {
		// 36 (the first as its icon) + 48 (the … button) + 294.
		expect(breadcrumbNeed(TRAIL).page).toBe(378);
		expect(plan(378)).toEqual(P([1, 2, 3], true));
		// Below it the first crumb folds; the page is never the first to give way.
		expect(plan(377)).toEqual(P([0, 1, 2, 3]));
	});

	it('is the same at every width: it reads the measures, never the room', () => {
		const at = (available: number) => {
			const measure: BreadcrumbOverflowMeasure = { ...TRAIL, available };
			return breadcrumbNeed(measure);
		};
		expect(at(100)).toEqual(at(Infinity));
		expect(at(0)).toEqual({ whole: 802, page: 378 });
	});

	it('rounds the widths up as the plan does, so a trail given its need is never cut', () => {
		const measure = { ...TRAIL, crumbs: [125.2, 113.5, 173.1, 93.9, 293.4] };
		const need = breadcrumbNeed(measure);
		expect(need).toEqual({ whole: 802, page: 378 });
		expect(planBreadcrumbOverflow({ ...measure, available: need.whole }).hidden).toEqual([]);
		expect(planBreadcrumbOverflow({ ...measure, available: need.page }).leafCut).toBe(false);
	});

	it('keeps the first crumb in words when it has no icon to stand for it', () => {
		// 126 + 48 + 294.
		expect(breadcrumbNeed({ ...TRAIL, firstCompact: null }).page).toBe(468);
		expect(plan(468, { firstCompact: null })).toEqual(P([1, 2, 3]));
		expect(plan(467, { firstCompact: null })).toEqual(P([0, 1, 2, 3]));
	});

	it('folds nothing on a two-level trail: the first as its icon beside the page', () => {
		const two = { ...TRAIL, crumbs: [126, 294] };
		expect(breadcrumbNeed(two)).toEqual({ whole: 420, page: 330 });
		expect(planBreadcrumbOverflow({ ...two, available: 330 })).toEqual(P([], true));
		expect(planBreadcrumbOverflow({ ...two, available: 329 })).toEqual(P([0]));
	});

	it('never needs more to show the page than to show the whole trail', () => {
		// One crumb on the way narrower than the … button, and no icon for the
		// first: folding would widen the trail, so the page needs the whole of it.
		const narrow = { ...TRAIL, crumbs: [126, 30, 294], firstCompact: null };
		expect(breadcrumbNeed(narrow)).toEqual({ whole: 450, page: 450 });
		expect(planBreadcrumbOverflow({ ...narrow, available: 450 })).toEqual(P([]));
		// 24 + 294 = 318: the button alone stands before the page.
		expect(planBreadcrumbOverflow({ ...narrow, available: 449 })).toEqual(P([0, 1]));
	});

	it('needs the page alone on a one-level trail, and nothing without a trail', () => {
		expect(breadcrumbNeed({ ...TRAIL, crumbs: [294] })).toEqual({ whole: 294, page: 294 });
		expect(breadcrumbNeed({ ...TRAIL, crumbs: [] })).toEqual({ whole: 0, page: 0 });
	});
});
