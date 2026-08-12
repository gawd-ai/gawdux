import { flushSync, mount, tick, unmount } from 'svelte';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import CommandDrawerHarness from './fixtures/CommandDrawerHarness.svelte';

/**
 * `CommandDrawer` is chrome plus focus discipline, and the focus half is what
 * broke repeatedly in the products before it was lifted. These cases pin the
 * behaviours that were re-implemented (and re-broken) five times:
 *
 *  - Escape closes, but never while busy — a surface must not vanish mid-write.
 *  - Focus moves INTO the drawer on open and back OUT on close.
 *
 * NOT covered, deliberately: the restore guard
 * `target?.isConnected && !target.matches(':disabled')`. jsdom will not focus a
 * detached OR a disabled element in the first place, so a test for either arm
 * passes with the guard REMOVED. Both were written, both survived their own
 * mutation, and both were deleted rather than left green and meaningless. That
 * branch is exercised for real by the products, where the opener is a bar
 * trigger that goes inert while the drawer is up.
 *  - `open` is never written here; the consumer owns it. A drawer that closed
 *    itself would be reverted by the parent's next render, silently.
 */
let host: HTMLDivElement;
let app: Record<string, unknown> | null = null;

function surface(): HTMLElement | null {
	return host.querySelector('[data-workflow-role="command-drawer"]');
}

function mountHarness(props: Record<string, unknown> = {}) {
	const { open, ...rest } = props as { open?: boolean };
	app = mount(CommandDrawerHarness, { target: host, props: rest }) as Record<string, unknown>;
	flushSync();
	if (open) {
		(app as { setOpen: (v: boolean) => void }).setOpen(true);
		flushSync();
	}
	return app;
}

beforeEach(() => {
	host = document.createElement('div');
	document.body.appendChild(host);
});

afterEach(() => {
	if (app) unmount(app);
	app = null;
	host.remove();
});

describe('CommandDrawer', () => {
	it('renders nothing until open, then carries the shared workflow marker', () => {
		const api = mountHarness({ open: false });
		expect(surface()).toBeNull();

		(api as { setOpen: (v: boolean) => void }).setOpen(true);
		flushSync();
		expect(surface()).not.toBeNull();
	});

	it('is attached by default and a card on request — the two shipped looks', () => {
		mountHarness({ open: true });
		expect(surface()?.className).toContain('command-drawer--attached');
		expect(surface()?.className).toContain('border-t');
		expect(surface()?.className).not.toContain('shadow-sm');
	});

	it('passes arbitrary attributes through to the section', () => {
		// The aria wiring and a consumer's own marker must land on ONE element.
		mountHarness({ open: true, extraAttr: 'yes' });
		expect(surface()?.getAttribute('data-probe')).toBe('yes');
	});

	it('moves focus into the drawer on open and restores it on close', async () => {
		const opener = document.createElement('button');
		document.body.appendChild(opener);
		opener.focus();
		expect(document.activeElement).toBe(opener);

		const api = mountHarness({ open: false }) as { setOpen: (v: boolean) => void };
		api.setOpen(true);
		flushSync();
		await tick();
		await tick();
		expect(document.activeElement).toBe(host.querySelector('button[data-action-confirm]'));

		api.setOpen(false);
		flushSync();
		await tick();
		await tick();
		expect(document.activeElement).toBe(opener);
		opener.remove();
	});

	it('closes on Escape, and refuses to while busy', async () => {
		const api = mountHarness({ open: true }) as {
			setOpen: (v: boolean) => void;
			closes: () => number;
		};
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
		flushSync();
		expect(api.closes()).toBe(1);

		unmount(app!);
		app = null;
		const busyApi = mountHarness({ open: true, busy: true }) as { closes: () => number };
		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
		flushSync();
		expect(busyApi.closes()).toBe(0);
	});

	it('never closes itself — `open` is the consumer’s to write', () => {
		const api = mountHarness({ open: true }) as { closes: () => number };
		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
		flushSync();
		// It ASKED (one onclose), and the surface is still mounted because the
		// harness did not act on it. A drawer that closed itself would have
		// unmounted here — and would then be reverted by the parent's next
		// render in a real app, which is the silent failure this guards.
		expect(api.closes()).toBe(1);
		expect(surface()).not.toBeNull();
	});
});
