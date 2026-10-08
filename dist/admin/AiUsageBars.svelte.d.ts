type $$ComponentProps = {
    /** Every day of the window, oldest first (`day` is `YYYY-MM-DD`). */
    rows: Array<{
        day: string;
        value: number;
    }>;
    /** The plural unit, lower case, as a sentence reads it. */
    unit?: string;
    dayLabel?: (day: string) => string;
    dayTitle?: (day: string) => string;
    /** The chart's height in pixels, axes included. */
    height?: number;
    ariaLabel?: string;
};
declare const AiUsageBars: import("svelte").Component<$$ComponentProps, {}, "">;
type AiUsageBars = ReturnType<typeof AiUsageBars>;
export default AiUsageBars;
