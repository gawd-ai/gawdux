// @vitest-environment node
/**
 * The trail names the place, not the item, where the item's pane header
 * names it, measured in real Chromium with the header running in the page.
 * Above 1024px a document's trail ends at its folder and a record's at
 * Records, every level a link and none cut, the item named once, in its
 * pane header; at 390 and 360 nothing changes: the header's name button
 * names the item and opens its whole path, the item last and marked as the
 * page.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Browser, Page } from 'playwright-core';
import { GEOMETRY_SKIP, geometry, livePage } from './support/geometry';
import TrailPlace from './fixtures/shell/TrailPlaceHarness.svelte';

const FIXTURE = 'tests/fixtures/shell/TrailPlaceHarness.svelte';
const TITLE = 'Method transfer protocol, HPLC assay';

let browser: Browser;
beforeAll(async () => {
	if (!GEOMETRY_SKIP) browser = await geometry.launch();
}, 60_000);
afterAll(async () => {
	await browser?.close();
});

const header = (width: number, kind: 'document' | 'record'): Promise<Page> =>
	livePage(browser, TrailPlace, FIXTURE, width, { kind });

/** The trail's line as it shows: each level's words, its link and whether it is cut or folded. */
async function line(page: Page) {
	return page.$eval('[data-shell-header] nav.gawdux-breadcrumbs', (nav) => {
		const list = nav.querySelector<HTMLElement>(':scope > ol.trail')!;
		return {
			shown: getComputedStyle(list).display !== 'none',
			levels: Array.from(list.querySelectorAll<HTMLElement>(':scope > li'), (li) => {
				const title = li.querySelector<HTMLElement>('.breadcrumb-title')!;
				const label = li.querySelector<HTMLElement>('.breadcrumb-label');
				return {
					words: label?.textContent ?? '…',
					href: title.getAttribute('href'),
					current: title.getAttribute('aria-current'),
					cut: label ? label.scrollWidth > label.clientWidth + 1 : true
				};
			})
		};
	});
}

describe.skipIf(GEOMETRY_SKIP !== null)(
	"the trail ends at the item's place where its pane header names it",
	() => {
		it("ends a document's trail at its folder at 1440, every level a link, none cut", async () => {
			const page = await header(1440, 'document');
			const got = await line(page);
			expect(got.shown).toBe(true);
			expect(got.levels.map((level) => level.words)).toEqual([
				'Documents',
				'Authoring',
				'Quality Assurance',
				'sops'
			]);
			expect(got.levels.slice(1).every((level) => level.href)).toBe(true);
			expect(got.levels.at(-1)?.href).toBe('/app/documents/folder/5');
			expect(got.levels.some((level) => level.current)).toBe(false);
			expect(got.levels.some((level) => level.cut)).toBe(false);
			await page.close();
		});

		it("ends a record's trail at Records at 1440", async () => {
			const page = await header(1440, 'record');
			const got = await line(page);
			expect(got.levels.map((level) => level.words)).toEqual(['Work', 'Records']);
			expect(got.levels.at(-1)?.href).toBe('/app/work/records');
			await page.close();
		});

		for (const width of [390, 360]) {
			it(`names the document at ${width}, the header's button opening the whole path`, async () => {
				const page = await header(width, 'document');
				expect((await line(page)).shown).toBe(false);
				const button = page.locator('[data-shell-header] nav.gawdux-breadcrumbs .page-row button');
				expect((await button.innerText()).trim()).toBe(TITLE);
				expect(await button.getAttribute('aria-current')).toBe('page');
				const box = await button.boundingBox();
				expect(box!.x + box!.width).toBeLessThanOrEqual(width);
				expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
					width
				);
				await button.click();
				const rows = await page.$$eval(
					'[data-shell-header] .menu.path [role="menuitem"]',
					(items) =>
						items.map((row) => ({
							text: row.textContent?.replace(/\s+/g, ' ').trim() ?? '',
							current: row.getAttribute('aria-current')
						}))
				);
				expect(rows.map((row) => row.text)).toEqual([
					'Documents',
					'Authoring',
					'Quality Assurance',
					'sops',
					TITLE
				]);
				expect(rows.at(-1)?.current).toBe('page');
				await page.close();
			});
		}

		it("names the record at 360, its path ending on the record's number", async () => {
			const page = await header(360, 'record');
			expect((await line(page)).shown).toBe(false);
			const button = page.locator('[data-shell-header] nav.gawdux-breadcrumbs .page-row button');
			await button.click();
			const rows = await page.$$eval('[data-shell-header] .menu.path [role="menuitem"]', (items) =>
				items.map((row) => row.textContent?.replace(/\s+/g, ' ').trim() ?? '')
			);
			expect(rows).toEqual(['Work', 'Records', 'CCF-0001']);
			await page.close();
		});
	}
);
