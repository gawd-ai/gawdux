import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import UserMenuInBarHarness from './fixtures/UserMenuInBarHarness.svelte';

afterEach(() => cleanup());

describe('UserMenu in the phone shell bar', () => {
	it('is the avatar alone there, and opens its body as a sheet above the bar', async () => {
		const { container } = render(UserMenuInBarHarness);
		const root = container.querySelector('[data-user-menu]') as HTMLElement;
		expect(root.classList.contains('in-bar')).toBe(true);
		const body = container.querySelector('.body') as HTMLElement;
		expect(body.classList.contains('gawdux-shell-bar-sheet')).toBe(false);
		await fireEvent.click(screen.getByRole('button', { name: 'Account menu for Ada Lovelace' }), {
			detail: 1
		});
		expect(body.classList.contains('gawdux-shell-bar-sheet')).toBe(true);
	});

	it('keeps its card in a header', async () => {
		const { container } = render(UserMenuInBarHarness, { props: { inBar: false } });
		const root = container.querySelector('[data-user-menu]') as HTMLElement;
		expect(root.classList.contains('in-bar')).toBe(false);
		await fireEvent.click(screen.getByRole('button', { name: 'Account menu for Ada Lovelace' }), {
			detail: 1
		});
		expect(container.querySelector('.gawdux-shell-bar-sheet')).toBeNull();
	});
});
