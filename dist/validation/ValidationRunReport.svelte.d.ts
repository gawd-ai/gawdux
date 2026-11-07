import type { ValidationExecutionView } from './types.js';
type $$ComponentProps = {
    execution: ValidationExecutionView;
    /** What a reader reads in place of observations and captures the host withholds. */
    heldNotice?: string | null;
};
declare const ValidationRunReport: import("svelte").Component<$$ComponentProps, {}, "">;
type ValidationRunReport = ReturnType<typeof ValidationRunReport>;
export default ValidationRunReport;
