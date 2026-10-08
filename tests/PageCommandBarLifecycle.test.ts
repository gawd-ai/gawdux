import { flushSync, mount, unmount } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';
import PageCommandBarLifecycleHarness from './fixtures/PageCommandBarLifecycleHarness.svelte';

// A registrant registers while it initializes, so the bar fills in the same
// render as the page. It must therefore be released by a teardown that exists
// from that moment: a component can be destroyed in the very flush that
// created it (an earlier effect closed its block), before any of its own
// effects ran. Released from a deferred effect (`onDestroy`), such a
// registration stayed live forever, and its dead buttons came back in the bar
// whenever it was the newest one, beside or instead of the page's own.

type Harness = {
	mountAndUnmountInOneFlush(which: 'left' | 'center' | 'right' | 'confirm'): void;
	mountTransient(which: 'left' | 'center' | 'right' | 'confirm' | null): void;
	showRoles(next: boolean): void;
};

let target: HTMLElement;
let view: Harness | null = null;

function start(): Harness {
	target = document.createElement('div');
	document.body.append(target);
	view = mount(PageCommandBarLifecycleHarness, { target }) as unknown as Harness;
	flushSync();
	return view;
}

function zone(name: 'left' | 'center' | 'right'): string[] {
	return [...target.querySelectorAll(`[data-zone="${name}"] button`)].map(
		(button) => button.textContent?.trim() ?? ''
	);
}

afterEach(() => {
	if (view) unmount(view);
	view = null;
	target?.remove();
});

describe('PageCommandBar registrants destroyed in the flush that created them', () => {
	it.each([
		['left', 'Back to vehicles'],
		['center', 'Retire vehicle'],
		['right', 'Next page']
	] as const)('release the %s zone', (name, label) => {
		const bar = start();

		// The ordinary lifecycle still fills and empties the zone.
		bar.mountTransient(name);
		flushSync();
		expect(zone(name)).toEqual([label]);
		bar.mountTransient(null);
		flushSync();
		expect(zone(name)).toEqual([]);

		bar.mountAndUnmountInOneFlush(name);
		flushSync();
		expect(zone(name)).toEqual([]);
	});

	it('never brings a dead registrant back beside or after the next page', () => {
		const bar = start();
		bar.mountAndUnmountInOneFlush('center');
		flushSync();
		expect(zone('center')).toEqual([]);

		bar.showRoles(true);
		flushSync();
		expect(zone('center')).toEqual(['New role', 'Archive role']);

		bar.showRoles(false);
		flushSync();
		expect(zone('center')).toEqual([]);
	});

	it('releases a PageCommandBarConfirm decision closed in the flush that opened it', () => {
		const bar = start();
		bar.mountAndUnmountInOneFlush('confirm');
		flushSync();
		expect(zone('center')).toEqual([]);
		expect(target.querySelector('[data-workflow-role="command-drawer"]')).toBeNull();

		bar.showRoles(true);
		flushSync();
		bar.showRoles(false);
		flushSync();
		expect(zone('center')).toEqual([]);
	});
});
