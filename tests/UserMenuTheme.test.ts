import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import UserMenuThemeHarness from './fixtures/UserMenuThemeHarness.svelte';
import * as components from '../src/lib/components/index';
import * as utils from '../src/lib/utils/index';

// The account menu's theme row: the dark theme's switch with its label, a
// menu row the arrows reach, which turns the theme over and keeps it.

function trigger(): HTMLElement {
	return screen.getByRole('button', { name: 'Account menu for Ada Lovelace' });
}

beforeEach(() => {
	document.documentElement.classList.remove('dark');
	localStorage.clear();
	document.cookie = 'host.colorTheme=; path=/; max-age=0';
});

afterEach(() => {
	cleanup();
	document.documentElement.classList.remove('dark');
});

describe('UserMenu: the theme row', () => {
	it('is the dark theme switch with its label, a menu row whose state is checked', async () => {
		render(UserMenuThemeHarness);
		await fireEvent.click(trigger(), { detail: 1 });
		const row = screen.getByRole('menuitemcheckbox', { name: 'Dark mode' });
		expect(row.getAttribute('aria-checked')).toBe('false');
		expect(row.getAttribute('tabindex')).toBe('-1');
		expect(row.classList.contains('gawdux-user-menu-item')).toBe(true);
		expect(row.querySelector('.switch')?.getAttribute('aria-hidden')).toBe('true');
	});

	it('turns the theme over and keeps it, leaving the menu open with the new state', async () => {
		render(UserMenuThemeHarness);
		await fireEvent.click(trigger(), { detail: 1 });
		const row = screen.getByRole('menuitemcheckbox', { name: 'Dark mode' });
		await fireEvent.click(row);
		expect(document.documentElement.classList.contains('dark')).toBe(true);
		expect(localStorage.getItem('color-theme')).toBe('dark');
		expect(document.cookie).toContain('host.colorTheme=dark');
		expect(row.getAttribute('aria-checked')).toBe('true');
		expect(row.querySelector('.switch')?.classList.contains('on')).toBe(true);
		expect(trigger().getAttribute('aria-expanded')).toBe('true');
		await fireEvent.click(row);
		expect(document.documentElement.classList.contains('dark')).toBe(false);
		expect(localStorage.getItem('color-theme')).toBe('light');
		expect(row.getAttribute('aria-checked')).toBe('false');
	});

	it('follows a flip made anywhere else while it shows', async () => {
		render(UserMenuThemeHarness);
		await fireEvent.click(trigger(), { detail: 1 });
		const row = screen.getByRole('menuitemcheckbox', { name: 'Dark mode' });
		document.documentElement.classList.add('dark');
		await new Promise((resolve) => setTimeout(resolve, 0));
		await tick();
		expect(row.getAttribute('aria-checked')).toBe('true');
	});

	it('is a row the arrows reach, after the items and before sign-out', async () => {
		render(UserMenuThemeHarness);
		trigger().focus();
		await fireEvent.keyDown(trigger(), { key: 'ArrowDown' });
		await tick();
		const menu = screen.getByRole('menu');
		expect((document.activeElement as HTMLElement).textContent?.trim()).toBe('Profile');
		await fireEvent.keyDown(menu, { key: 'ArrowDown' });
		expect(document.activeElement).toBe(screen.getByRole('menuitemcheckbox', { name: 'Dark mode' }));
		await fireEvent.keyDown(menu, { key: 'ArrowDown' });
		expect((document.activeElement as HTMLElement).textContent?.trim()).toBe('Sign out');
	});

	it('is not drawn without the theme', async () => {
		render(UserMenuThemeHarness, { props: { theme: false } });
		await fireEvent.click(trigger(), { detail: 1 });
		expect(screen.queryByRole('menuitemcheckbox')).toBeNull();
	});

	it('is exported for a host drawing its own menu, with the theme functions it shares', () => {
		expect(components.UserMenuThemeRow).toBeTruthy();
		expect(utils.toggleColorTheme).toBeTypeOf('function');
		expect(utils.setColorTheme).toBeTypeOf('function');
		expect(utils.watchColorTheme).toBeTypeOf('function');
		expect(utils.COLOR_THEME_STORAGE_KEY).toBe('color-theme');
	});
});
