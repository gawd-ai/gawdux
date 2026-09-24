import type { AuditHistoryRow } from './types';
type $$ComponentProps = {
    rows: AuditHistoryRow[];
    /** A column for the area; off where every row belongs to one record. */
    showModule?: boolean;
    emptyText?: string;
    formatTime?: (iso: string) => {
        date: string;
        time: string;
    };
};
declare const AuditHistoryTable: import("svelte").Component<$$ComponentProps, {}, "">;
type AuditHistoryTable = ReturnType<typeof AuditHistoryTable>;
export default AuditHistoryTable;
