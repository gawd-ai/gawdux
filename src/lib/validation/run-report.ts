import type { ValidationCaseView } from './types.js';

/** A result in words: Passed, Failed, or Not run for anything else. */
export function resultWord(result: string): 'Passed' | 'Failed' | 'Not run' {
	return result === 'pass' ? 'Passed' : result === 'fail' ? 'Failed' : 'Not run';
}

/** The cases passed, failed and not run. */
export function resultCounts(cases: readonly Pick<ValidationCaseView, 'result'>[]): {
	passed: number;
	failed: number;
	notRun: number;
} {
	const passed = cases.filter((item) => item.result === 'pass').length;
	const failed = cases.filter((item) => item.result === 'fail').length;
	return { passed, failed, notRun: cases.length - passed - failed };
}
