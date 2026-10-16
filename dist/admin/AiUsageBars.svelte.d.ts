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
    legendText?: string;
    /** Exact and axis presentation may differ without changing meter values. */
    formatValue?: (value: number) => string;
    formatAxisValue?: (value: number) => string;
    valueTitle?: (day: string, value: number) => string;
    nativeTitles?: boolean;
    /** Scoped presentation tokens, without another chart implementation. */
    style?: string;
};
declare const AiUsageBars: import("svelte").Component<$$ComponentProps, {}, "">;
type AiUsageBars = ReturnType<typeof AiUsageBars>;
export default AiUsageBars;
