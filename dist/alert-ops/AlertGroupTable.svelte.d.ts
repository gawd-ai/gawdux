import { type AlertOpsCopy, type AlertOpsGroup, type AlertOpsHeadIcons } from './types';
type $$ComponentProps = {
    groups: AlertOpsGroup[];
    selectedFingerprint?: string | null;
    copy?: Partial<AlertOpsCopy>;
    onselect?: (fingerprint: string) => void;
    /** A column icon before a header's word, per header; none by default. */
    headIcons?: AlertOpsHeadIcons;
};
declare const AlertGroupTable: import("svelte").Component<$$ComponentProps, {}, "">;
type AlertGroupTable = ReturnType<typeof AlertGroupTable>;
export default AlertGroupTable;
