// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import Shell from './fixtures/shell/AppShellHarness.svelte';
import TwoMenus from './fixtures/shell/ShellTwoMenusHarness.svelte';

type Media = { matches: boolean; listeners: Set<() => void> };
let media: Media;
let app: ReturnType<typeof mount> | null = null;

beforeEach(() => {
	media = { matches: false, listeners: new Set() };
	vi.stubGlobal(
		'ResizeObserver',
		class {
			observe() {}
			unobserve() {}
			disconnect() {}
		}
	);
	vi.spyOn(window, 'matchMedia').mockImplementation(
		(query: string) =>
			({
				get matches() {
					return query === '(max-width: 1024px)' ? media.matches : false;
				},
				media: query,
				addEventListener: (_: string, run: () => void) => {
					if (query === '(max-width: 1024px)') media.listeners.add(run);
				},
				removeEventListener: (_: string, run: () => void) => media.listeners.delete(run),
				addListener: () => {},
				removeListener: () => {},
				onchange: null,
				dispatchEvent: () => false
			}) as unknown as MediaQueryList
	);
	vi.spyOn(HTMLElement.prototype, 'getClientRects').mockImplementation(
		() => [{ width: 1, height: 1 }] as unknown as DOMRectList
	);
});
afterEach(async () => {
	if (app) await unmount(app);
	app = null;
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
	document.body.innerHTML = '';
	document.body.removeAttribute('style');
});

async function setScreen(compact: boolean) {
	media.matches = compact;
	for (const run of media.listeners) run();
	flushSync();
	await tick();
}

describe('the app shell frame', () => {
	it('draws the rail, the main column with its header and page, and its own bar when no right column holds anything', () => {
		app = mount(Shell, { target: document.body });
		flushSync();
		const shell = document.querySelector<HTMLElement>('[data-app-shell]')!;
		expect(shell.getAttribute('data-testid')).toBe('shell');
		expect(shell.classList.contains('has-bar')).toBe(true);
		const parts = Array.from(shell.children, (child) =>
			child.matches('[data-shell-rail]')
				? 'rail'
				: child.matches('[data-shell-main]')
					? 'main'
					: child.matches('.gawdux-shell-bar')
						? 'bar'
						: child.className
		);
		expect(parts).toEqual(['rail', 'main', 'bar']);
		const bar = shell.querySelector('.gawdux-shell-bar')!;
		expect(bar.getAttribute('data-shell-bar')).toBe('hidden');
		expect(bar.querySelector('.gawdux-shell-bar-end [data-account-card="bar"]')).not.toBeNull();
		expect(shell.querySelector('[data-shell-main-column] [data-shell-header]')).not.toBeNull();
		expect(shell.querySelector('[data-testid="page"]')?.textContent).toBe('Page');
		// With no right column the header carries the theme toggle.
		expect(shell.querySelector('[data-shell-header] [data-theme-toggle]')).not.toBeNull();
		expect(shell.querySelector('[data-shell-right-column]')).toBeNull();
	});

	it('gives the right column the bar when it holds something: one bar, the account at its end', () => {
		app = mount(Shell, { target: document.body, props: { right: true, panelOpen: true } });
		flushSync();
		const shell = document.querySelector<HTMLElement>('[data-app-shell]')!;
		expect(shell.querySelectorAll('.gawdux-shell-bar')).toHaveLength(1);
		const bar = shell.querySelector('[data-shell-right-column] .gawdux-shell-bar')!;
		expect(bar.getAttribute('data-shell-bar')).toBe('column');
		expect(bar.querySelector('.gawdux-shell-bar-end [data-account-card="bar"]')).not.toBeNull();
		// The cap spans the open panel and holds the theme, so the header does not.
		const spacer = shell.querySelector<HTMLElement>('[data-shell-right-cap-spacer]')!;
		expect(spacer.style.width).toBe('368px');
		expect(shell.querySelector('[data-shell-right-cap] [data-theme-toggle]')).not.toBeNull();
		expect(shell.querySelector('[data-shell-header] [data-theme-toggle]')).toBeNull();
		expect(shell.querySelector('[data-shell-right-frame]')?.classList.contains('open')).toBe(true);
	});

	it('gives a closed panel no room in the cap', () => {
		app = mount(Shell, { target: document.body, props: { right: true, panelOpen: false } });
		flushSync();
		expect(
			document.querySelector<HTMLElement>('[data-shell-right-cap-spacer]')!.style.width
		).toBe('0px');
		expect(document.querySelector('[data-shell-right-frame]')?.hasAttribute('role')).toBe(false);
	});

	it('makes the page inert under a panel that is the view, and names the panel', () => {
		app = mount(Shell, {
			target: document.body,
			props: { right: true, panelOpen: true, covered: true }
		});
		flushSync();
		const column = document.querySelector<HTMLElement>('[data-shell-main-column]')!;
		expect(column.inert).toBe(true);
		expect(column.getAttribute('aria-hidden')).toBe('true');
		const frame = document.querySelector('[data-shell-right-frame]')!;
		expect(frame.getAttribute('role')).toBe('dialog');
		expect(frame.getAttribute('aria-modal')).toBe('true');
		expect(frame.getAttribute('aria-label')).toBe('Chat');
	});

	it('leaves the page live while no panel covers it', () => {
		app = mount(Shell, { target: document.body, props: { right: true } });
		flushSync();
		const column = document.querySelector<HTMLElement>('[data-shell-main-column]')!;
		expect(column.inert).toBe(false);
		expect(column.hasAttribute('aria-hidden')).toBe(false);
	});

	it("opens the drawer from the header's menu button and closes it from the drawer", async () => {
		app = mount(Shell, { target: document.body });
		await setScreen(true);
		expect(document.querySelector('[data-shell-navigation-layer]')).toBeNull();
		document.querySelector<HTMLButtonElement>('[data-shell-menu-button]')!.click();
		flushSync();
		await tick();
		const layer = document.querySelector<HTMLElement>('[data-shell-navigation-layer]')!;
		expect(layer).not.toBeNull();
		// Everything beside the drawer is inert while it is open.
		expect(document.querySelector<HTMLElement>('[data-shell-main]')!.inert).toBe(true);
		expect(document.querySelector<HTMLElement>('[data-shell-rail]')!.inert).toBe(true);
		expect(layer.querySelector('[data-testid="brand"]')?.getAttribute('data-drawer')).toBe('true');
		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
		flushSync();
		await tick();
		expect(document.querySelector('[data-shell-navigation-layer]')).toBeNull();
		expect(document.querySelector<HTMLElement>('[data-shell-main]')!.inert).toBe(false);
	});

	it('closes a drawer left open when the screen grows past the compact width', async () => {
		app = mount(Shell, { target: document.body });
		await setScreen(true);
		document.querySelector<HTMLButtonElement>('[data-shell-menu-button]')!.click();
		flushSync();
		await tick();
		expect(document.querySelector('[data-shell-navigation-layer]')).not.toBeNull();
		await setScreen(false);
		expect(document.querySelector('[data-shell-navigation-layer]')).toBeNull();
		expect(document.querySelector<HTMLElement>('[data-shell-main]')!.inert).toBe(false);
		expect(document.body.style.overflow).not.toBe('hidden');
	});

	// The drawer is the compact width's alone. Drawn on a wider screen it
	// was a modal over the whole page, the page inert and its scroll locked.
	it('draws no drawer above the compact width when the host opens it there, and puts the flag back', async () => {
		const seen: boolean[] = [];
		const props = {
			get navigationOpen() {
				return seen.at(-1) ?? true;
			},
			set navigationOpen(value: boolean) {
				seen.push(value);
			}
		};
		app = mount(Shell, { target: document.body, props });
		flushSync();
		await tick();
		expect(document.querySelector('[data-shell-navigation-layer]')).toBeNull();
		// Never made inert: jsdom has no `inert` of its own to read as false.
		expect(document.querySelector<HTMLElement>('[data-shell-main]')!.inert).not.toBe(true);
		expect(document.querySelector<HTMLElement>('[data-shell-rail]')!.inert).not.toBe(true);
		expect(document.body.style.overflow).not.toBe('hidden');
		expect(seen.at(-1)).toBe(false);
	});

	it('draws a drawer the host opens at the compact width', async () => {
		media.matches = true;
		app = mount(Shell, { target: document.body, props: { navigationOpen: true } });
		flushSync();
		await tick();
		expect(document.querySelector('[data-shell-navigation-layer]')).not.toBeNull();
		expect(document.querySelector<HTMLElement>('[data-shell-main]')!.inert).toBe(true);
	});

	/** Every id in the page that more than one element carries. */
	const repeatedIds = () => {
		const ids = Array.from(document.querySelectorAll('[id]'), (element) => element.id);
		return [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
	};

	// The header's account and the bar's are both in the page at every
	// width. Two UserMenus on the default id put every id of the menu in the
	// page twice, so a trigger's aria-controls named two menus.
	it('has no id twice with UserMenu in the header and in the bar, neither given an id', () => {
		app = mount(TwoMenus, { target: document.body });
		flushSync();
		const triggers = Array.from(
			document.querySelectorAll<HTMLElement>('[aria-haspopup="menu"][aria-controls]')
		);
		expect(triggers).toHaveLength(2);
		expect(repeatedIds()).toEqual([]);
		expect(triggers.map((trigger) => trigger.id).sort()).toEqual([
			'gawdux-user-menu-bar-trigger',
			'gawdux-user-menu-trigger'
		]);
		// Each trigger names its own menu, in its own part of the shell.
		for (const trigger of triggers) {
			const menus = document.querySelectorAll(`[id="${trigger.getAttribute('aria-controls')}"]`);
			expect(menus).toHaveLength(1);
			expect(menus[0]!.getAttribute('aria-labelledby')).toBe(trigger.id);
			const part = (element: Element) =>
				element.closest('.gawdux-shell-bar') ? 'bar' : 'header';
			expect(part(menus[0]!)).toBe(part(trigger));
		}
		expect(
			document.querySelector('.gawdux-shell-bar #gawdux-user-menu-bar-trigger')
		).not.toBeNull();
	});

	it('keeps the ids a host gives the two menus', () => {
		app = mount(TwoMenus, { target: document.body, props: { ids: true } });
		flushSync();
		expect(repeatedIds()).toEqual([]);
		expect(document.getElementById('example-account-trigger')).not.toBeNull();
		expect(document.getElementById('example-account-bar-trigger')).not.toBeNull();
	});

	it('reads the compact width once for the host', async () => {
		const seen: boolean[] = [];
		const props = {
			get compact() {
				return seen.at(-1) ?? false;
			},
			set compact(value: boolean) {
				seen.push(value);
			}
		};
		app = mount(Shell, { target: document.body, props });
		flushSync();
		expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 1024px)');
		await setScreen(true);
		expect(seen.at(-1)).toBe(true);
		await setScreen(false);
		expect(seen.at(-1)).toBe(false);
	});

	it("draws the host's brand in the rail's home link, told whether the rail is collapsed", () => {
		app = mount(Shell, { target: document.body });
		flushSync();
		const home = document.querySelector<HTMLAnchorElement>('[data-shell-rail-home]')!;
		expect(home.getAttribute('href')).toBe('/app');
		expect(home.getAttribute('title')).toBe('Example home');
		const brand = home.querySelector('[data-testid="brand"]')!;
		expect(brand.getAttribute('data-collapsed')).toBe('false');
		expect(brand.getAttribute('data-drawer')).toBe('false');
		const toggle = document.querySelector<HTMLButtonElement>('[aria-label="Collapse sidebar"]')!;
		toggle.click();
		flushSync();
		expect(document.querySelector('[aria-label="Expand sidebar"]')).not.toBeNull();
		expect(
			document.querySelector('[data-shell-rail-home] [data-testid="brand"]')?.getAttribute(
				'data-collapsed'
			)
		).toBe('true');
	});
});
