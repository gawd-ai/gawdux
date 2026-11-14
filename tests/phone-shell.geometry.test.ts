// @vitest-environment node
/**
 * The phone shell measured in real Chromium: one bar along the bottom with
 * the host's controls at its right end, with something occupying it or not;
 * the header as one row at the compact width, the menu button at the
 * screen's edge and the page's name opening its path; the account's sheet
 * above the bar with the theme as a row; the frame leaving the bar's room
 * and dropping the side rail; the navigation drawer from the left edge;
 * the rail's foot level with the page's panel; the frame under print media.
 * At 360, 390, 900 and 1440, in light and dark where a colour is read.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Browser, Page } from 'playwright-core';
import { boxes } from '../src/lib/test-support';
import { GEOMETRY_SKIP, geometry, livePage, serverPage } from './support/geometry';
import Bar from './fixtures/shell/ShellBarHarness.svelte';
import Header from './fixtures/shell/ShellHeaderHarness.svelte';
import Shell from './fixtures/shell/AppShellHarness.svelte';
import { RECORD_TRAIL } from './fixtures/shell/shell-fixtures';

const BAR = 'tests/fixtures/shell/ShellBarHarness.svelte';
const HEADER = 'tests/fixtures/shell/ShellHeaderHarness.svelte';
const SHELL = 'tests/fixtures/shell/AppShellHarness.svelte';
const ACCOUNT = 'Account menu for Quinn Adler';
const HEIGHT = 844;

let browser: Browser;
beforeAll(async () => {
	if (!GEOMETRY_SKIP) browser = await geometry.launch();
}, 60_000);
afterAll(async () => {
	await browser?.close();
});

/** The controls a person can press in the bar, in the order they read, with their boxes. */
async function barControls(page: Page) {
	return page.$$eval('[data-testid="bar"] :is(button, a[href])', (elements) =>
		elements
			// A sheet's rows are not the bar's, open or closed (a closed body is inert).
			.filter((element) => !element.closest('.gawdux-shell-bar-sheet, [inert]'))
			.map((element) => {
				const r = element.getBoundingClientRect();
				return {
					label: element.getAttribute('aria-label') ?? element.textContent?.trim() ?? '',
					left: r.left,
					right: r.right,
					top: r.top,
					bottom: r.bottom,
					width: r.width,
					height: r.height
				};
			})
			.filter((control) => control.width > 0 && control.height > 0)
	);
}

describe.skipIf(GEOMETRY_SKIP !== null)('one bar at the bottom on a phone', () => {
	for (const width of [360, 390, 900]) {
		it(`holds the occupant's toggle and its foot from its start, then the notices and the account at its right end, at ${width}`, async () => {
			const page = await serverPage(browser, Bar, width);
			const [bar] = await boxes(page, '[data-testid="bar"]');
			expect(bar!.bottom).toBe(HEIGHT);
			expect(bar!.left).toBe(0);
			expect(bar!.width).toBe(width);
			expect(bar!.height).toBe(48);
			const controls = await barControls(page);
			expect(controls.map((control) => control.label)).toEqual([
				'Show chat',
				'Help',
				'Notices (2)',
				ACCOUNT
			]);
			for (const control of controls) {
				expect(control.width, control.label).toBeGreaterThanOrEqual(44);
				expect(control.height, control.label).toBeGreaterThanOrEqual(44);
				expect(control.left, control.label).toBeGreaterThanOrEqual(0);
				expect(control.right, control.label).toBeLessThanOrEqual(width);
				// One row, inside the bar.
				expect(control.top, control.label).toBeGreaterThanOrEqual(bar!.top);
				expect(control.bottom, control.label).toBeLessThanOrEqual(bar!.bottom);
			}
			for (let i = 1; i < controls.length; i++)
				expect(controls[i]!.left).toBeGreaterThanOrEqual(controls[i - 1]!.right - 0.5);
			// The toggle starts the bar, the foot's control beside it.
			expect(controls[0]!.left).toBeLessThanOrEqual(8);
			expect(controls[1]!.left - controls[0]!.right).toBeLessThanOrEqual(8);
			// The account ends the bar, the notices beside it.
			const account = controls.at(-1)!;
			const notices = controls.at(-2)!;
			expect(width - account.right).toBeLessThanOrEqual(8);
			expect(account.left - notices.right).toBeLessThanOrEqual(8);
			await page.close();
		});
	}

	it('holds the notices and the account alone with nothing occupying it, in the same place', async () => {
		const page = await serverPage(browser, Bar, 390, { occupied: false });
		const [bar] = await boxes(page, '[data-testid="bar"]');
		expect(bar!.bottom).toBe(HEIGHT);
		const alone = await barControls(page);
		expect(alone.map((control) => control.label)).toEqual(['Notices (2)', ACCOUNT]);
		await page.close();
		const occupied = await serverPage(browser, Bar, 390);
		const shared = (await barControls(occupied)).slice(-2);
		await occupied.close();
		for (const [index, control] of alone.entries()) {
			expect(Math.abs(control.left - shared[index]!.left), control.label).toBeLessThanOrEqual(0.5);
			expect(Math.abs(control.right - shared[index]!.right), control.label).toBeLessThanOrEqual(
				0.5
			);
		}
	});

	it('keeps an empty end out of the way: the bar holds its occupant alone', async () => {
		const page = await serverPage(browser, Bar, 390, { filled: false });
		expect((await barControls(page)).map((control) => control.label)).toEqual([
			'Show chat',
			'Help'
		]);
		await page.close();
	});

	it("draws UserMenu's own avatar at the end for a host that does not opt into the card", async () => {
		const page = await serverPage(browser, Bar, 390, { occupied: false, card: false });
		const controls = await barControls(page);
		expect(controls.map((control) => control.label)).toEqual(['Notices (2)', ACCOUNT]);
		expect(390 - controls.at(-1)!.right).toBeLessThanOrEqual(8);
		expect(controls.at(-1)!.width).toBeGreaterThanOrEqual(44);
		await page.close();
	});

	it('draws no bar of its own above the compact width, and none of the account controls in a column', async () => {
		const own = await serverPage(browser, Bar, 1440, { occupied: false });
		expect((await boxes(own, '[data-testid="bar"]'))[0]!.height).toBe(0);
		await own.close();
		const column = await serverPage(browser, Bar, 1440);
		const labels = (await barControls(column)).map((control) => control.label);
		expect(labels).toEqual(['Show chat', 'Direct messages', 'Channels', 'Help']);
		await column.close();
	});
});

/** The current page's row in the header: its button (or its words), its name. */
async function pageRow(page: Page) {
	return page.$eval('[data-shell-header] nav.gawdux-breadcrumbs', (nav) => {
		const box = (el: Element | null) => {
			if (!el) return null;
			const r = el.getBoundingClientRect();
			return {
				left: r.left,
				right: r.right,
				top: r.top,
				bottom: r.bottom,
				width: r.width,
				height: r.height
			};
		};
		const control = nav.querySelector<HTMLElement>('.page-row > :is(button, span)');
		const name = nav.querySelector<HTMLElement>('.page-row .page-name');
		return {
			tag: control?.tagName.toLowerCase() ?? null,
			control: box(control),
			name: name?.textContent ?? '',
			nameLines: name ? name.getClientRects().length : 0,
			cut: name ? name.scrollWidth > name.clientWidth : false,
			chevron: box(nav.querySelector('.page-row .page-chevron')),
			trail: box(nav.querySelector(':scope > ol'))
		};
	});
}

describe.skipIf(GEOMETRY_SKIP !== null)('the header on a phone', () => {
	for (const width of [360, 390, 900]) {
		it(`is one row 48px tall: the menu button at the edge, then the page's name opening its path, at ${width}`, async () => {
			const page = await serverPage(browser, Header, width);
			const [header] = await boxes(page, '[data-shell-header]');
			expect(header!.height).toBe(48);
			expect(header!.width).toBe(width);
			const [menu] = await boxes(page, '[aria-label="Open navigation"]');
			expect(menu!.left).toBe(0);
			expect(menu!.width).toBe(44);
			expect(menu!.height).toBe(44);
			const row = await pageRow(page);
			expect(row.tag).toBe('button');
			expect(row.control!.left - menu!.right).toBeLessThanOrEqual(2);
			expect(row.control!.height).toBeGreaterThanOrEqual(44);
			expect(row.control!.right).toBeLessThanOrEqual(width);
			// The name on one line; too long for the row, it ends in an ellipsis.
			expect(row.name).toBe(RECORD_TRAIL.at(-1)!.label);
			expect(row.nameLines).toBe(1);
			if (width < 600) expect(row.cut).toBe(true);
			expect(row.chevron!.width).toBeGreaterThan(0);
			expect(row.chevron!.right).toBeLessThanOrEqual(width);
			// The one-line trail is not drawn here.
			expect(row.trail!.width).toBe(0);
			// The host's controls are in the bar, not here.
			for (const selector of [
				'[aria-label="Toggle dark mode"]',
				'[data-account-card]',
				'[data-testid="switcher"]',
				'[data-testid="notices"]'
			])
				for (const box of await boxes(page, selector)) expect(box.width, selector).toBe(0);
			expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
				width
			);
			await page.close();
		});
	}

	// The page's row leads with the section's icon: the first crumb's, at
	// the house size, 8px before the page's name, drawn in light and dark.
	for (const dark of [false, true]) {
		it(`leads the page's row with the section's icon at 390, ${dark ? 'dark' : 'light'}`, async () => {
			const page = await serverPage(browser, Header, 390, {}, dark);
			const got = await page.$eval('[data-shell-header] nav.gawdux-breadcrumbs', (nav) => {
				const icon = nav.querySelector<SVGElement>('.page-row [data-trail-icon]');
				const name = nav.querySelector<HTMLElement>('.page-row .page-name');
				const control = nav.querySelector<HTMLElement>('.page-row > :is(button, span)');
				if (!icon || !name || !control) return null;
				const i = icon.getBoundingClientRect();
				const n = name.getBoundingClientRect();
				const c = control.getBoundingClientRect();
				return {
					width: i.width,
					height: i.height,
					gap: n.left - i.right,
					inControl: i.left >= c.left && i.right <= c.right,
					centred: Math.abs(i.top + i.height / 2 - (n.top + n.height / 2)),
					color: getComputedStyle(icon).color
				};
			});
			await page.close();
			expect(got, 'the section icon on the page row').not.toBeNull();
			expect(got!.width).toBe(20);
			expect(got!.height).toBe(20);
			expect(got!.inControl).toBe(true);
			expect(Math.abs(got!.gap - 8)).toBeLessThanOrEqual(0.5);
			expect(got!.centred).toBeLessThanOrEqual(1);
			expect(got!.color).not.toBe('rgba(0, 0, 0, 0)');
		});
	}

	it('keeps an identifier that fits whole', async () => {
		const page = await serverPage(browser, Header, 360, {
			trail: [
				{ label: 'Work', href: '/app/work' },
				{ label: 'Records', href: '/app/work/records' },
				{ label: 'VSR-0001' }
			]
		});
		const row = await pageRow(page);
		expect(row.name).toBe('VSR-0001');
		expect(row.nameLines).toBe(1);
		expect(row.cut).toBe(false);
		await page.close();
	});

	it('shows a page that is its own path as its name, no chevron', async () => {
		const page = await serverPage(browser, Header, 390, {
			trail: [{ label: 'Dashboard', href: '/app' }]
		});
		const row = await pageRow(page);
		expect(row.tag).toBe('span');
		expect(row.name).toBe('Dashboard');
		expect(row.chevron).toBeNull();
		await page.close();
	});

	it('is the menu button and the name alone when the host fills no slot', async () => {
		const page = await serverPage(browser, Header, 390, { filled: false });
		const [header] = await boxes(page, '[data-shell-header]');
		expect(header!.height).toBe(48);
		expect((await boxes(page, '[aria-label="Open navigation"]'))[0]!.left).toBe(0);
		expect((await pageRow(page)).control!.right).toBeLessThanOrEqual(390);
		await page.close();
	});

	it('keeps one line 56px tall and the host controls above the compact width, no menu button', async () => {
		const page = await serverPage(browser, Header, 1440);
		const [header] = await boxes(page, '[data-shell-header]');
		expect(header!.height).toBe(56);
		const crumbs = await boxes(page, 'nav.gawdux-breadcrumbs > ol > li');
		expect(new Set(crumbs.map((crumb) => Math.round(crumb.top + crumb.height / 2))).size).toBe(1);
		const [account] = await boxes(page, '[data-account-card] .card');
		expect(account!.width).toBe(270);
		expect(account!.height).toBe(45);
		expect(1440 - (await boxes(page, '[data-theme-toggle]'))[0]!.right).toBe(8);
		const [theme] = await boxes(page, '[aria-label="Toggle dark mode"]');
		expect(theme!.width).toBeGreaterThan(0);
		for (const box of await boxes(page, '[aria-label="Open navigation"]'))
			expect(box.width).toBe(0);
		expect((await pageRow(page)).control!.width).toBe(0);
		// The order at the end: the switcher, the account, the notices, the theme.
		const order = ['[data-testid="switcher"]', '[data-account-card]', '[data-testid="notices"]', '[data-theme-toggle]'];
		const lefts: number[] = [];
		for (const selector of order) lefts.push((await boxes(page, selector))[0]!.left);
		expect([...lefts].sort((a, b) => a - b)).toEqual(lefts);
		await page.close();
	});
});

const PAGE_BUTTON = '[data-shell-header] nav.gawdux-breadcrumbs .page-row button';

/** The open path under the header: its box and its rows, in the order they read. */
async function openPath(page: Page) {
	return page.$eval('[data-shell-header] nav.gawdux-breadcrumbs', (nav) => {
		const menu = nav.querySelector<HTMLElement>('.menu.path');
		if (!menu) return null;
		const r = menu.getBoundingClientRect();
		return {
			left: r.left,
			right: r.right,
			top: r.top,
			bottom: r.bottom,
			rows: Array.from(menu.querySelectorAll<HTMLElement>('[role="menuitem"]'), (row) => {
				const words = Array.from(row.querySelectorAll<HTMLElement>('.word'));
				return {
					text: row.textContent?.replace(/\s+/g, ' ').trim() ?? '',
					href: row.getAttribute('href'),
					current: row.getAttribute('aria-current'),
					height: row.getBoundingClientRect().height,
					cut: row.scrollWidth > row.clientWidth,
					broken: words.filter((word) => word.getClientRects().length > 1).length,
					lines: new Set(words.map((word) => Math.round(word.getBoundingClientRect().top))).size
				};
			})
		};
	});
}

/** The element holding the focus, as the test reads it. */
const focused = (page: Page) =>
	page.evaluate(
		(selector) => (document.activeElement?.matches(selector) ? 'page button' : 'elsewhere'),
		PAGE_BUTTON
	);

describe.skipIf(GEOMETRY_SKIP !== null)("the trail's path on a phone", () => {
	for (const width of [360, 390]) {
		it(`opens under the header on a press: every level from the top down, each a link, the current page last and marked, each name whole, at ${width}`, async () => {
			const page = await livePage(browser, Header, HEADER, width);
			expect(await openPath(page)).toBeNull();
			await page.click(PAGE_BUTTON);
			const [header] = await boxes(page, '[data-shell-header]');
			const path = (await openPath(page))!;
			expect(path).not.toBeNull();
			// Under the header, inside the screen's 8px gutter, within the screen.
			expect(path.top).toBeGreaterThanOrEqual(header!.bottom - 0.5);
			expect(path.top - header!.bottom).toBeLessThanOrEqual(8);
			expect(Math.abs(path.left - 8)).toBeLessThanOrEqual(1);
			expect(Math.abs(width - 8 - path.right)).toBeLessThanOrEqual(1);
			expect(path.bottom).toBeLessThanOrEqual(HEIGHT);
			expect(path.rows.map((row) => row.text)).toEqual(RECORD_TRAIL.map((crumb) => crumb.label));
			expect(path.rows.map((row) => row.href)).toEqual([
				'/app/audit',
				'/app/reviews',
				'/app/reviews/folder/5',
				null
			]);
			expect(path.rows.map((row) => row.current)).toEqual([null, null, null, 'page']);
			for (const row of path.rows) {
				expect(row.height, row.text).toBeGreaterThanOrEqual(44);
				expect(row.cut, row.text).toBe(false);
				expect(row.broken, row.text).toBe(0);
			}
			// The page's full name wraps between its words, never cut.
			expect(path.rows.at(-1)!.lines).toBeGreaterThan(1);
			expect(await page.$eval(PAGE_BUTTON, (b) => b.getAttribute('aria-expanded'))).toBe('true');
			expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
			await page.close();
		});
	}

	// The current level wears the house's selected row, the tint and the
	// accent's text a sidebar's current page wears, not weight alone.
	it("marks the current level with the house's selected row, the others plain", async () => {
		const page = await livePage(browser, Header, HEADER, 390);
		await page.click(PAGE_BUTTON);
		const rows = await page.$$eval('[data-shell-header] .menu.path [role="menuitem"]', (items) =>
			items.map((row) => {
				const style = getComputedStyle(row);
				return {
					current: row.getAttribute('aria-current'),
					fill: style.backgroundColor,
					text: style.color
				};
			})
		);
		const current = rows.filter((row) => row.current === 'page');
		expect(current).toHaveLength(1);
		expect(current[0]).toMatchObject({ fill: 'rgb(239, 246, 255)', text: 'rgb(37, 99, 235)' });
		for (const row of rows.filter((entry) => entry.current !== 'page'))
			expect(row.fill).toBe('rgba(0, 0, 0, 0)');
		await page.close();
	});

	it('closes on Escape and on a press outside, the focus back on the page button', async () => {
		const page = await livePage(browser, Header, HEADER, 390);
		await page.click(PAGE_BUTTON);
		expect(await openPath(page)).not.toBeNull();
		await page.keyboard.press('Escape');
		expect(await openPath(page)).toBeNull();
		expect(await focused(page)).toBe('page button');
		await page.click(PAGE_BUTTON);
		expect(await openPath(page)).not.toBeNull();
		await page.mouse.click(195, 600);
		expect(await openPath(page)).toBeNull();
		expect(await focused(page)).toBe('page button');
		await page.close();
	});

	it('is not there above the compact width, where the trail is one line', async () => {
		const page = await livePage(browser, Header, HEADER, 1440);
		for (const button of await boxes(page, PAGE_BUTTON)) expect(button.width).toBe(0);
		const crumbs = await boxes(page, '[data-shell-header] nav.gawdux-breadcrumbs > ol > li');
		expect(crumbs.length).toBe(4);
		expect(new Set(crumbs.map((crumb) => Math.round(crumb.top + crumb.height / 2))).size).toBe(1);
		await page.close();
	});
});

for (const dark of [false, true]) {
	const theme = dark ? 'dark' : 'light';
	describe.skipIf(GEOMETRY_SKIP !== null)(`header controls in ${theme}`, () => {
		const paint = (page: Page, selector: string) =>
			page.$eval(selector, (element) => {
				const style = getComputedStyle(element);
				return {
					background: style.backgroundColor,
					shadow: style.boxShadow,
					border: style.borderTopColor
				};
			});
		const CLEAR = 'rgba(0, 0, 0, 0)';

		it('are flat at rest at 1440: the account card and the theme toggle', async () => {
			const page = await serverPage(browser, Header, 1440, {}, dark);
			for (const selector of ['[data-account-card] .card', '[aria-label="Toggle dark mode"]']) {
				const got = await paint(page, selector);
				expect(got.background, selector).toBe(CLEAR);
				expect(got.shadow, selector).toBe('none');
			}
			expect((await paint(page, '[data-account-card] .card')).border).toBe(CLEAR);
			await page.close();
		});

		it('fill quietly under the pointer, with no shadow', async () => {
			const page = await serverPage(browser, Header, 1440, {}, dark);
			const fill = await page.evaluate(() => {
				const probe = document.createElement('div');
				probe.style.backgroundColor = 'var(--gawdux-header-control-hover-surface)';
				document.body.append(probe);
				const colour = getComputedStyle(probe).backgroundColor;
				probe.remove();
				return colour;
			});
			expect(fill).not.toBe(CLEAR);
			for (const selector of ['[data-account-card] .card', '[aria-label="Toggle dark mode"]']) {
				await page.hover(selector);
				// The fill arrives over a short transition.
				await page.waitForFunction(
					([target, colour]) =>
						getComputedStyle(document.querySelector(target!)!).backgroundColor === colour,
					[selector, fill] as const
				);
				expect((await paint(page, selector)).shadow, selector).toBe('none');
			}
			await page.close();
		});

		it("are flat at rest in the phone shell's bar at 390: the account", async () => {
			const page = await serverPage(browser, Bar, 390, { occupied: false }, dark);
			const got = await paint(page, `[aria-label="${ACCOUNT}"]`);
			expect(got.background).toBe(CLEAR);
			expect(got.shadow).toBe('none');
			await page.close();
		});
	});
}

describe.skipIf(GEOMETRY_SKIP !== null)("the account's sheet on a phone", () => {
	it('rises above the bar, the theme row its label and switch on one line, and turns the theme with the sheet left open', async () => {
		const page = await livePage(browser, Bar, BAR, 390);
		await page.click(`[aria-label="${ACCOUNT}"]`);
		const [bar] = await boxes(page, '[data-testid="bar"]');
		const [sheet] = await boxes(page, '[data-account-sheet]');
		const row = '[data-account-sheet] [role="menuitemcheckbox"]';
		const [theme] = await boxes(page, row);
		const [label] = await boxes(page, `${row} .gawdux-user-menu-label`);
		const [toggle] = await boxes(page, `${row} .switch`);
		expect(sheet!.bottom).toBeLessThanOrEqual(bar!.top + 0.5);
		expect(sheet!.left).toBeGreaterThanOrEqual(0);
		expect(sheet!.right).toBeLessThanOrEqual(390);
		expect(sheet!.top).toBeGreaterThanOrEqual(0);
		for (const part of [label!, toggle!]) {
			expect(part.left).toBeGreaterThanOrEqual(theme!.left);
			expect(part.right).toBeLessThanOrEqual(theme!.right);
			expect(
				Math.abs(part.top + part.height / 2 - (theme!.top + theme!.height / 2))
			).toBeLessThanOrEqual(1);
		}
		expect(toggle!.left).toBeGreaterThan(label!.right);
		expect(await page.$eval(row, (el) => el.textContent?.trim())).toBe('Dark mode');
		expect(await page.$eval(row, (el) => el.getAttribute('aria-checked'))).toBe('false');
		await page.click(row);
		expect(await page.evaluate(() => document.documentElement.classList.contains('dark'))).toBe(
			true
		);
		expect(await page.$eval(row, (el) => el.getAttribute('aria-checked'))).toBe('true');
		expect((await boxes(page, '[data-account-sheet]'))[0]!.height).toBeGreaterThan(0);
		await page.close();
	});

	it('sets Profile and Sign out side by side, each half the sheet, and the version line last', async () => {
		const page = await livePage(browser, Bar, BAR, 390);
		await page.click(`[aria-label="${ACCOUNT}"]`);
		const [profile] = await boxes(page, '[data-account-sheet] [data-account-profile]');
		const [signOut] = await boxes(page, '[data-account-sheet] [data-account-sign-out]');
		expect(Math.abs(profile!.top - signOut!.top)).toBeLessThanOrEqual(0.5);
		expect(Math.abs(profile!.width - signOut!.width)).toBeLessThanOrEqual(0.5);
		expect(signOut!.left).toBeGreaterThanOrEqual(profile!.right);
		const [sheet] = await boxes(page, '[data-account-sheet]');
		const [version] = await boxes(page, '[data-account-sheet] [data-account-version]');
		expect(Math.abs(version!.bottom - sheet!.bottom)).toBeLessThanOrEqual(1.5);
		await page.close();
	});
});

describe.skipIf(GEOMETRY_SKIP !== null)('the account card in a header', () => {
	it('grows downward from its place when opened, the header holding still', async () => {
		// A short trail fits beside the controls at full size: nothing yields.
		const page = await livePage(browser, Header, HEADER, 1440, {
			trail: [{ label: 'Work', href: '/app/work' }, { label: 'Records' }]
		});
		const [before] = await boxes(page, '[data-account-card]');
		expect(before!.width).toBe(270);
		const [notices] = await boxes(page, '[data-testid="notices"]');
		await page.click(`[aria-label="${ACCOUNT}"]`);
		await page.waitForFunction(
			() => document.querySelector('[data-account-card] .card')!.getBoundingClientRect().height > 120
		);
		const [after] = await boxes(page, '[data-account-card]');
		const [card] = await boxes(page, '[data-account-card] .card');
		expect(after).toEqual(before);
		expect((await boxes(page, '[data-testid="notices"]'))[0]).toEqual(notices);
		expect(card!.width).toBe(270);
		expect(card!.top).toBe(before!.top);
		expect(card!.right).toBe(before!.right);
		const [profile] = await boxes(page, '[data-account-profile]');
		const [signOut] = await boxes(page, '[data-account-sign-out]');
		expect(Math.abs(profile!.top - signOut!.top)).toBeLessThanOrEqual(0.5);
		await page.close();
	});

	it('is the avatar alone when the header compacts it, and opens to the left from it', async () => {
		// A trail too long for the row beside the full controls makes them yield.
		const long = Array.from({ length: 7 }, (_, index) => ({
			label: `A level with a long name ${index + 1}`,
			href: `/app/level/${index + 1}`
		}));
		const page = await livePage(browser, Header, HEADER, 1100, { trail: long });
		await page.waitForFunction(
			() =>
				document.querySelector('[data-account-card]')?.classList.contains('compact') &&
				document.querySelector('[data-account-card] .card')!.getBoundingClientRect().width === 45
		);
		const [closed] = await boxes(page, '[data-account-card] .card');
		// The footprint is the avatar's too: the trail has the room.
		expect((await boxes(page, '[data-account-card]'))[0]!.width).toBe(45);
		expect(closed!.width).toBe(45);
		await page.click(`[aria-label="${ACCOUNT}"]`);
		await page.waitForFunction(
			() => document.querySelector('[data-account-card] .card')!.getBoundingClientRect().width === 270
		);
		const [open] = await boxes(page, '[data-account-card] .card');
		expect(open!.right).toBe(closed!.right);
		await page.close();
	});
});

describe.skipIf(GEOMETRY_SKIP !== null)('the frame on a phone', () => {
	for (const width of [360, 390, 900]) {
		it(`drops the side rail and leaves the bar's room under the page, at ${width}`, async () => {
			const page = await serverPage(browser, Shell, width);
			const [shell] = await boxes(page, '[data-app-shell]');
			expect(shell!.height).toBe(HEIGHT);
			for (const box of await boxes(page, '[data-shell-rail]')) expect(box.width).toBe(0);
			const [column] = await boxes(page, '[data-shell-main-column]');
			expect(column!.left).toBe(0);
			expect(column!.width).toBe(width);
			const [bar] = await boxes(page, '.gawdux-shell-bar');
			expect(bar!.height).toBe(48);
			expect(bar!.bottom).toBe(HEIGHT);
			const [content] = await boxes(page, '[data-testid="page"]');
			expect(content!.top).toBe(48);
			expect(content!.bottom).toBe(bar!.top);
			expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
				width
			);
			expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(HEIGHT);
			await page.close();
		});
	}

	it('gives the right column no width at 390: its rail is the bar, its cap is not drawn', async () => {
		const page = await serverPage(browser, Shell, 390, { right: true, panelOpen: true });
		const [column] = await boxes(page, '[data-shell-right-column]');
		expect(column!.width).toBe(0);
		for (const box of await boxes(page, '[data-shell-right-cap]')) expect(box.height).toBe(0);
		const [main] = await boxes(page, '[data-shell-main-column]');
		expect(main!.width).toBe(390);
		const bars = await boxes(page, '.gawdux-shell-bar');
		expect(bars).toHaveLength(1);
		expect(bars[0]!.bottom).toBe(HEIGHT);
		expect(bars[0]!.width).toBe(390);
		const account = (await boxes(page, `[aria-label="${ACCOUNT}"]`)).filter((box) => box.width > 0);
		expect(account).toHaveLength(1);
		expect(390 - account[0]!.right).toBeLessThanOrEqual(8);
		await page.close();
	});

	it('sets the rail, the main column and the right column side by side at 1440, no bar', async () => {
		const page = await serverPage(browser, Shell, 1440, { right: true, panelOpen: true });
		const [rail] = await boxes(page, '[data-shell-rail]');
		const [main] = await boxes(page, '[data-shell-main-column]');
		const [column] = await boxes(page, '[data-shell-right-column]');
		expect(rail!.left).toBe(0);
		expect(rail!.width).toBeGreaterThan(0);
		expect(main!.left).toBe(rail!.right);
		expect(column!.left).toBe(main!.right);
		expect(column!.right).toBe(1440);
		// The column is the open panel and the 48px rail; its cap is level with the header.
		expect(column!.width).toBe(368 + 48);
		const [cap] = await boxes(page, '[data-shell-right-cap]');
		const [header] = await boxes(page, '[data-shell-header]');
		expect(cap!.height).toBe(56);
		expect(cap!.top).toBe(header!.top);
		expect(cap!.width).toBe(368 + 48);
		const [toggle] = await boxes(page, '[data-shell-right-cap] [data-theme-toggle]');
		expect(toggle!.width).toBe(48);
		expect(toggle!.right).toBe(1440);
		// Nothing is left under the page for a bar that is not there.
		const [shell] = await boxes(page, '[data-app-shell]');
		expect(main!.bottom).toBe(shell!.bottom);
		expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(HEIGHT);
		await page.close();
	});

	it('reaches the right edge at 1440 with no right column, the header holding the theme toggle', async () => {
		const page = await serverPage(browser, Shell, 1440);
		const [main] = await boxes(page, '[data-shell-main-column]');
		expect(main!.right).toBe(1440);
		for (const box of await boxes(page, '.gawdux-shell-bar')) expect(box.height).toBe(0);
		const [toggle] = await boxes(page, '[data-shell-header] [data-theme-toggle]');
		expect(1440 - toggle!.right).toBe(8);
		await page.close();
	});
});

describe.skipIf(GEOMETRY_SKIP !== null)("the rail's foot above the compact width", () => {
	// The page's panel stands the frame's gutter off the screen's bottom. A
	// rail running to the screen's edge ended 8px past it.
	it('ends level with the panel of the page at 1440, its inner corner rounded', async () => {
		const page = await serverPage(browser, Shell, 1440, { frame: true });
		const [rail] = await boxes(page, '[data-shell-rail] .app-sidebar');
		const [panel] = await boxes(page, '.page-frame-panel');
		expect(panel!.bottom).toBe(HEIGHT - 8);
		expect(rail!.bottom).toBe(panel!.bottom);
		expect(rail!.top).toBe(0);
		expect(rail!.left).toBe(0);
		const corner = await page.$eval('[data-shell-rail] .app-sidebar', (element) => {
			const style = getComputedStyle(element);
			return { radius: style.borderBottomRightRadius, overflow: style.overflowY };
		});
		expect(corner).toEqual({ radius: '8px', overflow: 'hidden' });
		// The frame itself still fills the screen and does not scroll.
		expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(HEIGHT);
		await page.close();
	});

	// The drawer's rail is as tall as the drawer: one only as tall as its
	// items could not scroll a list longer than the screen.
	it('keeps the drawer flush to the bottom edge and square at 390', async () => {
		const page = await livePage(browser, Shell, SHELL, 390);
		await page.click('[aria-label="Open navigation"]');
		await page.waitForSelector('.gawdux-shell-navigation-drawer');
		const [rail] = await boxes(page, '.gawdux-shell-navigation-drawer .app-sidebar');
		expect(rail!.top).toBe(0);
		expect(rail!.bottom).toBe(HEIGHT);
		expect(rail!.width).toBe(288);
		expect(
			await page.$eval(
				'.gawdux-shell-navigation-drawer .app-sidebar',
				(element) => getComputedStyle(element).borderBottomRightRadius
			)
		).toBe('0px');
		await page.close();
	});
});

describe.skipIf(GEOMETRY_SKIP !== null)('the frame on paper', () => {
	/** The shell under print media at a printed page's width. */
	async function printed(page: Page) {
		await page.emulateMedia({ media: 'print' });
		return page.$eval('[data-app-shell]', (shell) => {
			const style = getComputedStyle(shell);
			return {
				display: style.display,
				padding: [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft]
			};
		});
	}
	/** The boxes of what is drawn: an element not displayed has none. */
	const drawn = async (page: Page, selector: string) =>
		(await boxes(page, selector)).filter((box) => box.width > 0 || box.height > 0);

	// A printed page (Letter and A4 upright are 794 to 816 CSS px wide) is
	// narrower than the compact width: the bar's rules match it. The fixed
	// bar was printed at the foot of every page, with 48px left under it.
	for (const right of [false, true]) {
		it(`prints the page alone at 816, ${right ? 'with a right column' : 'with no right column'}: no bar, no room left for one, no rail`, async () => {
			const page = await serverPage(browser, Shell, 816, { right, panelOpen: right });
			// On the screen at this width the bar is there, with its room.
			expect(await drawn(page, '.gawdux-shell-bar')).toHaveLength(1);
			const shell = await printed(page);
			expect(shell.display).toBe('block');
			expect(shell.padding).toEqual(['0px', '0px', '0px', '0px']);
			expect(await drawn(page, '.gawdux-shell-bar')).toEqual([]);
			expect(await drawn(page, '[data-shell-rail]')).toEqual([]);
			expect(await drawn(page, '[data-shell-header]')).toEqual([]);
			expect((await drawn(page, '[data-testid="page"]')).length).toBe(1);
			await page.close();
		});
	}

	it('prints no rail at a width above the compact one', async () => {
		const page = await serverPage(browser, Shell, 1440, { frame: true });
		const shell = await printed(page);
		expect(shell.padding).toEqual(['0px', '0px', '0px', '0px']);
		expect(await drawn(page, '[data-shell-rail]')).toEqual([]);
		expect(await drawn(page, '.gawdux-shell-bar')).toEqual([]);
		await page.close();
	});

	it('prints no open drawer over the page at 390', async () => {
		const page = await livePage(browser, Shell, SHELL, 390);
		await page.click('[aria-label="Open navigation"]');
		await page.waitForSelector('.gawdux-shell-navigation-drawer');
		expect(await drawn(page, '.gawdux-shell-navigation-layer')).toHaveLength(1);
		await printed(page);
		expect(await drawn(page, '.gawdux-shell-navigation-layer')).toEqual([]);
		expect(await drawn(page, '.gawdux-shell-navigation-drawer')).toEqual([]);
		expect(await drawn(page, '.gawdux-shell-bar')).toEqual([]);
		await page.close();
	});
});

describe.skipIf(GEOMETRY_SKIP !== null)('the navigation drawer on a phone', () => {
	for (const width of [360, 390]) {
		it(`opens from the left edge over the page, 288px wide and as tall as the screen, at ${width}`, async () => {
			const page = await livePage(browser, Shell, SHELL, width);
			expect(await boxes(page, '.gawdux-shell-navigation-drawer')).toHaveLength(0);
			await page.click('[aria-label="Open navigation"]');
			await page.waitForSelector('.gawdux-shell-navigation-drawer');
			const [layer] = await boxes(page, '.gawdux-shell-navigation-layer');
			expect(layer).toMatchObject({ left: 0, top: 0, width, height: HEIGHT });
			const [drawer] = await boxes(page, '.gawdux-shell-navigation-drawer');
			expect(drawer!.left).toBe(0);
			expect(drawer!.top).toBe(0);
			expect(drawer!.width).toBe(288);
			expect(drawer!.height).toBe(HEIGHT);
			const [rail] = await boxes(page, '.gawdux-shell-navigation-drawer .app-sidebar');
			expect(rail!.width).toBe(288);
			const [head] = await boxes(page, '[data-shell-drawer-head]');
			expect(head!.height).toBe(56);
			const [close] = await boxes(page, '.gawdux-shell-navigation-close');
			expect(close!.width).toBe(44);
			expect(close!.height).toBe(44);
			expect(close!.right).toBeLessThanOrEqual(drawer!.right);
			// The focus is in the drawer, on its Close button, and the page behind is inert.
			expect(
				await page.evaluate(() =>
					document.activeElement?.classList.contains('gawdux-shell-navigation-close')
				)
			).toBe(true);
			expect(
				await page.evaluate(() => document.querySelector<HTMLElement>('[data-shell-main]')!.inert)
			).toBe(true);
			await page.keyboard.press('Escape');
			await page.waitForSelector('.gawdux-shell-navigation-drawer', { state: 'detached' });
			expect(
				await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))
			).toBe('Open navigation');
			await page.close();
		});
	}

	it('closes on a press on the backdrop beside it', async () => {
		const page = await livePage(browser, Shell, SHELL, 390);
		await page.click('[aria-label="Open navigation"]');
		await page.waitForSelector('.gawdux-shell-navigation-drawer');
		await page.mouse.click(360, 400);
		await page.waitForSelector('.gawdux-shell-navigation-drawer', { state: 'detached' });
		await page.close();
	});

	it('is not there above the compact width: no menu button to open it', async () => {
		const page = await livePage(browser, Shell, SHELL, 1440);
		for (const box of await boxes(page, '[aria-label="Open navigation"]'))
			expect(box.width).toBe(0);
		expect(await boxes(page, '.gawdux-shell-navigation-layer')).toHaveLength(0);
		await page.close();
	});

	// Opened by the host on a wide screen it was a modal over the whole
	// screen, 1440 by 844, the page behind it inert.
	it('is not drawn above the compact width when the host opens it there: the page stays live', async () => {
		const page = await livePage(browser, Shell, SHELL, 1440, { navigationOpen: true });
		expect(await boxes(page, '.gawdux-shell-navigation-layer')).toHaveLength(0);
		expect(
			await page.evaluate(() => document.querySelector<HTMLElement>('[data-shell-main]')!.inert)
		).toBe(false);
		expect(
			await page.evaluate(() => document.querySelector<HTMLElement>('[data-shell-rail]')!.inert)
		).toBe(false);
		expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe('hidden');
		const [rail] = await boxes(page, '[data-shell-rail]');
		expect(rail!.width).toBeGreaterThan(0);
		await page.close();
	});

	it('is drawn when the host opens it at the compact width', async () => {
		const page = await livePage(browser, Shell, SHELL, 390, { navigationOpen: true });
		await page.waitForSelector('.gawdux-shell-navigation-drawer');
		const [layer] = await boxes(page, '.gawdux-shell-navigation-layer');
		expect(layer).toMatchObject({ left: 0, top: 0, width: 390, height: HEIGHT });
		await page.close();
	});
});
