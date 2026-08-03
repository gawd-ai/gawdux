import { type AlertOpsCopy, type AlertOpsData, type AlertOpsFilters, type AlertOpsScope } from './types';
type $$ComponentProps = {
    scope: AlertOpsScope;
    filters?: AlertOpsFilters;
    data: AlertOpsData;
    selectedFingerprint?: string | null;
    copy?: Partial<AlertOpsCopy>;
    /** Injected clock for deterministic relative time (forwarded to the health bar). */
    now?: number | Date;
    /** True while the host's fetch is in flight; disables Refresh. */
    refreshing?: boolean;
    onrefresh?: () => void;
    onfilterschange?: (filters: AlertOpsFilters) => void;
    onselect?: (fingerprint: string) => void;
};
declare const AlertOpsConsole: import("svelte").Component<$$ComponentProps, {}, "selectedFingerprint" | "filters">;
type AlertOpsConsole = ReturnType<typeof AlertOpsConsole>;
export default AlertOpsConsole;
