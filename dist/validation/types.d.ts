/** Host-projected, already-authorized presentation data. No credential,
 * routing, approval policy or storage implementation belongs in these views. */
export interface ValidationCapture {
    file: string;
    label: string;
    sha256: string;
    /** Optional host-authorized URL; omitted when evidence is withheld. */
    href?: string;
}
export interface ValidationCaseView {
    id: string;
    title: string;
    mode: string;
    result: string;
    requirements: string[];
    steps: {
        number: number;
        action: string;
        expected: string;
        result: string;
        observed: string[];
        evidence: ValidationCapture[];
    }[];
    manual?: {
        observed: string;
        enteredBy: string;
        enteredAt: string;
    } | null;
    canComplete?: boolean;
}
export interface ValidationExecutionView {
    id: string;
    title: string;
    protocol: string;
    protocolRevision: string;
    status: string;
    startedAt: string;
    environment: string;
    revision: string;
    contentHash: string;
    evidenceHeld: boolean;
    cases: ValidationCaseView[];
    traceability: {
        requirement: string;
        cases: string[];
    }[];
}
export interface SignatureHistoryEntry {
    id: string;
    meaning: string;
    signer: string;
    signedAt: string;
    contentHash: string;
    withdrawnAt?: string | null;
    withdrawalReason?: string | null;
    /** null means the host cannot verify the historical content codec. */
    integrity: boolean | null;
}
export interface ManualObservationInput {
    caseId: string;
    expectedRevision: string;
    observed: string;
    result: 'pass' | 'fail';
}
