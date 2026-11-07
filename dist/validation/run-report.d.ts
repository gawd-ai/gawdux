import type { ValidationCaseView } from './types.js';
/** A result in words: Passed, Failed, or Not run for anything else. */
export declare function resultWord(result: string): 'Passed' | 'Failed' | 'Not run';
/** The cases passed, failed and not run. */
export declare function resultCounts(cases: readonly Pick<ValidationCaseView, 'result'>[]): {
    passed: number;
    failed: number;
    notRun: number;
};
