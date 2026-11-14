// @vitest-environment jsdom
/**
 * The host's controls at the right end of the phone shell's bar: the
 * notices, then the account, whose sheet holds the theme as a row, the
 * switch "Dark mode" with its state, the shell's one theme control at that
 * width.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import Bar from './fixtures/shell/ShellBarHarness.svelte';

let app: ReturnType<typeof mount> | null = null;
beforeEach(() => {
	vi.stubGlobal(
		'ResizeObserver',
		class {
			observe() {}
			unobserve() {}
			disconnect() {}
		}
	);
	document.documentElement.classList.remove('dark');
});
afterEach(async () => {
	if (app) await unmount(app);
	app = null;
	vi.unstubAllGlobals();
	document.body.innerHTML = '';
	document.documentElement.classList.remove('dark');
});

function endControls(): (string | null)[] {
	const end = document.querySelector('.gawdux-shell-bar-end')!;
	return Array.from(end.querySelectorAll<HTMLElement>('button[aria-haspopup]'))
		.filter((button) => !button.closest('.gawdux-shell-bar-sheet'))
		.map((button) => button.getAttribute('aria-label'));
}

async function openSheet(): Promise<HTMLElement> {
	const trigger = document.querySelector<HTMLButtonElement>(
		'[aria-label="Account menu for Quinn Adler"]'
	)!;
	trigger.click();
	flushSync();
	await tick();
	return document.querySelector<HTMLElement>('[data-account-sheet]')!;
}

describe('the account controls in the phone shell bar', () => {
	for (const occupied of [false, true]) {
		it(`end with the account, after the notices, with the bar ${occupied ? 'occupied' : 'empty'}`, () => {
			app = mount(Bar, { target: document.body, props: { occupied } });
			flushSync();
			expect(endControls()).toEqual(['Notices (2)', 'Account menu for Quinn Adler']);
			// The end is the bar's last child, after what occupies it.
			const bar = document.querySelector('[data-testid="bar"]')!;
			expect(bar.lastElementChild?.classList.contains('gawdux-shell-bar-end')).toBe(true);
		});
	}

	it('draw nothing in a slot the host leaves empty', () => {
		app = mount(Bar, { target: document.body, props: { occupied: false, filled: false } });
		flushSync();
		const end = document.querySelector('.gawdux-shell-bar-end')!;
		expect(end.querySelector('button, a, [data-shell-bar-account]')).toBeNull();
		expect(end.textContent?.trim()).toBe('');
	});

	it("hold the theme as a row of the account's sheet, one control turning it over", async () => {
		app = mount(Bar, { target: document.body, props: { occupied: false } });
		flushSync();
		const sheet = await openSheet();
		expect(sheet.classList.contains('gawdux-shell-bar-sheet')).toBe(true);
		const row = sheet.querySelector<HTMLElement>('[role="menuitemcheckbox"]')!;
		expect(row.textContent?.replace(/\s+/g, ' ').trim()).toBe('Dark mode');
		expect(row.getAttribute('aria-checked')).toBe('false');
		expect(sheet.querySelector('[role="menu"]')!.contains(row)).toBe(true);
		row.click();
		flushSync();
		expect(document.documentElement.classList.contains('dark')).toBe(true);
		expect(row.getAttribute('aria-checked')).toBe('true');
		// The sheet stays open, and the theme has one control.
		expect(document.querySelector('[data-account-sheet]')).not.toBeNull();
		expect(
			document.querySelectorAll('[role="menuitemcheckbox"], [aria-label="Toggle dark mode"]')
		).toHaveLength(1);
	});

	it("hold the host's extra rows and its reading in the sheet, the person first and the version last", async () => {
		app = mount(Bar, { target: document.body, props: { occupied: true } });
		flushSync();
		const sheet = await openSheet();
		expect(sheet.querySelector('.person')?.textContent).toContain('Quinn Adler');
		expect(sheet.querySelector('.person')?.textContent).toContain('quinn@example.test');
		const menu = sheet.querySelector('[role="menu"]')!;
		const rows = Array.from(
			menu.querySelectorAll('[role="menuitem"], [role="menuitemcheckbox"]'),
			(row) => row.textContent?.replace(/\s+/g, ' ').trim()
		);
		expect(rows).toEqual(['Profile', 'Sign out', 'Dark mode', 'North site']);
		expect(sheet.querySelector('[data-testid="meter"]')?.textContent).toBe('62%');
		expect(sheet.lastElementChild?.hasAttribute('data-account-version')).toBe(true);
		// An extra row closes the sheet through the menu's own close.
		sheet.querySelector<HTMLElement>('[data-testid="extra"]')!.click();
		flushSync();
		await tick();
		expect(document.querySelector('[data-account-sheet]')).toBeNull();
	});

	it('is the avatar alone in the bar, named for the person', () => {
		app = mount(Bar, { target: document.body, props: { occupied: false } });
		flushSync();
		const card = document.querySelector<HTMLElement>('[data-account-card="bar"]')!;
		const trigger = card.querySelector<HTMLButtonElement>('button[aria-haspopup="menu"]')!;
		expect(trigger.textContent?.trim()).toBe('QA');
		expect(trigger.getAttribute('title')).toBe('Quinn Adler');
		expect(trigger.id).toBe('gawdux-account-card-bar-trigger');
	});
});
