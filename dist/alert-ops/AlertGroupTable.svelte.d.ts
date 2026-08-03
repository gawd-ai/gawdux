import { type AlertOpsCopy, type AlertOpsGroup } from './types';
type $$ComponentProps = {
    groups: AlertOpsGroup[];
    selectedFingerprint?: string | null;
    copy?: Partial<AlertOpsCopy>;
    onselect?: (fingerprint: string) => void;
};
declare const AlertGroupTable: import("svelte").Component<$$ComponentProps, {}, "">;
type AlertGroupTable = ReturnType<typeof AlertGroupTable>;
export default AlertGroupTable;
