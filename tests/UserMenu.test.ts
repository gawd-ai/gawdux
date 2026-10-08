import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { tick } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LockOutline, UsersOutline } from 'flowbite-svelte-icons';
import UserMenu from '../src/lib/components/UserMenu.svelte';
import userMenuSource from '../src/lib/components/UserMenu.svelte?raw';
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

	it('is a menu button that names the person and controls the menu', () => {
		const { trigger } = renderMenu();
		expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
		const menu = screen.getByRole('menu', { hidden: true });
		expect(trigger.getAttribute('aria-controls')).toBe(menu.id);
	});

	it('controls the body when there is no menu to open into', () => {
		const { trigger, body } = renderMenu({ items: [], signOutAction: undefined });
		expect(screen.queryByRole('menu', { hidden: true })).toBeNull();
		expect(trigger.getAttribute('aria-controls')).toBe(body.id);
	});

	it('shows the email once: no second line when it repeats the name', () => {
		const { container } = render(UserMenu, {
			props: { name: 'ada@example.test', email: 'ada@example.test' }
		});
		const trigger = container.querySelector('.trigger') as HTMLElement;
		expect(trigger.querySelector('.name')?.textContent).toBe('ada@example.test');
		expect(trigger.querySelector('.email')).toBeNull();
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

	it('is a statement, not a row: no icon, no menu item, the chips right after the tenant', () => {
		const { body } = renderMenu();
		const context = body.querySelector('[data-user-menu-context]') as HTMLElement;
		expect(context.querySelector('svg')).toBeNull();
		expect(context.querySelector('[role="menuitem"], a, button')).toBeNull();
		const visible = Array.from(context.children).filter(
			(child) => !child.classList.contains('visually-hidden')
		);
		expect(visible.map((child) => child.className.split(' ')[0])).toEqual(['tenant', 'access']);
	});

	it('describes the menu with the tenant and the access, so a person opening into the rows hears them', () => {
		const { body } = renderMenu();
		const context = body.querySelector('[data-user-menu-context]') as HTMLElement;
		const menu = screen.getByRole('menu', { hidden: true });
		expect(menu.getAttribute('aria-describedby')).toBe(context.id);
		expect(context.textContent?.replace(/\s+/g, ' ').trim()).toBe('Analytical Engines, Owner');
	});

	it('names the chips with a caption when the host gives one', () => {
		const { body } = renderMenu({ access: ['Ops', 'Viewer'], accessLabel: 'Roles' });
		const access = body.querySelector('[data-user-menu-context] .access') as HTMLElement;
		expect(access.querySelector('.access-label')?.textContent).toBe('Roles');
		expect(access.textContent?.replace(/\s+/g, ' ').trim()).toBe('Roles Ops Viewer');
	});

	it('leaves the description out when there is no context', () => {
		renderMenu({ tenant: undefined, access: [] });
		const menu = screen.getByRole('menu', { hidden: true });
		expect(menu.hasAttribute('aria-describedby')).toBe(false);
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

describe('UserMenu one highlighted row', () => {
	it('moves the focus to the row under the pointer, so hover and focus are one row', async () => {
		const { container, trigger } = renderMenu();
		await pointerClick(trigger);
		const rows = menuItems(container);
		const menu = screen.getByRole('menu', { hidden: true });
		await fireEvent.pointerMove(rows[1] as HTMLElement);
		expect(document.activeElement).toBe(rows[1]);
		expect(menu.dataset.input).toBe('pointer');
		await fireEvent.pointerMove(rows[0]?.querySelector('.gawdux-user-menu-label') as HTMLElement);
		expect(document.activeElement).toBe(rows[0]);
	});

	it('hands the focus to the menu between rows and when the pointer leaves the rows', async () => {
		const { container, trigger } = renderMenu();
		await pointerClick(trigger);
		const rows = menuItems(container);
		const menu = screen.getByRole('menu', { hidden: true });
		await fireEvent.pointerMove(rows[0] as HTMLElement);
		await fireEvent.pointerMove(container.querySelector('[role="separator"]') as HTMLElement);
		expect(document.activeElement).toBe(menu);
		await fireEvent.pointerMove(rows[1] as HTMLElement);
		await fireEvent.pointerLeave(menu);
		expect(document.activeElement).toBe(menu);
	});

	it('gives the ring back to the keyboard: a key after the pointer moves from the hovered row', async () => {
		const { container, trigger } = renderMenu();
		await pointerClick(trigger);
		const rows = menuItems(container);
		const menu = screen.getByRole('menu', { hidden: true });
		await fireEvent.pointerMove(rows[0] as HTMLElement);
		await fireEvent.keyDown(rows[0] as HTMLElement, { key: 'ArrowDown' });
		expect(document.activeElement).toBe(rows[1]);
		expect(menu.dataset.input).toBe('keyboard');
	});

	it('ignores touch: a tap does not move the focus', async () => {
		const { container, trigger } = renderMenu();
		await pointerClick(trigger);
		const rows = menuItems(container);
		// jsdom has no PointerEvent: a pointermove carrying the touch pointer type.
		const touch = new MouseEvent('pointermove', { bubbles: true });
		Object.defineProperty(touch, 'pointerType', { value: 'touch' });
		(rows[1] as HTMLElement).dispatchEvent(touch);
		await tick();
		expect(document.activeElement).not.toBe(rows[1]);
	});

	it('styles one highlight, on the focused row, and the ring for the keyboard only', () => {
		expect(userMenuSource).not.toMatch(/gawdux-user-menu-item:hover/);
		expect(userMenuSource).toMatch(
			/\.menu :global\(\.gawdux-user-menu-item:focus\) \{[^}]*background-color: var\(--gawdux-menu-item-hover\)/
		);
		expect(userMenuSource).toMatch(
			/\.menu\[data-input='keyboard'\] :global\(\.gawdux-user-menu-item:focus-visible\) \{[^}]*outline: 2px solid/
		);
	});
});

describe('UserMenu closing', () => {
	it('closes a pointer-opened menu when the pointer leaves, even after the rows took the focus', async () => {
		vi.useFakeTimers();
		const { root, container, trigger } = renderMenu();
		await pointerClick(trigger);
		await fireEvent.pointerMove(menuItems(container)[0] as HTMLElement);
		await fireEvent.pointerLeave(root.querySelector('.panel') as HTMLElement);
		vi.advanceTimersByTime(200);
		await tick();
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
		expect(document.activeElement).toBe(trigger);
	});

	it('closes when the focus moves to something outside it', async () => {
		render(UserMenuHarness, { props: { items: ITEMS } });
		const trigger = screen.getByRole('button', { name: 'Account menu for Ada Lovelace' });
		const outside = screen.getByTestId('outside');
		trigger.focus();
		await pointerClick(trigger);
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
		outside.focus();
		await tick();
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
		expect(document.activeElement).toBe(outside);
	});

	it('stays open while the focus moves inside it', async () => {
		const { container, trigger } = renderMenu();
		trigger.focus();
		await pointerClick(trigger);
		(menuItems(container)[0] as HTMLElement).focus();
		await tick();
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
	});

	it('never pulls the focus back from a control outside on Escape', async () => {
		const { container } = render(UserMenu, {
			props: { name: 'Ada Lovelace', items: ITEMS, open: true }
		});
		const outside = document.createElement('button');
		document.body.appendChild(outside);
		outside.focus();
		await fireEvent.keyDown(outside, { key: 'Escape' });
		expect(container.querySelector('[data-user-menu]')?.getAttribute('data-state')).toBe('closed');
		expect(document.activeElement).toBe(outside);
		outside.remove();
	});

	it('returns the focus to the trigger on Escape when nothing held it', async () => {
		const { trigger } = renderMenu();
		await pointerClick(trigger);
		(document.activeElement as HTMLElement | null)?.blur();
		await fireEvent.keyDown(window, { key: 'Escape' });
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
		expect(document.activeElement).toBe(trigger);
	});

	it('closes on a history navigation (popstate)', async () => {
		const { trigger } = renderMenu();
		await pointerClick(trigger);
		window.dispatchEvent(new PopStateEvent('popstate'));
		await tick();
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
	});

	it('lets a host close it through the bound open state', async () => {
		const { rerender, root } = renderMenu({ open: true });
		expect(root.dataset.state).toBe('open');
		await rerender({ open: false });
		expect(root.dataset.state).toBe('closed');
	});
});

describe('UserMenu geometry', () => {
	it('keeps the open compact panel inside the 16px gutter: the room left of its right edge', async () => {
		const spy = vi
			.spyOn(HTMLElement.prototype, 'getBoundingClientRect')
			.mockReturnValue({ right: 216, left: 172, top: 6, bottom: 50, width: 44, height: 44, x: 172, y: 6, toJSON: () => ({}) } as DOMRect);
		const { root, trigger } = renderMenu();
		expect(root.style.getPropertyValue('--gawdux-user-menu-room')).toBe('');
		await pointerClick(trigger);
		await tick();
		expect(root.style.getPropertyValue('--gawdux-user-menu-room')).toBe('200px');
		spy.mockRestore();
	});

	it('keeps the CSS fallback where there is no layout', async () => {
		const { root, trigger } = renderMenu();
		await pointerClick(trigger);
		await tick();
		expect(root.style.getPropertyValue('--gawdux-user-menu-room')).toBe('');
	});

	it('mirrors the compact trigger so the avatar keeps its place when the panel grows left', () => {
		for (const bp of ['768', '1024']) {
			expect(userMenuSource).toMatch(
				new RegExp(`\\.compact-${bp} \\.trigger \\{[^}]*flex-direction: row-reverse`)
			);
			expect(userMenuSource).toContain(`var(--gawdux-user-menu-room, calc(100vw - 32px))`);
		}
	});

	it('never recolours the trigger with the open or hover state; only the chevron turns', () => {
		expect(userMenuSource).not.toMatch(/\.panel(?::hover|\.open) \.(?:avatar|name|email)\b/);
		expect(userMenuSource).not.toMatch(/\.panel(?::hover|\.open) \.chevron \{[^}]*color/);
		expect(userMenuSource).toMatch(/\.panel\.open \.chevron \{\s*transform: rotate\(180deg\);\s*\}/);
	});

	it('sizes the card from the trigger alone, between the two width knobs', () => {
		expect(userMenuSource).toMatch(
			/\.gawdux-user-menu \{[^}]*width: max-content;[^}]*min-width: var\(--gawdux-user-menu-min-width, 208px\);[^}]*max-width: var\(--gawdux-user-menu-width, 272px\);[^}]*height: 44px;/
		);
		expect(userMenuSource).toMatch(/\.body \{[^}]*contain: inline-size;/);
	});

	it('draws every divider one way: full width, one token', () => {
		expect(userMenuSource).toMatch(
			/\.rule,\s*\.separator \{\s*height: 1px;\s*background-color: var\(--gawdux-menu-divider\);\s*\}/
		);
		expect(userMenuSource).toMatch(/\.separator \{\s*margin: 4px -4px;\s*\}/);
		expect(userMenuSource).not.toContain('rule quiet');
	});

	it('centres the footer mark and text in one 32px row (layout jsdom cannot measure)', () => {
		const block = (selector: string) => {
			const match = userMenuSource.match(new RegExp(`\\n\\t${selector.replace(/\./g, '\\.')} \\{([^}]*)\\}`));
			expect(match, `${selector} rule`).toBeTruthy();
			return match?.[1] ?? '';
		};
		const footer = block('.footer');
		expect(footer).toContain('display: flex;');
		expect(footer).toContain('align-items: center;');
		expect(footer).toContain('height: 32px;');
		expect(footer).toContain('line-height: 16px;');
		const mark = block('.mark');
		expect(mark).toContain('width: 16px;');
		expect(mark).toContain('height: 16px;');
		expect(mark).toContain('place-items: center;');
		const lead = block('.lead');
		expect(lead).toContain('width: 28px;');
		expect(lead).toContain('height: 16px;');
		expect(lead).toContain('place-items: center;');
	});
});
