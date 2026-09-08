import { type AlertOpsAlert, type AlertOpsCopy, type AlertOpsData, type AlertOpsFilters, type AlertOpsMutationState, type AlertOpsScope } from './types';
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
    /** Opt-in: the host authorized expiring silences. Needs `onexpire` too. */
    canMutate?: boolean;
    /** Intent only — the host confirms, then expires the silence. */
    onexpire?: (silenceId: string) => void;
    /** Opt-in: the host authorized silencing alerts. Needs `onsilence` too. */
    canSilence?: boolean;
    /** Intent only — the host confirms, then creates the silence. */
    onsilence?: (alert: AlertOpsAlert) => void;
    /**
     * Host-owned mutation lifecycle. The console runs no mutation state
     * machine: it only reflects what it is handed — pending disables the
     * affordances and shows the busy indicator, failed shows the inline
     * error (already sanitized by the host, rendered as text).
     */
    mutation?: AlertOpsMutationState;
    /**
     * Render the provider health strip above the tabs. A host whose page
     * grammar keeps status and actions elsewhere (a breadcrumb badge, a
     * bottom command bar) passes false and shows `data.status` itself; the
     * console then opens directly on its tabs, like any other list surface.
     */
    healthBar?: boolean;
};
declare const AlertOpsConsole: import("svelte").Component<$$ComponentProps, {}, "selectedFingerprint" | "filters">;
type AlertOpsConsole = ReturnType<typeof AlertOpsConsole>;
export default AlertOpsConsole;
