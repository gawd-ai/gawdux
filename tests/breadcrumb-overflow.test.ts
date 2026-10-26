import { describe, expect, it } from 'vitest';
import {
	breadcrumbCollapseOrder,
	planBreadcrumbOverflow,
	type BreadcrumbOverflowMeasure
} from '../src/lib/primitives/breadcrumb-overflow';

// A five-level trail: a first crumb with its icon (36px of icon), three
// levels on the way, the current page, a chip beside it. Every separator is
// 24px. Full width: 126 + 114 + 174 + 94 + 294 + 80 = 882.
const TRAIL: BreadcrumbOverflowMeasure = {
	available: Infinity,
	crumbs: [126, 114, 174, 94, 294],
	more: 48,
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
		const fractional = { crumbs: [10.2, 10.2], trailing: 0, firstCompact: null };
		expect(plan(22, fractional).leafCut).toBe(false);
		expect(plan(21.9, fractional).leafCut).toBe(true);
	});

	it('has nothing to plan for an empty trail', () => {
		expect(plan(10, { crumbs: [] })).toEqual({ hidden: [], compactFirst: false, leafCut: false });
	});
});
