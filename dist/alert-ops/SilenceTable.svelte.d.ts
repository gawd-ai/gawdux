import { type AlertOpsCopy, type AlertOpsMutationState, type AlertOpsSilence } from './types';
type $$ComponentProps = {
    silences: AlertOpsSilence[];
    copy?: Partial<AlertOpsCopy>;
    /** Opt-in: the host authorized silence expiry for this viewer. */
    canMutate?: boolean;
    /** Intent only — the host confirms, then performs the expiry. */
    onexpire?: (silenceId: string) => void;
    /** Host-owned mutation lifecycle; the table keeps no state of its own. */
    mutation?: AlertOpsMutationState;
};
declare const SilenceTable: import("svelte").Component<$$ComponentProps, {}, "">;
type SilenceTable = ReturnType<typeof SilenceTable>;
export default SilenceTable;
