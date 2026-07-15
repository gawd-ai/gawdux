import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	createCancellableScheduler,
	DEFAULT_SCHEDULE_DELAY_MS
} from '../src/lib/utils/cancellable-scheduler';

describe('createCancellableScheduler', () => {
	afterEach(() => vi.useRealTimers());

	it('runs only the latest task after the default 300ms delay', () => {
		vi.useFakeTimers();
		const scheduler = createCancellableScheduler();
		const first = vi.fn();
		const second = vi.fn();

		scheduler.schedule(first);
		scheduler.schedule(second);
		expect(scheduler.pending).toBe(true);

		vi.advanceTimersByTime(DEFAULT_SCHEDULE_DELAY_MS - 1);
		expect(second).not.toHaveBeenCalled();
		vi.advanceTimersByTime(1);

		expect(first).not.toHaveBeenCalled();
		expect(second).toHaveBeenCalledOnce();
		expect(scheduler.pending).toBe(false);
	});

	it('can cancel or synchronously flush pending work', () => {
		vi.useFakeTimers();
		const scheduler = createCancellableScheduler();
		const cancelled = vi.fn();
		const flushed = vi.fn();

		scheduler.schedule(cancelled);
		scheduler.cancel();
		vi.runAllTimers();
		expect(cancelled).not.toHaveBeenCalled();

		scheduler.schedule(flushed);
		scheduler.flush();
		expect(flushed).toHaveBeenCalledOnce();
		expect(scheduler.pending).toBe(false);
		vi.runAllTimers();
		expect(flushed).toHaveBeenCalledOnce();
	});
});
