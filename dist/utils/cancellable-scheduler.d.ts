export declare const DEFAULT_SCHEDULE_DELAY_MS = 300;
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
export declare function createCancellableScheduler(delayMs?: number): CancellableScheduler;
