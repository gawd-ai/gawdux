import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	createAlertOpsPoller,
	type AlertOpsVisibilitySource
} from '../src/lib/alert-ops/polling.svelte';

class FakeVisibility implements AlertOpsVisibilitySource {
	#hidden = false;
	readonly #listeners = new Set<(hidden: boolean) => void>();

	isHidden(): boolean {
		return this.#hidden;
	}

	subscribe(listener: (hidden: boolean) => void): () => void {
		this.#listeners.add(listener);
		return () => this.#listeners.delete(listener);
	}

	setHidden(hidden: boolean): void {
		this.#hidden = hidden;
		for (const listener of this.#listeners) listener(hidden);
	}

	get listenerCount(): number {
		return this.#listeners.size;
	}
}

afterEach(() => {
	vi.useRealTimers();
});

describe('createAlertOpsPoller', () => {
	it('fetches immediately and then on the steady interval', async () => {
		vi.useFakeTimers();
		const fetcher = vi.fn().mockResolvedValue(undefined);
		const poller = createAlertOpsPoller({
			fetcher,
			intervalMs: 1_000,
			visibility: new FakeVisibility()
		});

		expect(fetcher).toHaveBeenCalledTimes(1);
		expect(poller.refreshing).toBe(true);
		await vi.advanceTimersByTimeAsync(0);
		expect(poller.refreshing).toBe(false);
		expect(poller.status).toBe('active');

		await vi.advanceTimersByTimeAsync(999);
		expect(fetcher).toHaveBeenCalledTimes(1);
		await vi.advanceTimersByTimeAsync(1);
		expect(fetcher).toHaveBeenCalledTimes(2);
		await vi.advanceTimersByTimeAsync(1_000);
		expect(fetcher).toHaveBeenCalledTimes(3);

		poller.stop();
	});

	it('doubles the delay on consecutive failures up to the cap, and success resets it', async () => {
		vi.useFakeTimers();
		const fetcher = vi.fn().mockRejectedValue(new Error('boom'));
		const poller = createAlertOpsPoller({
			fetcher,
			intervalMs: 1_000,
			maxBackoffMs: 8_000,
			visibility: new FakeVisibility()
		});

		// Initial fetch fails.
		await vi.advanceTimersByTimeAsync(0);
		expect(fetcher).toHaveBeenCalledTimes(1);
		expect(poller.consecutiveFailures).toBe(1);
		expect(poller.lastError).toBe('boom');

		// Failure 1 -> 2s.
		await vi.advanceTimersByTimeAsync(1_999);
		expect(fetcher).toHaveBeenCalledTimes(1);
		await vi.advanceTimersByTimeAsync(1);
		expect(fetcher).toHaveBeenCalledTimes(2);

		// Failure 2 -> 4s.
		await vi.advanceTimersByTimeAsync(3_999);
		expect(fetcher).toHaveBeenCalledTimes(2);
		await vi.advanceTimersByTimeAsync(1);
		expect(fetcher).toHaveBeenCalledTimes(3);

		// Failure 3 -> 8s (the cap).
		await vi.advanceTimersByTimeAsync(7_999);
		expect(fetcher).toHaveBeenCalledTimes(3);
		await vi.advanceTimersByTimeAsync(1);
		expect(fetcher).toHaveBeenCalledTimes(4);

		// Failure 4 stays capped at 8s (uncapped would be 16s).
		await vi.advanceTimersByTimeAsync(8_000);
		expect(fetcher).toHaveBeenCalledTimes(5);
		expect(poller.consecutiveFailures).toBe(5);

		// A success resets backoff and the error.
		fetcher.mockResolvedValue(undefined);
		await vi.advanceTimersByTimeAsync(8_000);
		expect(fetcher).toHaveBeenCalledTimes(6);
		await vi.advanceTimersByTimeAsync(0);
		expect(poller.consecutiveFailures).toBe(0);
		expect(poller.lastError).toBeNull();
		await vi.advanceTimersByTimeAsync(1_000);
		expect(fetcher).toHaveBeenCalledTimes(7);

		poller.stop();
	});

	it('pauses while hidden and fetches immediately on becoming visible again', async () => {
		vi.useFakeTimers();
		const visibility = new FakeVisibility();
		const fetcher = vi.fn().mockResolvedValue(undefined);
		const poller = createAlertOpsPoller({ fetcher, intervalMs: 1_000, visibility });

		expect(fetcher).toHaveBeenCalledTimes(1);
		await vi.advanceTimersByTimeAsync(0);

		visibility.setHidden(true);
		expect(poller.status).toBe('paused');
		await vi.advanceTimersByTimeAsync(60_000);
		expect(fetcher).toHaveBeenCalledTimes(1);

		visibility.setHidden(false);
		expect(poller.status).toBe('active');
		expect(fetcher).toHaveBeenCalledTimes(2);
		await vi.advanceTimersByTimeAsync(0);
		await vi.advanceTimersByTimeAsync(1_000);
		expect(fetcher).toHaveBeenCalledTimes(3);

		poller.stop();
	});

	it('starts paused without an initial fetch when created hidden', async () => {
		vi.useFakeTimers();
		const visibility = new FakeVisibility();
		visibility.setHidden(true);
		const fetcher = vi.fn().mockResolvedValue(undefined);
		const poller = createAlertOpsPoller({ fetcher, intervalMs: 1_000, visibility });

		expect(poller.status).toBe('paused');
		await vi.advanceTimersByTimeAsync(10_000);
		expect(fetcher).not.toHaveBeenCalled();

		visibility.setHidden(false);
		expect(fetcher).toHaveBeenCalledTimes(1);

		poller.stop();
	});

	it('refresh() fetches immediately and reschedules from the manual fetch', async () => {
		vi.useFakeTimers();
		const fetcher = vi.fn().mockResolvedValue(undefined);
		const poller = createAlertOpsPoller({
			fetcher,
			intervalMs: 1_000,
			visibility: new FakeVisibility()
		});
		await vi.advanceTimersByTimeAsync(0);
		expect(fetcher).toHaveBeenCalledTimes(1);

		await vi.advanceTimersByTimeAsync(500);
		await poller.refresh();
		expect(fetcher).toHaveBeenCalledTimes(2);

		// The pending tick was cancelled; the next fetch is a full interval
		// after the manual refresh, not at the original schedule.
		await vi.advanceTimersByTimeAsync(999);
		expect(fetcher).toHaveBeenCalledTimes(2);
		await vi.advanceTimersByTimeAsync(1);
		expect(fetcher).toHaveBeenCalledTimes(3);

		poller.stop();
	});

	it('stop() halts scheduling, detaches visibility, and neuters refresh()', async () => {
		vi.useFakeTimers();
		const visibility = new FakeVisibility();
		const fetcher = vi.fn().mockResolvedValue(undefined);
		const poller = createAlertOpsPoller({ fetcher, intervalMs: 1_000, visibility });
		await vi.advanceTimersByTimeAsync(0);
		expect(visibility.listenerCount).toBe(1);

		poller.stop();
		expect(poller.status).toBe('stopped');
		expect(visibility.listenerCount).toBe(0);

		await vi.advanceTimersByTimeAsync(120_000);
		expect(fetcher).toHaveBeenCalledTimes(1);

		await poller.refresh();
		expect(fetcher).toHaveBeenCalledTimes(1);

		// Idempotent.
		poller.stop();
		expect(poller.status).toBe('stopped');
	});

	it('rejects nonsensical timing options', () => {
		expect(() => createAlertOpsPoller({ fetcher: () => {}, intervalMs: 0 })).toThrow();
		expect(() =>
			createAlertOpsPoller({ fetcher: () => {}, intervalMs: 1_000, maxBackoffMs: 500 })
		).toThrow();
	});
});
