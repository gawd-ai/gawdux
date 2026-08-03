import { type MessageCenterVisibilitySource } from '../utils/message-center';
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
export declare function createAlertOpsPoller(options: CreateAlertOpsPollerOptions): AlertOpsPoller;
