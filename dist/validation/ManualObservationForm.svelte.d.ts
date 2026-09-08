import type { ManualObservationInput } from './types.js';
type $$ComponentProps = {
    caseId: string;
    title: string;
    expectedRevision: string;
    oncomplete: (input: ManualObservationInput) => Promise<void>;
    oncancel?: () => void;
};
declare const ManualObservationForm: import("svelte").Component<$$ComponentProps, {}, "">;
type ManualObservationForm = ReturnType<typeof ManualObservationForm>;
export default ManualObservationForm;
