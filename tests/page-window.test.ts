/**
 * `buildPageWindow` — the windowing behind ListPaginationNav's opt-in
 * numbered pages.
 *
 * The shape is not invented here: consumers already rendered numbered
 * pagination with exactly this window, and the point of upstreaming it is that
 * they can adopt the shared nav WITHOUT losing direct page-jump. So the tests
 * pin the existing shape, and one of them re-implements the consumer's
 * original algorithm and asserts agreement across every (current, total) pair
 * in a wide range — a rewrite that quietly changed the window would otherwise
 * look like a cosmetic diff.
 */
import { describe, it, expect } from 'vitest';
import { buildPageWindow } from '../src/lib/primitives/page-window.js';

/** The algorithm consumers shipped before this moved upstream. */
function original(current: number, total: number): (number | 'ellipsis')[] {
	if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
	const pages: (number | 'ellipsis')[] = [];
	pages.push(1);
	if (current > 3) pages.push('ellipsis');
	for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
	if (current < total - 2) pages.push('ellipsis');
	if (total > 1) pages.push(total);
	return pages;
}

describe('buildPageWindow', () => {
	it('shows every page up to seven', () => {
		expect(buildPageWindow(1, 1)).toEqual([1]);
		expect(buildPageWindow(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
	});

	it('windows around the current page beyond seven', () => {
		expect(buildPageWindow(1, 20)).toEqual([1, 2, 'ellipsis', 20]);
		expect(buildPageWindow(10, 20)).toEqual([1, 'ellipsis', 9, 10, 11, 'ellipsis', 20]);
		expect(buildPageWindow(20, 20)).toEqual([1, 'ellipsis', 19, 20]);
	});

	it('always offers the first and last page', () => {
		for (let total = 8; total <= 40; total++) {
			for (let current = 1; current <= total; current++) {
				const w = buildPageWindow(current, total);
				expect(w[0], `first of (${current}/${total})`).toBe(1);
				expect(w[w.length - 1], `last of (${current}/${total})`).toBe(total);
			}
		}
	});

	it('always contains the current page, so something is selected', () => {
		for (let total = 1; total <= 40; total++) {
			for (let current = 1; current <= total; current++) {
				expect(buildPageWindow(current, total), `(${current}/${total})`).toContain(current);
			}
		}
	});

	it('never repeats a page and never puts two ellipses together', () => {
		for (let total = 1; total <= 40; total++) {
			for (let current = 1; current <= total; current++) {
				const w = buildPageWindow(current, total);
				const nums = w.filter((x): x is number => typeof x === 'number');
				expect(new Set(nums).size, `duplicates in (${current}/${total})`).toBe(nums.length);
				for (let i = 1; i < w.length; i++) {
					expect(
						w[i] === 'ellipsis' && w[i - 1] === 'ellipsis',
						`adjacent ellipses in (${current}/${total})`
					).toBe(false);
				}
				// Monotonic: page numbers only ever increase left to right.
				for (let i = 1; i < nums.length; i++) expect(nums[i]!).toBeGreaterThan(nums[i - 1]!);
			}
		}
	});

	it('matches the algorithm consumers already shipped', () => {
		for (let total = 1; total <= 60; total++) {
			for (let current = 1; current <= total; current++) {
				expect(buildPageWindow(current, total), `(${current}/${total})`).toEqual(
					original(current, total)
				);
			}
		}
	});

	it('clamps a current page outside the range instead of selecting nothing', () => {
		expect(buildPageWindow(0, 10)).toContain(1);
		expect(buildPageWindow(999, 10)).toContain(10);
		expect(buildPageWindow(-5, 3)).toEqual([1, 2, 3]);
	});

	it('returns nothing for a degenerate total', () => {
		expect(buildPageWindow(1, 0)).toEqual([]);
		expect(buildPageWindow(1, -1)).toEqual([]);
		expect(buildPageWindow(1, Number.NaN)).toEqual([]);
	});
});
