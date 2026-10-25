import { type LedgerView } from './approvals-ledger';
type $$ComponentProps = {
    ledger: LedgerView;
    /** IANA zone: every moment is shown there, zone named. */
    timeZone: string;
};
declare const ApprovalsLedger: import("svelte").Component<$$ComponentProps, {}, "">;
type ApprovalsLedger = ReturnType<typeof ApprovalsLedger>;
export default ApprovalsLedger;
