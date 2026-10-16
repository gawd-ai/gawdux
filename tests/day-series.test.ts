import { describe, expect, it } from "vitest";
import {
  buildUtcDaySeries,
  sampleSeriesTicks,
} from "../src/lib/utils/day-series";

describe("UTC reporting windows", () => {
  it("keeps labels and buckets on UTC through month boundaries and missing/duplicate rows", () => {
    const rows = buildUtcDaySeries({
      rows: [
        { day: "2026-10-31", count: 1 },
        { day: "2026-10-31", count: 7 },
      ],
      dayOf: (row) => row.day,
      days: 3,
      now: new Date("2026-10-31T23:30:00-04:00"),
      locale: "en-CA",
    });
    expect(rows.map((row) => [row.day, row.recorded?.count ?? 0])).toEqual([
      ["2026-10-30", 0],
      ["2026-10-31", 7],
      ["2026-11-01", 0],
    ]);
    expect(rows[2]).toMatchObject({
      chartLabel: "Nov 1",
      accessibleLabel: "Nov 1, 2026",
    });
  });
  it("preserves a caller-selected locale and source identity without mutating records", () => {
    const record = Object.freeze({ day: "2026-01-01", count: 0 });
    const [row] = buildUtcDaySeries({
      rows: [record],
      dayOf: (row) => row.day,
      days: 1,
      now: new Date("2026-01-01Z"),
      locale: "fr-CA",
    });
    expect(row?.recorded).toBe(record);
    expect(row?.chartLabel).toBe(
      new Intl.DateTimeFormat("fr-CA", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }).format(new Date("2026-01-01Z")),
    );
  });
  it("samples endpoints and handles short, empty, single and zero-tick windows", () => {
    expect(sampleSeriesTicks([0, 1, 2, 3, 4, 5, 6], 3)).toEqual([0, 3, 6]);
    expect(sampleSeriesTicks([0, 1], 5)).toEqual([0, 1]);
    expect(sampleSeriesTicks([0, 1], 1)).toEqual([1]);
    expect(sampleSeriesTicks([0, 1], 0)).toEqual([]);
    expect(sampleSeriesTicks([], 1)).toEqual([]);
    expect(buildUtcDaySeries({ rows: [], dayOf: String, days: 0 })).toEqual([]);
  });
  it("refuses invalid clocks and nonintegral window sizes rather than drifting buckets", () => {
    expect(() =>
      buildUtcDaySeries({ rows: [], dayOf: String, days: -1 }),
    ).toThrow(RangeError);
    expect(() =>
      buildUtcDaySeries({
        rows: [],
        dayOf: String,
        days: 1,
        now: new Date(NaN),
      }),
    ).toThrow(RangeError);
    expect(() => sampleSeriesTicks([1], 1.5)).toThrow(RangeError);
  });
});
