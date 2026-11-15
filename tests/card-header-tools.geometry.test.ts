// @vitest-environment node
/**
 * A DataTable's card header on a phone, measured in real Chromium. Beside
 * its title a host puts a freshness note, a filter row and a search of a
 * fixed width. On one line at 390 the filter row (a sideways scroller that
 * may shrink) was drawn 0 px wide and the search ran past the card's edge.
 * At or below the compact width the tools wrap: every tool stands inside
 * the header and the filter row has room. A header that fits keeps its one
 * line, and at 1440 nothing wraps.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Browser, Page } from 'playwright-core';
import { GEOMETRY_SKIP, geometry, livePage } from './support/geometry';
import Harness from './fixtures/CardHeaderToolsHarness.svelte';

const FIXTURE = 'tests/fixtures/CardHeaderToolsHarness.svelte';

let browser: Browser;
beforeAll(async () => {
	if (!GEOMETRY_SKIP) browser = await geometry.launch();
}, 60_000);
afterAll(async () => {
	await browser?.close();
});

async function read(page: Page) {
	return page.evaluate(() => {
		const box = (element: Element | null) => {
			if (!element) return null;
			const { left, right, top, bottom, width } = element.getBoundingClientRect();
			return { left, right, top, bottom, width };
		};
		const header = document.querySelector('.card-header')!;
		return {
			pageScrolls: document.documentElement.scrollWidth > document.documentElement.clientWidth,
			header: box(header)!,
			title: box(header.querySelector('.card-header-title'))!,
			note: box(header.querySelector('[data-note]'))!,
			pills: box(header.querySelector('.filter-pill-shell')),
			search: box(header.querySelector('[data-search]'))
		};
	});
}

describe.skipIf(GEOMETRY_SKIP)("a card header's tools", () => {
	for (const width of [390, 360]) {
		it(`wrap at ${width}: every tool inside the header, the filter row with room`, async () => {
			const page = await livePage(browser, Harness, FIXTURE, width, { tools: 'all' });
			const got = await read(page);
			expect(got.pageScrolls).toBe(false);
			for (const tool of [got.note, got.pills!, got.search!]) {
				expect(tool.left).toBeGreaterThanOrEqual(got.header.left - 0.5);
				expect(tool.right).toBeLessThanOrEqual(got.header.right + 0.5);
			}
			expect(got.pills!.width).toBeGreaterThan(200);
			expect(got.pills!.top).toBeGreaterThanOrEqual(got.title.bottom - 0.5);
			await page.close();
		}, 60_000);
	}

	it('keep one line at 390 when they fit beside the title', async () => {
		const page = await livePage(browser, Harness, FIXTURE, 390, { tools: 'few' });
		const got = await read(page);
		expect(got.note.top).toBeLessThan(got.title.bottom);
		expect(got.note.right).toBeGreaterThan(got.header.right - 40);
		await page.close();
	}, 60_000);

	it('stand on one line at 1440', async () => {
		const page = await livePage(browser, Harness, FIXTURE, 1440, { tools: 'all' });
		const got = await read(page);
		for (const tool of [got.note, got.pills!, got.search!]) expect(tool.top).toBeLessThan(got.title.bottom);
		expect(got.search!.right).toBeLessThanOrEqual(got.header.right + 0.5);
		await page.close();
	}, 60_000);
});
