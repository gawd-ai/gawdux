import type { AuditHistoryHeadIcons, AuditHistoryRow } from './types';
type $$ComponentProps = {
    rows: AuditHistoryRow[];
    /** A column for the area; off where every row belongs to one record. */
    showModule?: boolean;
    emptyText?: string;
    formatTime?: (iso: string) => {
        date: string;
        time: string;
    };
    /** A column icon before a header's word, per header; none by default. */
    headIcons?: AuditHistoryHeadIcons;
};
declare const AuditHistoryTable: import("svelte").Component<$$ComponentProps, {}, "">;
type AuditHistoryTable = ReturnType<typeof AuditHistoryTable>;
export default AuditHistoryTable;
