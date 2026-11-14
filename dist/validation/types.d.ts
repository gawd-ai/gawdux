/** Host-projected, already-authorized presentation data. No credential,
 * routing, approval policy or storage implementation belongs in these views. */
/** A result as the execution recorded it; anything else reads as not run. */
export type ValidationResult = 'pass' | 'fail' | 'not-run';
export interface ValidationCapture {
    file: string;
    label: string;
    sha256: string;
    /** Optional host-authorized URL; omitted when evidence is withheld. */
    href?: string;
}
export interface ValidationStepView {
    number: number;
    action: string;
    expected: string;
    result: ValidationResult | string;
    observed: string[];
    evidence: ValidationCapture[];
}
/** A manual case's recorded observation: what was observed, by whom, when. */
export interface ValidationManualObservation {
    observed: string;
    /** Who recorded it, as the host names them. */
    enteredBy: string;
    /** When, as the host writes it. */
    enteredAt: string;
}
export interface ValidationCaseView {
    id: string;
    title: string;
    result: ValidationResult | string;
    requirements: string[];
    steps: ValidationStepView[];
    /**
     * The observation recorded for a manual case, shown after its steps;
     * withheld with them. None: nothing is drawn.
     */
    manual?: ValidationManualObservation | null;
    /**
     * The host lets the reader record this case's observation now: the report
     * offers "Record manual observation" on it, when the host passes
     * `onmanual`.
     */
    canComplete?: boolean;
}
export interface ValidationExecutionView {
    /** The execution's identifier. */
    id: string;
    /** The SHA-256 of its content, as the host computes it. */
    contentHash: string;
    /** The host withholds observations and captures from this reader. */
    evidenceHeld: boolean;
    cases: ValidationCaseView[];
    traceability: {
        requirement: string;
        cases: string[];
    }[];
}
/** What the manual observation drawer hands its host to record. */
export interface ManualObservationInput {
    caseId: string;
    /** The execution's revision the reader saw, for the host to check. */
    expectedRevision: string;
    observed: string;
    result: 'pass' | 'fail';
}
