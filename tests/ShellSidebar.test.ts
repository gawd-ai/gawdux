// @vitest-environment jsdom
/**
 * The side rail's state. A host that reads it on the server passes
 * `initialOpen`; a host that keeps it in the browser passes none, and the
 * rail restores it from the config's `storageKey`, as AppSidebar does.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import ShellSidebar from '../src/lib/shell/ShellSidebar.svelte';
import { RAIL } from './fixtures/shell/shell-fixtures';

const KEY = 'example.sidebarOpen';
let app: ReturnType<typeof mount> | null = null;
afterEach(async () => {
	if (app) await unmount(app);
	app = null;
	localStorage.clear();
	document.body.innerHTML = '';
});

async function rail(props: Record<string, unknown> = {}) {
	app = mount(ShellSidebar, {
		target: document.body,
		props: {
			config: { ...RAIL, storageKey: KEY },
			activeUrl: '/app/documents',
			homeHref: '/app',
			...props
		}
	});
	flushSync();
	await tick();
	return document.querySelector<HTMLElement>('.app-sidebar')!;
}

describe("the side rail's state", () => {
	it('restores a collapsed rail from the storage key when the host passes no initialOpen', async () => {
		localStorage.setItem(KEY, 'false');
		const sidebar = await rail();
		expect(sidebar.classList.contains('collapsed')).toBe(true);
		expect(document.querySelector('[aria-label="Expand sidebar"]')).not.toBeNull();
	});

	it('restores an open rail the same way', async () => {
		localStorage.setItem(KEY, 'true');
		const sidebar = await rail();
		expect(sidebar.classList.contains('collapsed')).toBe(false);
		expect(document.querySelector('[aria-label="Collapse sidebar"]')).not.toBeNull();
	});

	it("keeps the host's initialOpen over what the browser stored", async () => {
		localStorage.setItem(KEY, 'false');
		const sidebar = await rail({ initialOpen: true });
		expect(sidebar.classList.contains('collapsed')).toBe(false);
	});
});
