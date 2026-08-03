import { type AlertOpsCopy, type AlertOpsSilence } from './types';
type $$ComponentProps = {
    silences: AlertOpsSilence[];
    copy?: Partial<AlertOpsCopy>;
};
declare const SilenceTable: import("svelte").Component<$$ComponentProps, {}, "">;
type SilenceTable = ReturnType<typeof SilenceTable>;
export default SilenceTable;
