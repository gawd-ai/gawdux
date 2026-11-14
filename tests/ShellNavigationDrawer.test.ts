// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import ShellNavigationDrawer from '../src/lib/shell/ShellNavigationDrawer.svelte';
import { RAIL } from './fixtures/shell/shell-fixtures';

let app: ReturnType<typeof mount> | null = null;
afterEach(async () => {
	if (app) await unmount(app);
	app = null;
	vi.restoreAllMocks();
	document.body.innerHTML = '';
	document.body.removeAttribute('style');
});

async function setup() {
	document.body.innerHTML =
		'<button id="opener">Menu</button><div id="shell"><main id="background">Work</main><aside id="blocked">Blocked</aside></div>';
	const opener = document.getElementById('opener')!;
	opener.focus();
	const blocked = document.getElementById('blocked')!;
	blocked.inert = true;
	document.body.style.overflow = 'auto';
	vi.spyOn(HTMLElement.prototype, 'getClientRects').mockImplementation(
		() => [{ width: 1, height: 1 }] as unknown as DOMRectList
	);
	const onclose = vi.fn();
	app = mount(ShellNavigationDrawer, {
		target: document.getElementById('shell')!,
		props: {
			config: { ...RAIL, storageKey: 'example.sidebar' },
			activeUrl: '/app/documents',
			homeHref: '/app',
			homeLabel: 'Example home',
			onclose
		}
	});
	await tick();
	await tick();
	return { opener, blocked, background: document.getElementById('background')!, onclose };
}

describe('the navigation drawer, on the shared focus scope', () => {
	it('keeps the navigation markup and gives back the focus, the inert state and the scroll as they were', async () => {
		const f = await setup();
		const close = document.querySelector<HTMLButtonElement>('.gawdux-shell-navigation-close')!;
		expect(document.activeElement).toBe(close);
		expect(f.background.inert).toBe(true);
		expect(document.body.style.overflow).toBe('hidden');
		const dialog = document.querySelector('[role="dialog"]')!;
		expect(dialog.getAttribute('aria-label')).toBe('Main navigation');
		expect(dialog.getAttribute('aria-modal')).toBe('true');
		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
		expect(f.onclose).toHaveBeenCalledTimes(1);
		await unmount(app!);
		app = null;
		expect(f.background.inert).toBe(false);
		expect(f.blocked.inert).toBe(true);
		expect(document.body.style.overflow).toBe('auto');
		expect(document.activeElement).toBe(f.opener);
		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
		expect(f.onclose).toHaveBeenCalledTimes(1);
	});

	it('closes on a drawer navigation link without intercepting its default action', async () => {
		const f = await setup();
		const link = document.querySelector<HTMLAnchorElement>(
			'.gawdux-shell-navigation-drawer a[href="/app/documents"]'
		)!;
		let reachedNativeAction = false;
		link.addEventListener('click', (event) => {
			reachedNativeAction = !event.defaultPrevented;
			event.preventDefault();
		});
		link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
		expect(reachedNativeAction).toBe(true);
		expect(f.onclose).toHaveBeenCalledTimes(1);
	});

	it('closes on a press on the backdrop and on its Close button', async () => {
		const f = await setup();
		const layer = document.querySelector('.gawdux-shell-navigation-layer')!;
		const backdrop = layer.querySelector<HTMLButtonElement>(':scope > button')!;
		expect(backdrop.getAttribute('aria-label')).toBe('Close navigation');
		backdrop.click();
		expect(f.onclose).toHaveBeenCalledTimes(1);
		document.querySelector<HTMLButtonElement>('.gawdux-shell-navigation-close')!.click();
		expect(f.onclose).toHaveBeenCalledTimes(2);
	});

	it('keeps the focus inside: Tab from the last control wraps to the first, Shift+Tab back', async () => {
		await setup();
		const drawer = document.querySelector<HTMLElement>('.gawdux-shell-navigation-drawer')!;
		const controls = Array.from(drawer.querySelectorAll<HTMLElement>('a[href], button'));
		const first = controls[0]!;
		const last = controls.at(-1)!;
		last.focus();
		const forward = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
		last.dispatchEvent(forward);
		expect(forward.defaultPrevented).toBe(true);
		expect(document.activeElement).toBe(first);
		const back = new KeyboardEvent('keydown', {
			key: 'Tab',
			shiftKey: true,
			bubbles: true,
			cancelable: true
		});
		first.dispatchEvent(back);
		expect(back.defaultPrevented).toBe(true);
		expect(document.activeElement).toBe(last);
	});

	it('is the rail open at full width with no collapse button, and never stores its state', async () => {
		await setup();
		const drawer = document.querySelector<HTMLElement>('.gawdux-shell-navigation-drawer')!;
		expect(drawer.querySelector('.app-sidebar')?.classList.contains('collapsed')).toBe(false);
		expect(drawer.querySelector('[aria-label="Collapse sidebar"]')).toBeNull();
		expect(drawer.querySelector('[aria-label="Expand sidebar"]')).toBeNull();
		expect(drawer.querySelector('[data-shell-drawer-head] a')?.getAttribute('href')).toBe('/app');
		expect(drawer.querySelector('[data-shell-drawer-head] a')?.getAttribute('title')).toBe(
			'Example home'
		);
		expect(localStorage.getItem('example.sidebar')).toBeNull();
	});
});
