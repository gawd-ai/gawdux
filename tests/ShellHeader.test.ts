// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import Header from './fixtures/shell/ShellHeaderHarness.svelte';
import { RECORD_TRAIL } from './fixtures/shell/shell-fixtures';

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
});
afterEach(async () => {
	if (app) await unmount(app);
	app = null;
	vi.unstubAllGlobals();
	document.body.innerHTML = '';
});

describe("the shell's header", () => {
	it('is the menu button, the trail, then the host controls: the switcher, the account, the notices and the theme', () => {
		app = mount(Header, { target: document.body });
		flushSync();
		const header = document.querySelector<HTMLElement>('[data-shell-header]')!;
		const parts = Array.from(header.children, (child) =>
			child.matches('[data-shell-menu-button]')
				? 'menu'
				: child.matches('nav.gawdux-breadcrumbs')
					? 'trail'
					: child.matches('[data-shell-header-end]')
						? 'end'
						: child.tagName
		);
		expect(parts).toEqual(['menu', 'trail', 'end']);
		const end = header.querySelector('[data-shell-header-end]')!;
		const order = Array.from(end.children, (child) =>
			child.matches('[data-shell-header-switcher]')
				? 'switcher'
				: child.matches('[data-shell-header-account]')
					? 'account'
					: child.matches('[data-testid="notices"]')
						? 'notices'
						: child.matches('[data-theme-toggle]')
							? 'theme'
							: child.tagName
		);
		expect(order).toEqual(['switcher', 'account', 'notices', 'theme']);
		expect(end.querySelector('[data-account-card="header"]')).not.toBeNull();
		expect(end.querySelector('[aria-label="Toggle dark mode"]')).not.toBeNull();
	});

	it('draws the trail it is given with Breadcrumbs, and no status', () => {
		app = mount(Header, { target: document.body });
		flushSync();
		const trail = document.querySelector('nav.gawdux-breadcrumbs.gawdux-shell-header-trail')!;
		const labels = Array.from(
			trail.querySelectorAll(':scope > ol.trail > li .breadcrumb-label'),
			(label) => label.textContent
		);
		expect(labels).toEqual(RECORD_TRAIL.map((crumb) => crumb.label));
		expect(document.querySelectorAll('nav.gawdux-breadcrumbs')).toHaveLength(1);
	});

	it('draws nothing at its end when the host fills no slot', () => {
		app = mount(Header, { target: document.body, props: { filled: false } });
		flushSync();
		expect(document.querySelector('[data-shell-header-end]')).toBeNull();
		expect(document.querySelector('[data-account-card], [data-user-menu]')).toBeNull();
		expect(document.querySelector('[data-theme-toggle]')).toBeNull();
		expect(document.querySelector('[data-shell-menu-button]')).not.toBeNull();
	});

	it('leaves the theme toggle out where a right column holds it', () => {
		app = mount(Header, { target: document.body, props: { theme: false } });
		flushSync();
		expect(document.querySelector('[data-shell-header-end]')).not.toBeNull();
		expect(document.querySelector('[data-theme-toggle]')).toBeNull();
	});

	it('opens the navigation from its menu button, named for what it does', () => {
		const onOpenNavigation = vi.fn();
		app = mount(Header, { target: document.body, props: { onOpenNavigation } });
		flushSync();
		const button = document.querySelector<HTMLButtonElement>('[data-shell-menu-button]')!;
		expect(button.getAttribute('aria-label')).toBe('Open navigation');
		expect(button.getAttribute('title')).toBe('Open navigation');
		expect(button.type).toBe('button');
		button.click();
		expect(onOpenNavigation).toHaveBeenCalledTimes(1);
	});

	it('tells each control whether it yields, full size until the trail needs the room', () => {
		app = mount(Header, { target: document.body });
		flushSync();
		// Nothing is measured in jsdom: no control yields.
		expect(document.querySelector('[data-testid="switcher"]')?.getAttribute('data-compact')).toBe(
			'false'
		);
		expect(document.querySelector('[data-account-card]')?.classList.contains('compact')).toBe(
			false
		);
		// Each yielding control sits in its own box, which the room is read from.
		for (const box of ['[data-shell-header-switcher]', '[data-shell-header-account]']) {
			expect(document.querySelector(box)?.children).toHaveLength(1);
		}
		expect(
			document.querySelector('[data-shell-header-account] [data-room-full]')
		).not.toBeNull();
	});
});
