/** Fill a bounded oldest-first reporting window; a later duplicate wins. */
export function buildUtcDaySeries({ rows, dayOf, days, now = new Date(), locale, }) {
    if (!Number.isInteger(days) || days < 0)
        throw new RangeError("days must be a non-negative integer");
    if (!Number.isFinite(now.getTime()))
        throw new RangeError("now must be a valid instant");
    const byDay = new Map(rows.map((row) => [dayOf(row), row]));
    const chart = new Intl.DateTimeFormat(locale, {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
    });
    const accessible = new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
    });
    return Array.from({ length: days }, (_, index) => {
        const date = new Date(now.getTime() - (days - 1 - index) * 86_400_000);
        const day = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
        return {
            day,
            chartLabel: chart.format(date),
            accessibleLabel: accessible.format(date),
            recorded: byDay.get(day),
        };
    });
}
/** Sample the complete range, retaining first and last when there is room. */
export function sampleSeriesTicks(rows, maximumTicks = 5) {
    if (!Number.isInteger(maximumTicks) || maximumTicks < 0)
        throw new RangeError("maximumTicks must be a non-negative integer");
    if (rows.length <= maximumTicks)
        return [...rows];
    if (maximumTicks <= 1)
        return rows.length > 0 ? (maximumTicks === 1 ? [rows.at(-1)] : []) : [];
    const lastIndex = rows.length - 1;
    return Array.from({ length: maximumTicks }, (_, index) => rows[Math.round((index * lastIndex) / (maximumTicks - 1))]);
}
