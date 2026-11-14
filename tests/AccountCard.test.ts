// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import AccountCard from '../src/lib/shell/AccountCard.svelte';
import UserMenu from '../src/lib/components/UserMenu.svelte';
import ShellBarHarness from './fixtures/shell/ShellBarHarness.svelte';
import { PERSON } from './fixtures/shell/shell-fixtures';

let app: ReturnType<typeof mount> | null = null;
afterEach(async () => {
	if (app) await unmount(app);
	app = null;
	document.body.innerHTML = '';
	document.documentElement.classList.remove('dark');
});

function setup(extra: { compact?: boolean } = {}) {
	app = mount(AccountCard, { target: document.body, props: { ...PERSON, ...extra } });
	return document.querySelector<HTMLButtonElement>('button[aria-haspopup="menu"]')!;
}

describe('the account card: the shared menu lifecycle with its own presentation', () => {
	it('keeps the anchored geometry and the account actions', async () => {
		const trigger = setup();
		const root = document.querySelector<HTMLElement>('[data-account-card="header"]')!;
		expect(root.classList.contains('compact')).toBe(false);
		expect(root.querySelector('.spacer')?.getAttribute('aria-hidden')).toBe('true');
		expect(trigger.textContent).toContain('Quinn Adler');
		expect(trigger.textContent).not.toContain('quinn@example.test');
		trigger.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
		await tick();
		expect(trigger.textContent).toContain('quinn@example.test');
		expect(root.querySelector('.card')?.classList.contains('expanded')).toBe(true);
		expect(document.querySelector('a[role="menuitem"]')?.getAttribute('href')).toBe('/app/profile');
		expect(document.querySelector('a[role="menuitem"]')?.textContent?.trim()).toBe('Profile');
		expect(document.querySelector('form')?.getAttribute('action')).toBe('/signoff');
		expect(document.querySelector('form')?.getAttribute('method')).toBe('POST');
		expect(document.querySelector('button[role="menuitem"]')?.textContent?.trim()).toBe('Sign out');
		expect(document.body.textContent).toContain('Roles · Member');
		expect(document.body.textContent).toContain('Quality');
		expect(document.body.textContent).toContain('Example 1.0');
		expect(document.querySelector('[data-account-version] p')?.getAttribute('title')).toBe(
			'Reviewed build'
		);
		// In a header the theme is the header's or the right column's toggle.
		expect(document.querySelector('[role="menuitemcheckbox"]')).toBeNull();
	});

	it('uses the shared keyboard navigation and returns the focus on Escape', async () => {
		const trigger = setup();
		trigger.focus();
		trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
		await tick();
		await tick();
		const profile = document.querySelector<HTMLElement>('a[role="menuitem"]')!;
		const signout = document.querySelector<HTMLButtonElement>('button[role="menuitem"]')!;
		expect(document.activeElement).toBe(profile);
		profile.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
		expect(document.activeElement).toBe(signout);
		signout.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		await tick();
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
		expect(document.activeElement).toBe(trigger);
	});

	// The header compacts the card when its trail needs the room
	// (ShellHeader, createRoomYield): the avatar alone at every width.
	it('shows the avatar alone when the header compacts it, the name its tooltip and still its accessible name', async () => {
		const trigger = setup({ compact: true });
		const root = document.querySelector<HTMLElement>('[data-account-card="header"]')!;
		const panel = root.querySelector<HTMLElement>('.card')!;
		expect(root.classList.contains('compact')).toBe(true);
		expect(trigger.getAttribute('aria-label')).toBe('Account menu for Quinn Adler');
		expect(trigger.hasAttribute('title')).toBe(false);
		expect(panel.getAttribute('title')).toBe('Quinn Adler');

		trigger.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
		await tick();
		// The same panel opens, growing to the left from the avatar.
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
		expect(panel.classList.contains('expanded')).toBe(true);
		expect(panel.hasAttribute('title')).toBe(false);
		expect(document.body.textContent).toContain('Roles · Member');
	});

	it('keeps the full card while the header has room, the name still the closed card tooltip', () => {
		const trigger = setup({ compact: false });
		const panel = document.querySelector<HTMLElement>('.card')!;
		expect(document.querySelector('[data-account-card]')?.classList.contains('compact')).toBe(
			false
		);
		expect(panel.getAttribute('title')).toBe('Quinn Adler');
		expect(trigger.hasAttribute('title')).toBe(false);
	});

	// The header reads the card's full width from this probe (createRoomYield),
	// so a yield holds as the window crosses the compact width.
	it('carries a full-size probe the header compact never reaches', async () => {
		for (const compact of [false, true]) {
			setup({ compact });
			const probe = document.querySelector<HTMLElement>('[data-room-full]')!;
			expect(probe, `compact ${compact}`).not.toBeNull();
			expect(probe.classList.contains('room-full')).toBe(true);
			expect(probe.getAttribute('aria-hidden')).toBe('true');
			expect(probe.textContent).toBe('');
			// The probe is outside what `compact` narrows: the spacer and the card.
			expect(probe.classList.contains('spacer')).toBe(false);
			expect(probe.classList.contains('card')).toBe(false);
			if (app) await unmount(app);
			app = null;
			document.body.innerHTML = '';
		}
	});

	it('names the access alone with no roles, the roles alone with no access, and draws neither part it is not given', async () => {
		app = mount(AccountCard, {
			target: document.body,
			props: {
				initials: 'QA',
				name: 'Quinn Adler',
				profileHref: '/app/profile',
				signOutAction: '/signoff',
				accessLabel: 'Owner'
			}
		});
		const trigger = document.querySelector<HTMLButtonElement>('button[aria-haspopup="menu"]')!;
		trigger.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
		await tick();
		expect(document.querySelector('[data-account-facts] .access')?.textContent?.trim()).toBe(
			'Owner'
		);
		expect(document.querySelector('[data-account-facts] .chips')).toBeNull();
		expect(document.querySelector('[data-account-version]')).toBeNull();
		expect(trigger.textContent).not.toContain('@');
	});
});

describe('the account card is a presentation a host opts into', () => {
	it("leaves UserMenu's own sheet as it is for a host that does not", async () => {
		app = mount(UserMenu, {
			target: document.body,
			props: {
				name: 'Quinn Adler',
				email: 'quinn@example.test',
				tenant: 'Example',
				access: ['Owner'],
				items: [{ label: 'Profile', href: '/app/profile' }],
				signOutAction: '/signoff',
				product: 'Example',
				version: '1.0'
			}
		});
		expect(document.querySelector('[data-user-menu]')).not.toBeNull();
		expect(document.querySelector('[data-account-card]')).toBeNull();
		// The default sheet's order: the tenant with its access, the rows, sign-out last.
		expect(document.querySelector('[data-user-menu-context]')?.textContent).toContain('Example');
		const rows = Array.from(document.querySelectorAll('[role="menuitem"]'), (row) =>
			row.textContent?.trim()
		);
		expect(rows).toEqual(['Profile', 'Sign out']);
		expect(document.querySelector('[data-user-menu-footer]')?.textContent).toContain('1.0');
	});

	it("draws UserMenu's own sheet in the bar too, when the host does not opt in", async () => {
		app = mount(ShellBarHarness, { target: document.body, props: { occupied: false, card: false } });
		flushSync();
		expect(document.querySelector('[data-account-card]')).toBeNull();
		const root = document.querySelector<HTMLElement>('[data-user-menu]')!;
		expect(root.classList.contains('in-bar')).toBe(true);
	});
});
