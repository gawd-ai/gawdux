import { type AlertOpsCopy, type AlertOpsProviderStatus } from './types';
type $$ComponentProps = {
    status: AlertOpsProviderStatus;
    /** Display label of the environment in scope (host-resolved). */
    environmentLabel?: string;
    /** Display label of the monitoring plane in scope (host-resolved). */
    planeLabel?: string;
    copy?: Partial<AlertOpsCopy>;
    /** Injected clock for deterministic relative time. Defaults to Date.now(). */
    now?: number | Date;
    /** Disables Refresh while a host-driven fetch is in flight. */
    refreshing?: boolean;
    onrefresh?: () => void;
};
declare const ProviderHealthBar: import("svelte").Component<$$ComponentProps, {}, "">;
type ProviderHealthBar = ReturnType<typeof ProviderHealthBar>;
export default ProviderHealthBar;
