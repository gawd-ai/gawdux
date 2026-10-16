/** One UTC bucket, with presentation labels and the original matching record. */
export interface UtcDaySeriesRow<T> {
    day: string;
    chartLabel: string;
    accessibleLabel: string;
    recorded: T | undefined;
}
export interface UtcDaySeriesOptions<T> {
    rows: readonly T[];
    dayOf: (row: T) => string;
    days: number;
    now?: Date;
    locale?: Intl.LocalesArgument;
}
/** Fill a bounded oldest-first reporting window; a later duplicate wins. */
export declare function buildUtcDaySeries<T>({ rows, dayOf, days, now, locale, }: UtcDaySeriesOptions<T>): UtcDaySeriesRow<T>[];
/** Sample the complete range, retaining first and last when there is room. */
export declare function sampleSeriesTicks<T>(rows: readonly T[], maximumTicks?: number): T[];
