export const DEFAULT_SCHEDULE_DELAY_MS = 300;
/**
 * Small framework-agnostic scheduler for debounced list queries. Consumers
 * should call `cancel()` from their teardown hook when the owner can unmount.
 */
export function createCancellableScheduler(delayMs = DEFAULT_SCHEDULE_DELAY_MS) {
    const delay = Math.max(0, delayMs);
    let timer = null;
    let queuedTask = null;
    function cancel() {
        if (timer !== null)
            clearTimeout(timer);
        timer = null;
        queuedTask = null;
    }
    function runQueuedTask() {
        const task = queuedTask;
        timer = null;
        queuedTask = null;
        task?.();
    }
    function schedule(task) {
        cancel();
        queuedTask = task;
        timer = setTimeout(runQueuedTask, delay);
    }
    function flush() {
        if (timer === null)
            return;
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
