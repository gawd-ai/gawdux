import { type AlertOpsAlert, type AlertOpsCopy } from './types';
type $$ComponentProps = {
    alert?: AlertOpsAlert | null;
    /** Group key of the selected alert, for correlation identity. */
    groupKey?: string;
    copy?: Partial<AlertOpsCopy>;
};
declare const AlertDetailPanel: import("svelte").Component<$$ComponentProps, {}, "">;
type AlertDetailPanel = ReturnType<typeof AlertDetailPanel>;
export default AlertDetailPanel;
