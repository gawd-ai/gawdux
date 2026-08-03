// gawdux/alert-ops — host-driven polling helper.
//
// The console itself never fetches; hosts own transport. This helper gives
// them the standard cadence: fetch on an interval, back off exponentially on
// failure (reset on success), pause while the document is hidden (injectable
// visibility source — same pattern as the message center), an immediate
// manual `refresh()`, and `stop()` for teardown. Fetches never overlap: the
// next tick is scheduled only after the previous fetcher settles.
import { createDocumentVisibilitySource } from '../utils/message-center';
export function createAlertOpsPoller(options) {
    const intervalMs = options.intervalMs ?? 30_000;
    const maxBackoffMs = options.maxBackoffMs ?? 300_000;
    if (!Number.isFinite(intervalMs) || intervalMs <= 0) {
        throw new Error('intervalMs must be a positive finite number');
    }
    if (!Number.isFinite(maxBackoffMs) || maxBackoffMs < intervalMs) {
        throw new Error('maxBackoffMs must be a finite number >= intervalMs');
    }
    let status = $state('active');
    let lastError = $state(null);
    let refreshing = $state(false);
    let failures = $state(0);
    let timer = null;
    let unsubscribeVisibility = null;
    function currentDelayMs() {
        if (failures <= 0)
            return intervalMs;
        // 2^failures over the base interval, capped. The exponent itself is
        // clamped so pathological failure streaks cannot overflow the double.
        return Math.min(intervalMs * 2 ** Math.min(failures, 30), maxBackoffMs);
    }
    function clearTimer() {
        if (timer !== null) {
            clearTimeout(timer);
            timer = null;
        }
    }
    function schedule() {
        if (status !== 'active')
            return;
        clearTimer();
        timer = setTimeout(() => {
            timer = null;
            void run();
        }, currentDelayMs());
    }
    async function run() {
        if (status === 'stopped' || refreshing)
            return;
        refreshing = true;
        try {
            await options.fetcher();
            failures = 0;
            lastError = null;
        }
        catch (error) {
            failures += 1;
            lastError = error instanceof Error ? error.message : String(error);
        }
        finally {
            refreshing = false;
        }
        // No-op while paused or stopped; the resume path fetches fresh instead.
        schedule();
    }
    function applyHidden(hidden) {
        if (status === 'stopped')
            return;
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
    async function refresh() {
        if (status === 'stopped')
            return;
        clearTimer();
        await run();
    }
    function stop() {
        if (status === 'stopped')
            return;
        status = 'stopped';
        clearTimer();
        unsubscribeVisibility?.();
        unsubscribeVisibility = null;
    }
    const visibility = options.visibility === null
        ? null
        : (options.visibility ??
            (typeof document !== 'undefined' ? createDocumentVisibilitySource(document) : null));
    const startsHidden = Boolean(visibility?.isHidden());
    if (visibility) {
        unsubscribeVisibility = visibility.subscribe((hidden) => applyHidden(hidden));
    }
    if (startsHidden) {
        status = 'paused';
    }
    else if (options.immediate ?? true) {
        void run();
    }
    else {
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
