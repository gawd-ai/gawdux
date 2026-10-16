import { describe, expect, it } from "vitest";
import {
  calendarDateOf,
  formatCalendarDate,
  formatDate,
  todayInZone,
  isValidTimeZone,
  formatAuditDateTime,
  formatAuditDateTimeText,
  formatRelativeDate,
  formatAbsoluteDateTime,
} from "../src/lib/utils/temporal";

describe("calendar days and instants", () => {
  it("never interprets midnight instants as calendar days", () => {
    expect(calendarDateOf("2026-09-04")).toBe("2026-09-04");
    expect(calendarDateOf("2026-09-04T00:00:00.000Z")).toBeNull();
    expect(calendarDateOf(new Date("2026-09-04T00:00:00.000Z"))).toBeNull();
    expect(
      formatAuditDateTime("2026-09-04T00:00:00.000Z", {
        timeZone: "America/Toronto",
      }),
    ).toEqual({ date: "2026-09-03", time: "20:00:00", zone: "EDT" });
  });
  it("never invents a time or shifts a recorded calendar day", () => {
    expect(formatCalendarDate("2026-09-04")).toBe(
      new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }).format(new Date("2026-09-04Z")),
    );
    expect(formatDate("2026-09-04")).toBe("2026-09-04");
    expect(
      formatAuditDateTime("2026-09-04", { timeZone: "Pacific/Honolulu" }),
    ).toEqual({ date: "2026-09-04", time: "", zone: "" });
  });
  it("derives a site day explicitly and retains DST-aware zones", () => {
    const now = new Date("2026-01-01T01:00:00Z");
    expect(todayInZone("America/Toronto", now)).toBe("2025-12-31");
    expect(todayInZone("Pacific/Auckland", now)).toBe("2026-01-01");
    expect(isValidTimeZone("America/Toronto")).toBe(true);
    expect(isValidTimeZone("Not/AZone")).toBe(false);
    expect(
      formatAuditDateTimeText("2026-01-15T03:10:00Z", {
        timeZone: "America/Toronto",
      }),
    ).toBe("2026-01-14 22:10:00 EST");
  });
  it("retains local locale formatting and an injected relative clock", () => {
    const iso = "2026-07-11T05:24:38Z";
    expect(formatAbsoluteDateTime(iso)).toBe(new Date(iso).toLocaleString());
    expect(formatRelativeDate(iso, Date.parse("2026-07-11T05:27:38Z"))).toBe(
      "3m ago",
    );
    expect(formatRelativeDate(iso, Date.parse("2026-07-12T05:24:38Z"))).toBe(
      "yesterday",
    );
    expect(formatRelativeDate("broken")).toBe("");
    expect(formatAuditDateTimeText("broken")).toBe("");
  });
});
