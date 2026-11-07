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

export interface ValidationCaseView {
	id: string;
	title: string;
	result: ValidationResult | string;
	requirements: string[];
	steps: ValidationStepView[];
}

export interface ValidationExecutionView {
	/** The execution's identifier. */
	id: string;
	/** The SHA-256 of its content, as the host computes it. */
	contentHash: string;
	/** The host withholds observations and captures from this reader. */
	evidenceHeld: boolean;
	cases: ValidationCaseView[];
	traceability: { requirement: string; cases: string[] }[];
}
