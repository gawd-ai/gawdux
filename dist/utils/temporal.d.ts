/**
 * Centralized date formatting.
 *
 * Two kinds of value, and the whole file exists to keep them apart:
 *
 *   A **calendar date** is a day — a due date, an issue date, an expiry. It
 *   has no time and no zone. It arrives as `yyyy-mm-dd` and is rendered as
 *   the day it says, in every zone on earth.
 *
 *   An **instant** is a moment — a record, an audit entry. It arrives as
 *   an ISO-8601 timestamp and is rendered in the reader's zone, named.
 *
 * Rendering a calendar date as an instant is the defect this file prevents:
 * it invents a midnight nobody recorded, and then the zone conversion moves
 * the day (`2026-09-04` reading as "Sep 3, 2026, 08:00 PM" in Montreal).
 * Every formatter below detects a calendar date and renders it as a date, so
 * a caller that reaches for the wrong one still cannot produce a false time.
 */
/** Read a calendar-day value without interpreting an instant as a date. */
export declare function calendarDateOf(value: string | Date | null | undefined): string | null;
/**
 * The one renderer for a day: "Sep 4, 2026", the same dialect the surfaces
 * already speak, with no time and no zone arithmetic. The parts are read
 * back at UTC so the rendered day is always the day that was stored.
 */
export declare function formatCalendarDate(value: string | Date | null | undefined): string;
/** True when the runtime knows this IANA zone name. */
export declare function isValidTimeZone(timeZone: string): boolean;
/**
 * The calendar day it currently is, in a given zone: `yyyy-mm-dd`.
 *
 * "Today" is a calendar concept and cannot be resolved without a zone.
 * `new Date().toISOString().slice(0, 10)` answers with UTC's day, which for a
 * site four hours west is tomorrow for the last four hours of every day, so a
 * record stamped in the evening carries tomorrow's date and a due date of
 * today reads as already past.
 */
export declare function todayInZone(timeZone: string, now?: Date): string;
/** Format a date value as yyyy-mm-dd (ISO 8601). Returns '' for falsy/invalid input. */
export declare function formatDate(value: string | Date | null | undefined): string;
/**
 * Recency-first display ("just now", "3h ago", "yesterday", then a short
 * date) — the Documents list dialect, shared so every list surface says
 * recency the same way. Pair with formatAbsoluteDateTime in a `title` so the
 * exact timestamp is always one hover away.
 */
export declare function formatRelativeDate(iso: string | null | undefined, nowMs?: number): string;
/** The full local timestamp — the hover companion of formatRelativeDate. */
export declare function formatAbsoluteDateTime(iso: string | null | undefined): string;
/**
 * One rendering for every audit / history timestamp: the viewer's local
 * date and time as ISO-style parts plus the short zone name, so a History
 * cell never mixes a UTC date with a local time (the pre-2026-09 defect) and
 * a reader always sees which zone a time is in. Storage stays UTC.
 */
export interface AuditDateTimeParts {
    /** yyyy-mm-dd in the display zone */
    date: string;
    /** HH:MM:SS, 24-hour, in the display zone */
    time: string;
    /** Short zone name as Intl renders it (EDT, EST, UTC, GMT+2) */
    zone: string;
}
export declare function formatAuditDateTime(iso: string | Date | null | undefined, opts?: {
    timeZone?: string;
}): AuditDateTimeParts;
/** `yyyy-mm-dd HH:MM:SS ZONE` — the single-line form of formatAuditDateTime. */
export declare function formatAuditDateTimeText(iso: string | Date | null | undefined, opts?: {
    timeZone?: string;
}): string;
