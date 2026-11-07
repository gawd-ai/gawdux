/** A result in words: Passed, Failed, or Not run for anything else. */
export function resultWord(result) {
    return result === 'pass' ? 'Passed' : result === 'fail' ? 'Failed' : 'Not run';
}
/** The cases passed, failed and not run. */
export function resultCounts(cases) {
    const passed = cases.filter((item) => item.result === 'pass').length;
    const failed = cases.filter((item) => item.result === 'fail').length;
    return { passed, failed, notRun: cases.length - passed - failed };
}
