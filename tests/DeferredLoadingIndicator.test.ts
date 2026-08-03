import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import DeferredLoadingIndicator, {
	DEFERRED_LOADING_DELAY_MS
} from '../src/lib/primitives/DeferredLoadingIndicator.svelte';
import DeferredLoadingIndicatorHarness from './fixtures/DeferredLoadingIndicatorHarness.svelte';

let app: object | null = null;

afterEach(() => {
	if (app) unmount(app);
	app = null;
	document.body.innerHTML = '';
	vi.useRealTimers();
});

describe('DeferredLoadingIndicator', () => {
	it('keeps fast loads quiet and reports a wait only after the shared grace period', async () => {
		vi.useFakeTimers();
		app = mount(DeferredLoadingIndicator, {
			target: document.body,
			props: { active: true, label: 'Loading access policy' }
		});
		flushSync();

		expect(document.querySelector('[data-deferred-loading]')).toBeNull();
		await vi.advanceTimersByTimeAsync(DEFERRED_LOADING_DELAY_MS - 1);
		expect(document.querySelector('[data-deferred-loading]')).toBeNull();

		await vi.advanceTimersByTimeAsync(1);
		flushSync();
		expect(document.querySelector('[data-deferred-loading]')).not.toBeNull();
		expect(document.querySelector('[aria-label="Loading access policy"]')).not.toBeNull();
	});

	it('cancels the pending fallback when the load resolves inside the grace period', async () => {
		vi.useFakeTimers();
		const harness = mount(DeferredLoadingIndicatorHarness, { target: document.body });
		app = harness;
		flushSync();

		await vi.advanceTimersByTimeAsync(DEFERRED_LOADING_DELAY_MS - 1);
		harness.resolve();
		flushSync();
		await vi.advanceTimersByTimeAsync(DEFERRED_LOADING_DELAY_MS * 2);
		flushSync();
		expect(document.querySelector('[data-deferred-loading]')).toBeNull();
	});
});
