import type { ManualObservationInput } from './types.js';
type $$ComponentProps = {
    open: boolean;
    /** The case's identifier. */
    caseId: string;
    /** The case's title. */
    title: string;
    /** The execution's revision the reader saw. */
    expectedRevision: string;
    /** A write the host tracks itself is in flight. */
    busy?: boolean;
    /** The host's refusal, shown inside the drawer. */
    error?: string | null;
    /** Records the observation; a rejected promise shows the drawer's own refusal. */
    oncomplete: (input: ManualObservationInput) => Promise<void> | void;
    /** Closes the drawer. */
    oncancel: () => void;
};
declare const ManualObservationCommandSurface: import("svelte").Component<$$ComponentProps, {}, "">;
type ManualObservationCommandSurface = ReturnType<typeof ManualObservationCommandSurface>;
export default ManualObservationCommandSurface;
