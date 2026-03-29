import { describe, it, expect } from "vitest";
import {
  buildProgressChartRows,
  computeOnTrackSeries,
  extendMonthlyRowsThroughDeadline,
  inclusiveMonthsRemaining,
  parseDeadlineYearMonth,
  pickDefaultGoalId,
  toProgressChartRow,
  type ProgressChartRow,
} from "./progress-on-track";
import type { MonthlySavingsRow } from "./types";

function asProgressRows(rows: MonthlySavingsRow[]): ProgressChartRow[] {
  return rows.map((r) => toProgressChartRow(r, false));
}

describe("parseDeadlineYearMonth", () => {
  it("parses YYYY-MM-DD using calendar fields (not timezone-shifted)", () => {
    expect(parseDeadlineYearMonth("2025-12-31")).toEqual({ year: 2025, month: 12 });
    expect(parseDeadlineYearMonth("2025-06-15")).toEqual({ year: 2025, month: 6 });
  });

  it("parses YYYY-MM", () => {
    expect(parseDeadlineYearMonth("2026-03")).toEqual({ year: 2026, month: 3 });
  });

  it("returns null for empty string", () => {
    expect(parseDeadlineYearMonth("")).toBeNull();
    expect(parseDeadlineYearMonth("   ")).toBeNull();
  });
});

describe("inclusiveMonthsRemaining", () => {
  it("counts months inclusive of start and end", () => {
    expect(inclusiveMonthsRemaining(2025, 1, 2025, 12)).toBe(12);
    expect(inclusiveMonthsRemaining(2025, 6, 2025, 12)).toBe(7);
  });
});

describe("extendMonthlyRowsThroughDeadline", () => {
  it("appends two projected months after max(last data, today)", () => {
    const base = asProgressRows([
      { month: "May", amount: 1000, year: 2025, monthIndex: 5 },
      { month: "Jun", amount: 1100, year: 2025, monthIndex: 6 },
    ]);
    const extended = extendMonthlyRowsThroughDeadline(base, "2025-08-31", 2, {
      now: new Date(2025, 5, 15),
    });
    expect(extended.length).toBe(4);
    expect(extended[2]).toMatchObject({
      year: 2025,
      monthIndex: 7,
      amount: 0,
      isProjected: true,
    });
    expect(extended[2].month).toContain("Jul");
    expect(extended[3].monthIndex).toBe(8);
  });

  it("does not extend when last data month is on or after deadline", () => {
    const base = asProgressRows([{ month: "Dec", amount: 500, year: 2025, monthIndex: 12 }]);
    const extended = extendMonthlyRowsThroughDeadline(base, "2025-12-31");
    expect(extended.length).toBe(1);
    expect(extended[0].isProjected).toBe(false);
  });

  it("anchors from today when data lags so only two future months are added", () => {
    const base = asProgressRows([{ month: "Jun", amount: 1000, year: 2025, monthIndex: 6 }]);
    const extended = extendMonthlyRowsThroughDeadline(base, "2025-12-31", 2, {
      now: new Date(2025, 7, 1),
    });
    expect(extended.length).toBe(3);
    expect(extended.filter((r) => r.isProjected)).toHaveLength(2);
    expect(extended[1].monthIndex).toBe(9);
    expect(extended[2].monthIndex).toBe(10);
  });
});

describe("buildProgressChartRows", () => {
  it("returns rows with chartKey and formatted month labels", () => {
    const monthly: MonthlySavingsRow[] = [
      { month: "Jan", amount: 100, year: 2025, monthIndex: 1 },
    ];
    const rows = buildProgressChartRows(monthly, null);
    expect(rows[0].chartKey).toBe("2025-01");
    expect(rows[0].month).toBe("Jan '25");
  });
});

describe("computeOnTrackSeries", () => {
  it("returns null when deadline is missing", () => {
    expect(
      computeOnTrackSeries(
        [toProgressChartRow({ month: "Jan", amount: 0, year: 2025, monthIndex: 1 }, false)],
        { target: 60_000, current: 0, deadline: "" }
      )
    ).toBeNull();
  });

  it("even split: $60k goal over 12 months starts at $5000/mo", () => {
    const rows = [
      toProgressChartRow({ month: "Jan", amount: 5000, year: 2025, monthIndex: 1 }, false),
    ];
    const series = computeOnTrackSeries(rows, {
      target: 60_000,
      current: 5000,
      deadline: "2025-12-31",
    })!;
    expect(series[0]).toBe(5000);
  });

  it("saving more than planned lowers the next month's green bar", () => {
    const rows = [
      toProgressChartRow({ month: "Jan", amount: 5500, year: 2025, monthIndex: 1 }, false),
      toProgressChartRow({ month: "Feb", amount: 0, year: 2025, monthIndex: 2 }, false),
    ];
    const series = computeOnTrackSeries(rows, {
      target: 60_000,
      current: 5500,
      deadline: "2025-12-31",
    })!;
    expect(series[0]).toBe(5000);
    expect(series[1]).toBe(Math.round(54_500 / 11));
    expect(series[1]).toBeLessThan(series[0]);
  });

  it("saving less than planned raises the next month's green bar", () => {
    const rows = [
      toProgressChartRow({ month: "Jan", amount: 3000, year: 2025, monthIndex: 1 }, false),
      toProgressChartRow({ month: "Feb", amount: 0, year: 2025, monthIndex: 2 }, false),
    ];
    const series = computeOnTrackSeries(rows, {
      target: 60_000,
      current: 3000,
      deadline: "2025-12-31",
    })!;
    expect(series[0]).toBe(5000);
    expect(series[1]).toBe(Math.round(57_000 / 11));
    expect(series[1]).toBeGreaterThan(series[0]);
  });

  it("every historical month gets a non-zero green bar when remaining > 0", () => {
    const rows = [
      toProgressChartRow({ month: "Jan", amount: 1000, year: 2025, monthIndex: 1 }, false),
      toProgressChartRow({ month: "Feb", amount: 500, year: 2025, monthIndex: 2 }, false),
      toProgressChartRow({ month: "Mar", amount: 200, year: 2025, monthIndex: 3 }, false),
      toProgressChartRow({ month: "Apr", amount: 0, year: 2025, monthIndex: 4 }, false),
      toProgressChartRow({ month: "May", amount: 8000, year: 2025, monthIndex: 5 }, false),
      toProgressChartRow({ month: "Jun", amount: 100, year: 2025, monthIndex: 6 }, false),
    ];
    const series = computeOnTrackSeries(rows, {
      target: 60_000,
      current: 9800,
      deadline: "2025-12-31",
    })!;
    for (let i = 0; i < series.length; i++) {
      expect(series[i]).toBeGreaterThan(0);
    }
  });

  it("projected months show even split without advancing savedSoFar", () => {
    const rows = [
      toProgressChartRow({ month: "Nov", amount: 5000, year: 2025, monthIndex: 11 }, false),
      toProgressChartRow({ month: "Dec", amount: 0, year: 2025, monthIndex: 12 }, true),
    ];
    const series = computeOnTrackSeries(rows, {
      target: 60_000,
      current: 5000,
      deadline: "2025-12-31",
    })!;
    expect(series[0]).toBe(Math.round(60_000 / 2));
    expect(series[1]).toBe(55_000);
  });

  it("returns zeros when already at or past target", () => {
    const series = computeOnTrackSeries(
      [toProgressChartRow({ month: "Jan", amount: 0, year: 2025, monthIndex: 1 }, false)],
      { target: 10_000, current: 10_000, deadline: "2025-12-31" }
    );
    expect(series).toEqual([0]);
  });

  it("clamps savedSoFar start to 0 when current < sum of amounts", () => {
    const series = computeOnTrackSeries(
      [toProgressChartRow({ month: "Jan", amount: 4000, year: 2025, monthIndex: 1 }, false)],
      { target: 20_000, current: 1000, deadline: "2025-12-31" }
    )!;
    expect(series[0]).toBe(Math.round(20_000 / 12));
  });
});

describe("pickDefaultGoalId", () => {
  it("returns null for empty goals", () => {
    expect(pickDefaultGoalId([])).toBeNull();
  });

  it("picks soonest future deadline", () => {
    const goals = [
      { id: "later", deadline: "2030-01-01" },
      { id: "sooner", deadline: "2028-06-01" },
    ];
    expect(pickDefaultGoalId(goals)).toBe("sooner");
  });

  it("falls back to first goal when all deadlines are in the past", () => {
    const goals = [
      { id: "a", deadline: "2020-01-01" },
      { id: "b", deadline: "2019-06-01" },
    ];
    expect(pickDefaultGoalId(goals)).toBe("a");
  });
});
