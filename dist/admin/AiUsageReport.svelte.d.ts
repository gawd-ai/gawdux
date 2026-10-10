import type { Snippet } from 'svelte';
import type { AiUsageBreakdown, AiUsageBreakdownRow, AiUsageDay, AiUsageTile, AiUsageTotals } from './types';
type $$ComponentProps = {
    totals: AiUsageTotals;
    /** Every day of the window, oldest first. */
    daily: AiUsageDay[];
    /** The window the report covers, in days. */
    days: number;
    breakdowns?: AiUsageBreakdown[];
    /** Tiles after Turns and Tokens (bots on, a limit). */
    tiles?: AiUsageTile[];
    /** The windows offered; none are offered without `onwindow`. */
    windows?: readonly number[];
    onwindow?: (days: number) => void;
    /** What the bars count. */
    metric?: 'turns' | 'tokens';
    /** What the product calls a token ("credits"), plural, lower case. */
    tokenUnit?: string;
    dayLabel?: (day: string) => string;
    dayTitle?: (day: string) => string;
    /** Shown in place of the bars when the window holds no activity. */
    emptyText?: string;
    /** Leave out a breakdown with no rows instead of saying it is empty. */
    hideEmptyBreakdowns?: boolean;
    /** Replaces the default totals strip; the host owns its presentation. */
    summary?: Snippet;
    /** Replaces the default per-day card without changing breakdown iteration. */
    activity?: Snippet;
    /** Renders beside the label; owns its own wrapper, title and disclosure. */
    rowValue?: Snippet<[AiUsageBreakdownRow]>;
    /** Spacing classes between the report's summary, activity and breakdowns. */
    contentClass?: string;
    /** Layout classes for the shared breakdown-card grid. */
    breakdownGridClass?: string;
    /** Spacing classes for the shared breakdown-row list. */
    breakdownRowsClass?: string;
};
declare const AiUsageReport: import("svelte").Component<$$ComponentProps, {}, "">;
type AiUsageReport = ReturnType<typeof AiUsageReport>;
export default AiUsageReport;
