type $$ComponentProps = {
    /** The words, read whole above the track ("2 of 5 signatures · Awaiting Quality"). */
    label: string;
    /** How many are done. */
    value?: number | null;
    /** How many in all. No track unless it is a number above zero. */
    total?: number | null;
    /** The track's accessible name ("Signatures"); the words when absent. */
    name?: string;
};
declare const PageCommandBarProgress: import("svelte").Component<$$ComponentProps, {}, "">;
type PageCommandBarProgress = ReturnType<typeof PageCommandBarProgress>;
export default PageCommandBarProgress;
