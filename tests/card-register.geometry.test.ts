// @vitest-environment node
/**
 * A register in a card on a phone, measured in real Chromium: a table in a
 * detail page's card (no list page, no toolbar) that reads as labelled
 * cards at or below the compact width (`.responsive-card-table`).
 * - A card's cell is as tall as what it holds. A host's row height
 *   (`--gawdux-table-row-height`, applied as a cell's height) and a cell's
 *   own height utility are the least a table's row may be; on a card's
 *   block cell either would be the most, and a value with a second line
 *   drew over the next line of its card. At 390 and 360 no value leaves
 *   its cell and no two cells of a card overlap; at 1440 the table keeps
 *   the row height.
 * - Its heads are hidden there, so its sort is drawn above it: DataTable's
 *   `sort`, or `ListPhoneSort` above a table the host writes out. It
 *   stands on the cards' inset, reorders the cards, and is not drawn at
 *   1440, where the heads sort.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Browser, Page } from 'playwright-core';
import { GEOMETRY_SKIP, geometry, livePage } from './support/geometry';
import CardRegister from './fixtures/CardRegisterHarness.svelte';

const FIXTURE = 'tests/fixtures/CardRegisterHarness.svelte';

let browser: Browser;
beforeAll(async () => {
	if (!GEOMETRY_SKIP) browser = await geometry.launch();
}, 60_000);
afterAll(async () => {
	await browser?.close();
});

type Drawn = 'table' | 'own';
const register = (width: number, drawn: Drawn, rowHeight = '2.5rem'): Promise<Page> =>
	livePage(browser, CardRegister, FIXTURE, width, { drawn, rowHeight });

/** The register as it is drawn: its rows, each cell's box and its value's, and the phone sort. */
async function read(page: Page) {
	return page.evaluate(() => {
		const container = document.querySelector<HTMLElement>('.responsive-card-table')!;
		const box = (element: Element) => {
			const { left, right, top, bottom, height } = element.getBoundingClientRect();
			return { left, right, top, bottom, height };
		};
		const sort = container.querySelector<HTMLElement>('[data-list-phone-sort]');
		return {
			pageScrolls: document.documentElement.scrollWidth > document.documentElement.clientWidth,
			container: box(container),
			headShown: container.querySelector('thead')!.getBoundingClientRect().height > 1,
			sort: sort
				? {
						shown: getComputedStyle(sort).display !== 'none',
						label: sort.querySelector('label')?.textContent?.trim() ?? null,
						...box(sort),
						select: box(sort.querySelector('select')!)
					}
				: null,
			rows: [...container.querySelectorAll<HTMLElement>('tbody > tr')].map((row) => ({
				...box(row),
				display: getComputedStyle(row).display,
				name: row.querySelector('[data-name]')?.textContent ?? '',
				cells: [...row.querySelectorAll<HTMLElement>(':scope > td')].map((cell) => ({
					...box(cell),
					display: getComputedStyle(cell).display,
					spills: cell.scrollHeight > cell.clientHeight + 1,
					value: box(cell.querySelector('[data-value]')!)
				}))
			}))
		};
	});
}

type Read = Awaited<ReturnType<typeof read>>;
type Box = { left: number; right: number; top: number; bottom: number };

const overlap = (a: Box, b: Box) =>
	a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;

/** Every row a card whose cells hold their values, no cell or value over another cell. */
function expectCardsHoldTheirCells(got: Read) {
	expect(got.pageScrolls).toBe(false);
	expect(got.headShown).toBe(false);
	expect(got.rows).toHaveLength(3);
	for (const row of got.rows) {
		expect(row.display).toBe('grid');
		for (const [at, cell] of row.cells.entries()) {
			expect(cell.display).toBe('block');
			expect(cell.spills, `cell ${at} of ${row.name} holds its value`).toBe(false);
			expect(cell.value.bottom).toBeLessThanOrEqual(cell.bottom + 0.5);
			expect(cell.bottom).toBeLessThanOrEqual(row.bottom + 0.5);
			for (const [other, next] of row.cells.entries()) {
				if (other === at) continue;
				expect(overlap(cell, next), `cells ${at} and ${other} of ${row.name}`).toBe(false);
				expect(overlap(cell.value, next), `the value of cell ${at} over cell ${other} of ${row.name}`).toBe(false);
			}
		}
		// The address has two lines: its cell is taller than one line of 40px could hold with its label.
		expect(row.cells[2]!.value.height).toBeGreaterThan(30);
	}
}

describe.skipIf(GEOMETRY_SKIP !== null)('a register in a card on a phone', () => {
	for (const width of [390, 360]) {
		for (const drawn of ['table', 'own'] as const) {
			const what = drawn === 'table' ? 'a host row height set' : "a host row height and a cell's own height set";
			it(`keeps a two-line cell off the next cell of its card at ${width}, ${what}`, async () => {
				const page = await register(width, drawn);
				expectCardsHoldTheirCells(await read(page));
				await page.close();
			});
		}
	}

	it('draws the same cards with no row height set', async () => {
		const page = await register(390, 'table', '');
		const plain = await read(page);
		expectCardsHoldTheirCells(plain);
		await page.close();
		const set = await register(390, 'table');
		const got = await read(set);
		expect(got.rows.map((row) => row.height)).toEqual(plain.rows.map((row) => row.height));
		await set.close();
	});

	for (const drawn of ['table', 'own'] as const) {
		it(`keeps the row height above the compact width (${drawn})`, async () => {
			const page = await register(1440, drawn);
			const got = await read(page);
			expect(got.headShown).toBe(true);
			for (const row of got.rows) {
				expect(row.display).toBe('table-row');
				expect(row.height).toBeGreaterThanOrEqual(40);
				for (const cell of row.cells) expect(cell.display).toBe('table-cell');
			}
			// A row with nothing taller than its line is the row height itself.
			const page2 = await livePage(browser, CardRegister, FIXTURE, 1440, { drawn, rowHeight: '5rem' });
			const tall = await read(page2);
			for (const row of tall.rows) expect(row.height).toBeCloseTo(80, 0);
			await page.close();
			await page2.close();
		});
	}

	for (const drawn of ['table', 'own'] as const) {
		const what = drawn === 'table' ? "DataTable's sort" : 'ListPhoneSort above a table the host writes out';
		it(`draws the heads' sort above the cards at 390, on their inset (${what})`, async () => {
			const page = await register(390, drawn);
			const got = await read(page);
			expect(got.sort?.shown).toBe(true);
			expect(got.sort!.label).toBe('Sort by');
			expect(got.sort!.select.height).toBeGreaterThanOrEqual(44);
			const first = got.rows[0]!;
			expect(got.sort!.select.left).toBeCloseTo(first.left, 0);
			expect(got.sort!.select.right).toBeCloseTo(first.right, 0);
			expect(got.sort!.select.left - got.container.left).toBeGreaterThanOrEqual(8);
			expect(got.sort!.select.bottom).toBeLessThanOrEqual(first.top);
			expect(first.top - got.sort!.select.bottom).toBeCloseTo(10, 0);
			await page.close();
		});

		it(`reorders the cards when a choice is made, and is not drawn at 1440 (${what})`, async () => {
			const page = await register(390, drawn);
			expect((await read(page)).rows.map((row) => row.name)).toEqual(['Camera 4', 'North door', 'Switch']);
			await page.selectOption('[data-list-phone-sort] select', 'latency:desc');
			expect((await read(page)).rows.map((row) => row.name)).toEqual(['Switch', 'North door', 'Camera 4']);
			expect(await page.textContent('[data-testid="order"]')).toBe('latency:desc');
			await page.close();

			const wide = await register(1440, drawn);
			const got = await read(wide);
			expect(got.sort?.shown).toBe(false);
			expect(got.headShown).toBe(true);
			await wide.close();
		});
	}
});
