import type { AiUsageBreakdown, AiUsageDay, AiUsageTile, AiUsageTotals } from './types';
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
};
declare const AiUsageReport: import("svelte").Component<$$ComponentProps, {}, "">;
type AiUsageReport = ReturnType<typeof AiUsageReport>;
export default AiUsageReport;
