import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { tick } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LockOutline, UsersOutline } from 'flowbite-svelte-icons';
import UserMenu from '../src/lib/components/UserMenu.svelte';
import UserMenuHarness from './fixtures/UserMenuHarness.svelte';
import type { UserMenuItem } from '../src/lib/types/user-menu.types';

afterEach(() => {
	cleanup();
	vi.useRealTimers();
});

const ITEMS: UserMenuItem[] = [
	{ label: 'Members', href: '/members', icon: UsersOutline },
	{ label: 'Remote access', href: '/remote', icon: LockOutline }
];

function renderMenu(props: Record<string, unknown> = {}) {
	const result = render(UserMenu, {
		props: {
			name: 'Ada Lovelace',
			email: 'ada@example.test',
			tenant: 'Analytical Engines',
			access: ['Owner'],
			items: ITEMS,
			signOutAction: '/signout',
			product: 'Product',
			version: 'v0.10',
			...props
		}
	});
	const root = result.container.querySelector('[data-user-menu]') as HTMLElement;
	const trigger = screen.getByRole('button', { name: 'Account menu for Ada Lovelace' });
	const body = result.container.querySelector('.body') as HTMLElement;
	return { ...result, root, trigger, body };
}

/** A pointer click: a mouse click carries a non-zero detail. */
async function pointerClick(el: HTMLElement) {
	await fireEvent.click(el, { detail: 1 });
}

/** Svelte sets `inert` as a property; jsdom does not reflect it to the attribute. */
function isInert(el: HTMLElement): boolean {
	return el.hasAttribute('inert') || (el as HTMLElement & { inert?: boolean }).inert === true;
}

function menuItems(container: HTMLElement): HTMLElement[] {
	return Array.from(container.querySelectorAll<HTMLElement>('[role="menuitem"]'));
}

describe('UserMenu trigger', () => {
	it('shows the name and the email on two lines, closed and open, and never the tenant', async () => {
		const { trigger } = renderMenu();
		const lines = () => Array.from(trigger.querySelectorAll('.identity > span')).map((s) => s.textContent);
		expect(lines()).toEqual(['Ada Lovelace', 'ada@example.test']);
		expect(trigger.textContent).not.toContain('Analytical Engines');

		await pointerClick(trigger);
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
		expect(lines()).toEqual(['Ada Lovelace', 'ada@example.test']);
		expect(trigger.textContent).not.toContain('Analytical Engines');
	});

	it('is a menu button that names the person and controls the body', () => {
		const { trigger, body } = renderMenu();
		expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
		expect(trigger.getAttribute('aria-controls')).toBe(body.id);
	});

	it('derives the initials from the first and last word, or takes them from the host', () => {
		const cases: [string, string | undefined, string][] = [
			['Ada Lovelace', undefined, 'AL'],
			['ada king lovelace', undefined, 'AL'],
			['Ada', undefined, 'A'],
			['  Ada   Lovelace  ', undefined, 'AL'],
			['Ada Lovelace', 'XY', 'XY']
		];
		for (const [name, initials, expected] of cases) {
			const { container, unmount } = render(UserMenu, { props: { name, initials } });
			expect(container.querySelector('.avatar')?.textContent?.trim(), name).toBe(expected);
			unmount();
		}
	});

	it('draws the avatar image when given one and returns to the initials if it fails', async () => {
		const { container } = render(UserMenu, {
			props: { name: 'Ada Lovelace', avatarSrc: '/ada.png' }
		});
		const img = container.querySelector('.avatar img') as HTMLImageElement;
		expect(img.getAttribute('src')).toBe('/ada.png');
		expect(img.getAttribute('alt')).toBe('');
		await fireEvent.error(img);
		expect(container.querySelector('.avatar img')).toBeNull();
		expect(container.querySelector('.avatar')?.textContent?.trim()).toBe('AL');
	});
});

describe('UserMenu body', () => {
	it('is inert while closed and reachable while open', async () => {
		const { root, trigger, body } = renderMenu();
		expect(isInert(body)).toBe(true);
		expect(root.dataset.state).toBe('closed');
		await pointerClick(trigger);
		expect(isInert(body)).toBe(false);
		expect(root.dataset.state).toBe('open');
		await pointerClick(trigger);
		expect(isInert(body)).toBe(true);
	});

	it('puts the tenant and the access chips in the body, outside the menu', () => {
		const { body } = renderMenu({ access: ['Owner', 'Billing'] });
		const context = body.querySelector('[data-user-menu-context]') as HTMLElement;
		expect(context.querySelector('.tenant')?.textContent).toBe('Analytical Engines');
		expect(context.querySelector('.tenant')?.getAttribute('title')).toBe('Analytical Engines');
		expect(Array.from(context.querySelectorAll('.chip')).map((c) => c.textContent)).toEqual([
			'Owner',
			'Billing'
		]);
		expect(context.closest('[role="menu"]')).toBeNull();
	});

	it('leaves the context row out when there is neither a tenant nor access', () => {
		const { body } = renderMenu({ tenant: undefined, access: [] });
		expect(body.querySelector('[data-user-menu-context]')).toBeNull();
	});

	it('renders link rows and button rows as menu items with their icons', async () => {
		const onclick = vi.fn();
		const { container } = renderMenu({
			items: [...ITEMS, { label: 'Preferences', onclick, icon: UsersOutline }]
		});
		const menu = screen.getByRole('menu', { hidden: true });
		const rows = menuItems(container);
		expect(rows.map((r) => r.textContent?.trim())).toEqual([
			'Members',
			'Remote access',
			'Preferences',
			'Sign out'
		]);
		expect(rows[0]?.tagName).toBe('A');
		expect(rows[0]?.getAttribute('href')).toBe('/members');
		expect(rows[2]?.tagName).toBe('BUTTON');
		for (const row of rows) {
			expect(row.getAttribute('tabindex')).toBe('-1');
			expect(row.querySelector('.gawdux-user-menu-icon svg'), row.textContent ?? '').toBeTruthy();
		}
		// The menu holds menu items and the separator only.
		for (const child of Array.from(menu.querySelectorAll(':scope > *'))) {
			const role = child.getAttribute('role');
			expect(['menuitem', 'separator', 'none']).toContain(role);
		}
		expect(menu.getAttribute('aria-labelledby')).toBe('gawdux-user-menu-trigger');
	});

	it('closes when a link row is chosen', async () => {
		const { container, trigger } = renderMenu();
		await pointerClick(trigger);
		const members = menuItems(container)[0] as HTMLAnchorElement;
		members.addEventListener('click', (e) => e.preventDefault());
		await fireEvent.click(members);
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
	});

	it('runs a button row handler after closing', async () => {
		const onclick = vi.fn();
		const { container, trigger } = renderMenu({ items: [{ label: 'Preferences', onclick }] });
		await pointerClick(trigger);
		await fireEvent.click(menuItems(container)[0] as HTMLElement);
		expect(onclick).toHaveBeenCalledTimes(1);
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
	});
});

describe('UserMenu keyboard', () => {
	it('opens on ArrowDown and focuses the first row; ArrowUp opens on the last', async () => {
		const { container, trigger } = renderMenu();
		trigger.focus();
		await fireEvent.keyDown(trigger, { key: 'ArrowDown' });
		await waitFor(() => expect(document.activeElement).toBe(menuItems(container)[0]));
		expect(trigger.getAttribute('aria-expanded')).toBe('true');

		await fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'Escape' });
		await fireEvent.keyDown(trigger, { key: 'ArrowUp' });
		const rows = menuItems(container);
		await waitFor(() => expect(document.activeElement).toBe(rows[rows.length - 1]));
	});

	it('opens into the rows on a keyboard click (Enter, Space) but not on a pointer click', async () => {
		const { container, trigger } = renderMenu();
		trigger.focus();
		await fireEvent.click(trigger, { detail: 0 });
		await waitFor(() => expect(document.activeElement).toBe(menuItems(container)[0]));

		await fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'Escape' });
		await pointerClick(trigger);
		await tick();
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
		expect(document.activeElement).toBe(trigger);
	});

	it('moves with the arrows, wrapping, and jumps with Home and End', async () => {
		const { container, trigger } = renderMenu();
		await fireEvent.keyDown(trigger, { key: 'ArrowDown' });
		const rows = menuItems(container);
		await waitFor(() => expect(document.activeElement).toBe(rows[0]));
		const press = async (key: string) => {
			await fireEvent.keyDown(document.activeElement as HTMLElement, { key });
		};
		await press('ArrowDown');
		expect(document.activeElement).toBe(rows[1]);
		await press('ArrowDown');
		expect(document.activeElement).toBe(rows[2]);
		await press('ArrowDown');
		expect(document.activeElement).toBe(rows[0]);
		await press('ArrowUp');
		expect(document.activeElement).toBe(rows[2]);
		await press('Home');
		expect(document.activeElement).toBe(rows[0]);
		await press('End');
		expect(document.activeElement).toBe(rows[2]);
	});

	it('closes on Escape and returns the focus to the trigger', async () => {
		const { container, trigger, body } = renderMenu();
		await fireEvent.keyDown(trigger, { key: 'ArrowDown' });
		await waitFor(() => expect(document.activeElement).toBe(menuItems(container)[0]));
		await fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'Escape' });
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
		expect(document.activeElement).toBe(trigger);
		expect(isInert(body)).toBe(true);
	});

	it('closes on Tab and leaves the focus to move on', async () => {
		const { container, trigger } = renderMenu();
		await fireEvent.keyDown(trigger, { key: 'ArrowDown' });
		await waitFor(() => expect(document.activeElement).toBe(menuItems(container)[0]));
		await fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'Tab' });
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
	});

	it('listens for Escape only while open', async () => {
		const onopenchange = vi.fn();
		renderMenu({ onopenchange });
		await fireEvent.keyDown(window, { key: 'Escape' });
		expect(onopenchange).not.toHaveBeenCalled();
	});
});

describe('UserMenu pointer', () => {
	it('closes on a press outside and stays open on a press inside', async () => {
		render(UserMenuHarness, { props: { items: ITEMS } });
		const trigger = screen.getByRole('button', { name: 'Account menu for Ada Lovelace' });
		const body = document.querySelector('.body') as HTMLElement;
		await pointerClick(trigger);
		await fireEvent.pointerDown(body);
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
		await fireEvent.pointerDown(screen.getByTestId('outside'));
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
	});

	it('closes after a short grace when the pointer that opened it leaves', async () => {
		vi.useFakeTimers();
		const { root, trigger } = renderMenu();
		const panel = root.querySelector('.panel') as HTMLElement;
		await pointerClick(trigger);
		await fireEvent.pointerLeave(panel);
		await fireEvent.pointerEnter(panel);
		vi.advanceTimersByTime(400);
		expect(trigger.getAttribute('aria-expanded')).toBe('true');

		await fireEvent.pointerLeave(panel);
		vi.advanceTimersByTime(100);
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
		vi.advanceTimersByTime(100);
		await tick();
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
	});

	it('stays open when the pointer leaves a menu the keyboard opened', async () => {
		const { root, container, trigger } = renderMenu();
		await fireEvent.keyDown(trigger, { key: 'ArrowDown' });
		await waitFor(() => expect(document.activeElement).toBe(menuItems(container)[0]));
		vi.useFakeTimers();
		await fireEvent.pointerLeave(root.querySelector('.panel') as HTMLElement);
		vi.advanceTimersByTime(400);
		await tick();
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
	});

	it('reports open changes', async () => {
		const onopenchange = vi.fn();
		const { trigger } = renderMenu({ onopenchange });
		await pointerClick(trigger);
		await pointerClick(trigger);
		expect(onopenchange.mock.calls).toEqual([[true], [false]]);
	});
});

describe('UserMenu sign-out', () => {
	it('posts a form to signOutAction and applies the host enhancement', () => {
		const enhance = vi.fn(() => ({ destroy: vi.fn() }));
		const { container } = renderMenu({ signOutEnhance: enhance });
		const form = container.querySelector('form') as HTMLFormElement;
		expect(form.getAttribute('method')).toBe('POST');
		expect(form.getAttribute('action')).toBe('/signout');
		expect(form.getAttribute('role')).toBe('none');
		expect(enhance).toHaveBeenCalledWith(form);
		const button = form.querySelector('button') as HTMLButtonElement;
		expect(button.type).toBe('submit');
		expect(button.getAttribute('role')).toBe('menuitem');
		expect(button.dataset.tone).toBe('danger');
		expect(button.textContent?.trim()).toBe('Sign out');
	});

	it('calls onsignout when the host signs out with a handler', async () => {
		const onsignout = vi.fn();
		const { container, trigger } = renderMenu({
			signOutAction: undefined,
			onsignout,
			signOutLabel: 'Log off'
		});
		expect(container.querySelector('form')).toBeNull();
		await pointerClick(trigger);
		const row = menuItems(container).find((r) => r.textContent?.trim() === 'Log off') as HTMLElement;
		await fireEvent.click(row);
		expect(onsignout).toHaveBeenCalledTimes(1);
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
	});

	it('has no sign-out row and no separator with neither', () => {
		const { container } = renderMenu({ signOutAction: undefined });
		expect(menuItems(container).map((r) => r.textContent?.trim())).toEqual([
			'Members',
			'Remote access'
		]);
		expect(container.querySelector('[role="separator"]')).toBeNull();
	});

	it('puts a separator between the rows and sign-out only when there are rows', () => {
		const withRows = renderMenu();
		expect(withRows.container.querySelectorAll('[role="separator"]')).toHaveLength(1);
		withRows.unmount();
		const alone = renderMenu({ items: [] });
		expect(alone.container.querySelector('[role="separator"]')).toBeNull();
		expect(menuItems(alone.container)).toHaveLength(1);
	});

	it('takes custom rows from extraItems, reachable by the arrows and able to close', async () => {
		const onextra = vi.fn();
		const { container } = render(UserMenuHarness, {
			props: { variant: 'extra', items: ITEMS, onextra }
		});
		const trigger = screen.getByRole('button', { name: 'Account menu for Ada Lovelace' });
		await fireEvent.keyDown(trigger, { key: 'ArrowDown' });
		const rows = menuItems(container);
		expect(rows.map((r) => r.textContent?.trim())).toEqual([
			'Members',
			'Remote access',
			'Extra row',
			'Sign out'
		]);
		await waitFor(() => expect(document.activeElement).toBe(rows[0]));
		await fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowDown' });
		await fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowDown' });
		expect(document.activeElement).toBe(rows[2]);
		await fireEvent.click(rows[2] as HTMLElement);
		expect(onextra).toHaveBeenCalledTimes(1);
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
	});
});

describe('UserMenu footer', () => {
	it('is one text run with the product and the version, and the title as its tooltip', () => {
		const { container } = render(UserMenuHarness, { props: { variant: 'mark' } });
		const footer = container.querySelector('[data-user-menu-footer]') as HTMLElement;
		expect(footer.getAttribute('title')).toBe('Built from abc1234');
		const text = footer.querySelector('.footer-text') as HTMLElement;
		expect(text.textContent).toBe('Product v1.4 · 212');
		expect(text.querySelector('.version')?.textContent).toBe('v1.4 · 212');
	});

	it('draws the mark inside its 16px box in the leading column', () => {
		const { container } = render(UserMenuHarness, { props: { variant: 'mark' } });
		const mark = screen.getByTestId('mark');
		expect(mark.parentElement?.classList.contains('mark')).toBe(true);
		expect(mark.parentElement?.parentElement?.classList.contains('lead')).toBe(true);
		expect(container.querySelector('img')).toBeNull();
	});

	it('takes a footer snippet in place of its content', () => {
		const { container } = render(UserMenuHarness, { props: { variant: 'footer' } });
		const footer = container.querySelector('[data-user-menu-footer]') as HTMLElement;
		expect(footer.textContent?.trim()).toBe('Custom footer');
		expect(footer.querySelector('.footer-text')).toBeNull();
	});

	it('shows the version alone without a leading space', () => {
		const { container } = renderMenu({ product: undefined });
		expect(container.querySelector('.footer-text')?.textContent).toBe('v0.10');
	});

	it('has no footer when nothing is given for it', () => {
		const { container } = renderMenu({ product: undefined, version: undefined });
		expect(container.querySelector('[data-user-menu-footer]')).toBeNull();
	});
});

describe('UserMenu compact', () => {
	it('names the compact breakpoint as a class, or none', () => {
		const a = renderMenu();
		expect(a.root.classList.contains('compact-768')).toBe(true);
		a.unmount();
		const b = renderMenu({ compactBelow: 1024 });
		expect(b.root.classList.contains('compact-1024')).toBe(true);
		b.unmount();
		const c = renderMenu({ compactBelow: 0 });
		expect(c.root.className).not.toMatch(/compact-/);
	});
});
