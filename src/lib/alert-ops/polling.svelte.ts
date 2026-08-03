// gawdux/alert-ops — host-driven polling helper.
//
// The console itself never fetches; hosts own transport. This helper gives
// them the standard cadence: fetch on an interval, back off exponentially on
// failure (reset on success), pause while the document is hidden (injectable
// visibility source — same pattern as the message center), an immediate
// manual `refresh()`, and `stop()` for teardown. Fetches never overlap: the
// next tick is scheduled only after the previous fetcher settles.

import {
	createDocumentVisibilitySource,
	type MessageCenterVisibilitySource
} from '../utils/message-center';

/** Structural re-use of the message-center visibility-source contract. */
export type AlertOpsVisibilitySource = MessageCenterVisibilitySource;

export type AlertOpsPollerStatus = 'active' | 'paused' | 'stopped';

export interface CreateAlertOpsPollerOptions {
	/** Host fetch-and-apply. A rejection counts as a failure for backoff. */
	fetcher: () => void | Promise<unknown>;
	/** Steady-state polling interval. Default 30 s. */
	intervalMs?: number;
	/** Backoff ceiling. Default 5 min. */
	maxBackoffMs?: number;
	/**
	 * Injectable visibility source. Defaults to the document when one exists;
	 * pass `null` to disable pausing entirely.
	 */
	visibility?: AlertOpsVisibilitySource | null;
	/** Run the first fetch immediately on creation. Default true. */
	immediate?: boolean;
}

export interface AlertOpsPoller {
	/** 'active' while scheduling, 'paused' while hidden, 'stopped' after stop(). */
	readonly status: AlertOpsPollerStatus;
	/** Message of the most recent failure; null after a success. */
	readonly lastError: string | null;
	/** True while a fetch is in flight (interval, resume or manual). */
	readonly refreshing: boolean;
	readonly consecutiveFailures: number;
	/** Immediate manual fetch; cancels the pending tick and reschedules after. */
	refresh(): Promise<void>;
	/** Stops scheduling and detaches the visibility subscription. Idempotent. */
	stop(): void;
}

export function createAlertOpsPoller(options: CreateAlertOpsPollerOptions): AlertOpsPoller {
	const intervalMs = options.intervalMs ?? 30_000;
	const maxBackoffMs = options.maxBackoffMs ?? 300_000;
	if (!Number.isFinite(intervalMs) || intervalMs <= 0) {
		throw new Error('intervalMs must be a positive finite number');
	}
	if (!Number.isFinite(maxBackoffMs) || maxBackoffMs < intervalMs) {
		throw new Error('maxBackoffMs must be a finite number >= intervalMs');
	}

	let status = $state<AlertOpsPollerStatus>('active');
	let lastError = $state<string | null>(null);
	let refreshing = $state(false);
	let failures = $state(0);
	let timer: ReturnType<typeof setTimeout> | null = null;
	let unsubscribeVisibility: (() => void) | null = null;

	function currentDelayMs(): number {
		if (failures <= 0) return intervalMs;
		// 2^failures over the base interval, capped. The exponent itself is
		// clamped so pathological failure streaks cannot overflow the double.
		return Math.min(intervalMs * 2 ** Math.min(failures, 30), maxBackoffMs);
	}

	function clearTimer(): void {
		if (timer !== null) {
			clearTimeout(timer);
			timer = null;
		}
	}

	function schedule(): void {
		if (status !== 'active') return;
		clearTimer();
		timer = setTimeout(() => {
			timer = null;
			void run();
		}, currentDelayMs());
	}

	async function run(): Promise<void> {
		if (status === 'stopped' || refreshing) return;
		refreshing = true;
		try {
			await options.fetcher();
			failures = 0;
			lastError = null;
		} catch (error) {
			failures += 1;
			lastError = error instanceof Error ? error.message : String(error);
		} finally {
			refreshing = false;
		}
		// No-op while paused or stopped; the resume path fetches fresh instead.
		schedule();
	}

	function applyHidden(hidden: boolean): void {
		if (status === 'stopped') return;
		if (hidden) {
			if (status === 'active') {
				status = 'paused';
				clearTimer();
			}
			return;
		}
		if (status === 'paused') {
			status = 'active';
			// Freshen immediately on return to the tab; run() reschedules. If a
			// fetch is still in flight from before the pause, its completion
			// reschedules now that the poller is active again.
			void run();
		}
	}

	async function refresh(): Promise<void> {
		if (status === 'stopped') return;
		clearTimer();
		await run();
	}

	function stop(): void {
		if (status === 'stopped') return;
		status = 'stopped';
		clearTimer();
		unsubscribeVisibility?.();
		unsubscribeVisibility = null;
	}

	const visibility =
		options.visibility === null
			? null
			: (options.visibility ??
				(typeof document !== 'undefined' ? createDocumentVisibilitySource(document) : null));
	const startsHidden = Boolean(visibility?.isHidden());
	if (visibility) {
		unsubscribeVisibility = visibility.subscribe((hidden) => applyHidden(hidden));
	}
	if (startsHidden) {
		status = 'paused';
	} else if (options.immediate ?? true) {
		void run();
	} else {
		schedule();
	}

	return {
		get status() {
			return status;
		},
		get lastError() {
			return lastError;
		},
		get refreshing() {
			return refreshing;
		},
		get consecutiveFailures() {
			return failures;
		},
		refresh,
		stop
	};
}
