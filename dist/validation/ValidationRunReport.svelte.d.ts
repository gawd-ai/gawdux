import type { ValidationExecutionView } from './types.js';
type $$ComponentProps = {
    execution: ValidationExecutionView;
    /** What a reader reads in place of observations and captures the host withholds. */
    heldNotice?: string | null;
    /**
     * Opens the host's drawer to record a manual case's observation, from
     * the "Record manual observation" a case it lets the reader complete
     * offers. None: no case offers it.
     */
    onmanual?: ((caseId: string) => void) | undefined;
};
declare const ValidationRunReport: import("svelte").Component<$$ComponentProps, {}, "">;
type ValidationRunReport = ReturnType<typeof ValidationRunReport>;
export default ValidationRunReport;
