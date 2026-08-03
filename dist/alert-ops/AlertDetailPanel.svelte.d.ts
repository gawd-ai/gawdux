import { type AlertOpsAlert, type AlertOpsCopy, type AlertOpsMutationState } from './types';
type $$ComponentProps = {
    alert?: AlertOpsAlert | null;
    /** Group key of the selected alert, for correlation identity. */
    groupKey?: string;
    copy?: Partial<AlertOpsCopy>;
    /** Opt-in: the host authorized creating silences for this viewer. */
    canSilence?: boolean;
    /** Intent only — the host confirms, then creates the silence. */
    onsilence?: (alert: AlertOpsAlert) => void;
    /** Host-owned mutation lifecycle; the panel keeps no state of its own. */
    mutation?: AlertOpsMutationState;
};
declare const AlertDetailPanel: import("svelte").Component<$$ComponentProps, {}, "">;
type AlertDetailPanel = ReturnType<typeof AlertDetailPanel>;
export default AlertDetailPanel;
