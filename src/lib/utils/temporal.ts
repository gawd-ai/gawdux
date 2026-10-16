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

/** `yyyy-mm-dd` — a calendar date on the wire. */
const CALENDAR_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Read a calendar-day value without interpreting an instant as a date. */
export function calendarDateOf(
  value: string | Date | null | undefined,
): string | null {
  return typeof value === "string" && CALENDAR_DATE_RE.test(value)
    ? value
    : null;
}

const CALENDAR_DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

/**
 * The one renderer for a day: "Sep 4, 2026", the same dialect the surfaces
 * already speak, with no time and no zone arithmetic. The parts are read
 * back at UTC so the rendered day is always the day that was stored.
 */
export function formatCalendarDate(
  value: string | Date | null | undefined,
): string {
  const day = calendarDateOf(value);
  if (!day) return "";
  try {
    return CALENDAR_DATE_FORMATTER.format(new Date(`${day}T00:00:00Z`));
  } catch {
    return day;
  }
}

const DAY_FORMATTERS = new Map<string, Intl.DateTimeFormat>();

function dayFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = DAY_FORMATTERS.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone,
    });
    DAY_FORMATTERS.set(timeZone, formatter);
  }
  return formatter;
}

/** True when the runtime knows this IANA zone name. */
export function isValidTimeZone(timeZone: string): boolean {
  if (!timeZone) return false;
  try {
    dayFormatter(timeZone);
    return true;
  } catch {
    return false;
  }
}

/**
 * The calendar day it currently is, in a given zone: `yyyy-mm-dd`.
 *
 * "Today" is a calendar concept and cannot be resolved without a zone.
 * `new Date().toISOString().slice(0, 10)` answers with UTC's day, which for a
 * site four hours west is tomorrow for the last four hours of every day, so a
 * record stamped in the evening carries tomorrow's date and a due date of
 * today reads as already past.
 */
export function todayInZone(timeZone: string, now: Date = new Date()): string {
  const parts = dayFormatter(timeZone).formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Format a date value as yyyy-mm-dd (ISO 8601). Returns '' for falsy/invalid input. */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "";
  // A day stays the day it is: no Date is built from it, so no zone can move it.
  const day = calendarDateOf(value);
  if (day) return day;
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

// Constructing locale formatters is material in dense lists. These preserve
// the default-locale output of the corresponding Date locale methods while
// sharing the formatter setup across every rendered row.
const SHORT_MONTH_DAY_FORMATTER = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});
const ABSOLUTE_DATE_TIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
});

/**
 * Recency-first display ("just now", "3h ago", "yesterday", then a short
 * date) — the Documents list dialect, shared so every list surface says
 * recency the same way. Pair with formatAbsoluteDateTime in a `title` so the
 * exact timestamp is always one hover away.
 */
export function formatRelativeDate(
  iso: string | null | undefined,
  nowMs: number = Date.now(),
): string {
  if (!iso) return "";
  // A calendar date carries no moment, so "3h ago" would be invented. Say the day.
  if (calendarDateOf(iso)) return formatCalendarDate(iso);
  const date = new Date(iso);
  const then = date.getTime();
  if (Number.isNaN(then)) return "";
  const diffMin = Math.floor((nowMs - then) / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return "yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;
  try {
    return SHORT_MONTH_DAY_FORMATTER.format(date);
  } catch {
    return iso;
  }
}

/** The full local timestamp — the hover companion of formatRelativeDate. */
export function formatAbsoluteDateTime(iso: string | null | undefined): string {
  if (!iso) return "";
  if (calendarDateOf(iso)) return formatCalendarDate(iso);
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return date.toLocaleString();
  try {
    return ABSOLUTE_DATE_TIME_FORMATTER.format(date);
  } catch {
    return iso;
  }
}

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

const AUDIT_FORMATTERS = new Map<string, Intl.DateTimeFormat>();

function auditFormatter(timeZone: string | undefined): Intl.DateTimeFormat {
  const key = timeZone ?? "";
  let formatter = AUDIT_FORMATTERS.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
      timeZoneName: "short",
      ...(timeZone ? { timeZone } : {}),
    });
    AUDIT_FORMATTERS.set(key, formatter);
  }
  return formatter;
}

export function formatAuditDateTime(
  iso: string | Date | null | undefined,
  opts: { timeZone?: string } = {},
): AuditDateTimeParts {
  const empty: AuditDateTimeParts = { date: "", time: "", zone: "" };
  if (!iso) return empty;
  // A calendar date has no time and belongs to no zone: report only the day,
  // so an audit cell shows what was recorded rather than a converted midnight.
  const day = calendarDateOf(iso);
  if (day) return { date: day, time: "", zone: "" };
  const d = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(d.getTime())) return empty;
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = auditFormatter(opts.timeZone).formatToParts(d);
  } catch {
    return empty;
  }
  const get = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((p) => p.type === type)?.value ?? "";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${get("hour")}:${get("minute")}:${get("second")}`,
    zone: get("timeZoneName"),
  };
}

/** `yyyy-mm-dd HH:MM:SS ZONE` — the single-line form of formatAuditDateTime. */
export function formatAuditDateTimeText(
  iso: string | Date | null | undefined,
  opts: { timeZone?: string } = {},
): string {
  const { date, time, zone } = formatAuditDateTime(iso, opts);
  if (!date) return "";
  return `${date} ${time} ${zone}`.trim();
}
