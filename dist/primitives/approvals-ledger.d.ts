export type LedgerRowState = 'signed' | 'awaiting' | 'waiting' | 'sent' | 'not_signed' | 'withdrawn' | 'not_required';
export interface LedgerRow {
    stepCode: string;
    /** The step label: the role the step is signed as. */
    role: string;
    state: LedgerRowState;
    signer: {
        name: string;
        email: string;
    } | null;
    /** Executed, Reviewed, Approved; null where no signature records one. */
    meaning: string | null;
    /** ISO; shown at the zone the ledger is given, zone named. */
    signedAt: string | null;
    reason: string | null;
    /** Set on signed rows. */
    integrity: 'intact' | 'changed' | 'unchecked' | null;
    /** The other step labels this signer signed in the same cycle. */
    alsoSigned: string[];
    /** The row's own words: "Awaiting Quality", "Sent to the client", or a signed
     *  row's integrity words when it is not intact. */
    note: string | null;
}
/** One electronic signature as the ledger's table lists it. */
export interface LedgerSignature {
    id: number;
    meaning: 'Executed' | 'Reviewed' | 'Approved' | 'Withdrawn';
    signerName: string;
    signerEmail: string;
    signedAt: string;
    reason: string | null;
    /** True while the content still equals what was signed; null where nothing
     *  records what was signed, so it cannot be checked. */
    intact: boolean | null;
    /** False once a later Withdrawn signature by the same person supersedes it. */
    standing: boolean;
}
export interface LedgerView {
    /** "Approvals of version 1.0", "Approvals in this review". */
    title: string;
    rows: LedgerRow[];
    /** Whether the approving signature binds the text; null where unchecked. */
    verified: boolean | null;
    /** The check in words, as the host words it; null where none is stated. */
    integritySentence: string | null;
    approvedWith: {
        title: string;
        href: string;
    } | null;
    /** Every signature, withdrawn included, oldest first. */
    signatures: LedgerSignature[];
}
/**
 * One row as one line: "Quality · Jane Roe (jane@site) · Approved ·
 * 2026-10-21 14:03:11 EDT", then "Also signed Supplier" and, on a signed row
 * that is not intact, its integrity words. An unsigned row reads its note.
 * `stamp` formats a moment at the site, zone named.
 */
export declare function ledgerRowText(row: LedgerRow, stamp: (iso: string) => string): string;
