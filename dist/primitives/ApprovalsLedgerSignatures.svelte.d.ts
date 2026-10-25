import type { LedgerSignature } from './approvals-ledger';
type $$ComponentProps = {
    signatures: LedgerSignature[];
    /** The zone every moment is shown in, named. */
    timeZone: string;
    emptyText?: string;
    /** False where the content is not compared with what was signed. */
    integrity?: boolean;
};
declare const ApprovalsLedgerSignatures: import("svelte").Component<$$ComponentProps, {}, "">;
type ApprovalsLedgerSignatures = ReturnType<typeof ApprovalsLedgerSignatures>;
export default ApprovalsLedgerSignatures;
