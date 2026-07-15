import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createNavigationFocusRestorer } from '../src/lib/utils/navigation-focus';

function deferred() {
	let resolve!: () => void;
	let reject!: (reason?: unknown) => void;
	const promise = new Promise<void>((resolvePromise, rejectPromise) => {
		resolve = resolvePromise;
		reject = rejectPromise;
	});
	return { promise, resolve, reject };
}

describe('createNavigationFocusRestorer', () => {
	let frames: FrameRequestCallback[];

	beforeEach(() => {
		frames = [];
		vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
			frames.push(callback);
			return frames.length;
		});
	});

	afterEach(() => {
		document.body.replaceChildren();
		vi.unstubAllGlobals();
	});

	async function settleNavigationFrame() {
		await Promise.resolve();
		expect(frames).toHaveLength(1);
		frames.shift()?.(0);
		await Promise.resolve();
	}

	it('restores the pre-navigation element after navigation and one render frame', async () => {
		const search = document.createElement('input');
		const navigationTarget = document.createElement('button');
		document.body.append(search, navigationTarget);
		search.focus();
		const navigation = deferred();
		const pending = createNavigationFocusRestorer().navigate(() => navigation.promise);

		navigationTarget.focus();
		navigation.resolve();
		await settleNavigationFrame();
		await pending;

		expect(document.activeElement).toBe(search);
	});

	it('does not restore a disconnected element or after rejected navigation', async () => {
		const search = document.createElement('input');
		const fallback = document.createElement('button');
		document.body.append(search, fallback);
		search.focus();
		const disconnectedNavigation = deferred();
		const restorer = createNavigationFocusRestorer();
		const disconnectedPending = restorer.navigate(() => disconnectedNavigation.promise);

		search.remove();
		fallback.focus();
		disconnectedNavigation.resolve();
		await disconnectedPending;
		expect(frames).toHaveLength(0);
		expect(document.activeElement).toBe(fallback);

		const rejectedNavigation = deferred();
		const rejectedPending = restorer.navigate(() => rejectedNavigation.promise);
		rejectedNavigation.reject(new Error('cancelled'));
		await expect(rejectedPending).resolves.toBeUndefined();
		expect(frames).toHaveLength(0);
		expect(document.activeElement).toBe(fallback);
	});

	it('lets a newer user focus choice supersede restoration', async () => {
		const search = document.createElement('input');
		const nextControl = document.createElement('button');
		document.body.append(search, nextControl);
		search.focus();
		const navigation = deferred();
		const pending = createNavigationFocusRestorer().navigate(() => navigation.promise);

		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
		nextControl.focus();
		navigation.resolve();
		await pending;

		expect(frames).toHaveLength(0);
		expect(document.activeElement).toBe(nextControl);
	});

	it('does not override a focus change made after navigation settles', async () => {
		const search = document.createElement('input');
		const navigationTarget = document.createElement('button');
		const newestTarget = document.createElement('button');
		document.body.append(search, navigationTarget, newestTarget);
		search.focus();
		const navigation = deferred();
		const pending = createNavigationFocusRestorer().navigate(() => navigation.promise);

		navigationTarget.focus();
		navigation.resolve();
		await Promise.resolve();
		expect(frames).toHaveLength(1);
		newestTarget.focus();
		frames.shift()?.(0);
		await pending;

		expect(document.activeElement).toBe(newestTarget);
	});

	it('prevents an older navigation from overriding a newer restore', async () => {
		const firstSearch = document.createElement('input');
		const secondSearch = document.createElement('input');
		const navigationTarget = document.createElement('button');
		document.body.append(firstSearch, secondSearch, navigationTarget);
		const restorer = createNavigationFocusRestorer();
		const firstNavigation = deferred();
		const secondNavigation = deferred();

		firstSearch.focus();
		const firstPending = restorer.navigate(() => firstNavigation.promise);
		secondSearch.focus();
		const secondPending = restorer.navigate(() => secondNavigation.promise);
		firstNavigation.resolve();
		await firstPending;
		expect(document.activeElement).toBe(secondSearch);
		expect(frames).toHaveLength(0);

		navigationTarget.focus();
		secondNavigation.resolve();
		await settleNavigationFrame();
		await secondPending;
		expect(document.activeElement).toBe(secondSearch);
	});
});
