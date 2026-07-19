export const DEFAULT_SCHEDULE_DELAY_MS = 300;
export const SEARCH_SCHEDULE_DELAY_MS = 20;

export interface CancellableScheduler {
	/** Replace any pending work and run this task after the configured delay. */
	schedule(task: () => void): void;
	/** Drop pending work without invoking it. */
	cancel(): void;
	/** Run pending work immediately, once. */
	flush(): void;
	readonly pending: boolean;
}

/**
 * Small framework-agnostic scheduler for debounced list queries. Consumers
 * should call `cancel()` from their teardown hook when the owner can unmount.
 */
export function createCancellableScheduler(
	delayMs = DEFAULT_SCHEDULE_DELAY_MS
): CancellableScheduler {
	const delay = Math.max(0, delayMs);
	let timer: ReturnType<typeof setTimeout> | null = null;
	let queuedTask: (() => void) | null = null;

	function cancel() {
		if (timer !== null) clearTimeout(timer);
		timer = null;
		queuedTask = null;
	}

	function runQueuedTask() {
		const task = queuedTask;
		timer = null;
		queuedTask = null;
		task?.();
	}

	function schedule(task: () => void) {
		cancel();
		queuedTask = task;
		timer = setTimeout(runQueuedTask, delay);
	}

	function flush() {
		if (timer === null) return;
		clearTimeout(timer);
		runQueuedTask();
	}

	return {
		schedule,
		cancel,
		flush,
		get pending() {
			return timer !== null;
		}
	};
}

/**
 * Search input only needs a short keystroke-coalescing window. Keeping that
 * window to a small share of the interaction budget leaves time for navigation,
 * server work, and paint instead of making every query feel late.
 */
export function createSearchScheduler(): CancellableScheduler {
	return createCancellableScheduler(SEARCH_SCHEDULE_DELAY_MS);
}
