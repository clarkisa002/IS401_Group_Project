import type { MonthlySavingsRow } from "./types";

export interface OnTrackGoalInput {
  target: number;
  current: number;
  deadline: string;
}

/** Chart row: stable `chartKey` avoids Recharts merging bars when labels repeat. */
export type ProgressChartRow = MonthlySavingsRow & {
  chartKey: string;
  isProjected?: boolean;
};

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export function formatProgressChartMonthLabel(year: number, monthIndex: number): string {
  const labelMonth = MONTH_NAMES[monthIndex - 1] ?? `M${monthIndex}`;
  return `${labelMonth} '${String(year).slice(-2)}`;
}

export function chartKeyFromYearMonth(year: number, monthIndex: number): string {
  return `${year}-${String(monthIndex).padStart(2, "0")}`;
}

export function labelFromChartKey(chartKey: string): string {
  const [ys, ms] = chartKey.split("-");
  const y = Number(ys);
  const m = Number(ms);
  if (!Number.isFinite(y) || !Number.isFinite(m)) return chartKey;
  return formatProgressChartMonthLabel(y, m);
}

export function toProgressChartRow(
  r: MonthlySavingsRow,
  isProjected: boolean
): ProgressChartRow {
  return {
    ...r,
    month: formatProgressChartMonthLabel(r.year, r.monthIndex),
    chartKey: chartKeyFromYearMonth(r.year, r.monthIndex),
    isProjected,
  };
}

/** Normalize DB rows and (optionally) append up to N projected months after max(last data, today). */
export function buildProgressChartRows(
  monthly: MonthlySavingsRow[],
  deadline: string | null,
  options?: { now?: Date; maxProjectedMonths?: number }
): ProgressChartRow[] {
  const base = monthly.map((r) => toProgressChartRow(r, false));
  const rawDeadline = deadline?.trim();
  if (!rawDeadline || !parseDeadlineYearMonth(rawDeadline)) {
    return base;
  }
  return extendMonthlyRowsThroughDeadline(
    base,
    rawDeadline,
    options?.maxProjectedMonths ?? DEFAULT_MAX_PROJECTED_MONTHS,
    options
  );
}

/** Calendar month of goal deadline, or null if missing/invalid. */
export function parseDeadlineYearMonth(deadline: string): { year: number; month: number } | null {
  const raw = deadline?.trim();
  if (!raw) return null;

  const cal = raw.match(/^(\d{4})-(\d{2})(?:-\d{2})?/);
  if (cal) {
    const year = Number(cal[1]);
    const month = Number(cal[2]);
    if (year >= 1 && month >= 1 && month <= 12) {
      return { year, month };
    }
  }

  const iso = raw.length === 10 ? `${raw}T12:00:00` : raw;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

/** Inclusive count of calendar months from period month through deadline month. */
export function inclusiveMonthsRemaining(
  periodYear: number,
  periodMonth: number,
  deadlineYear: number,
  deadlineMonth: number
): number {
  return (deadlineYear - periodYear) * 12 + (deadlineMonth - periodMonth) + 1;
}

function ymOrder(y: number, m: number): number {
  return y * 12 + m;
}

function nextCalendarMonth(y: number, m: number): [number, number] {
  return m === 12 ? [y + 1, 1] : [y, m + 1];
}

const DEFAULT_MAX_PROJECTED_MONTHS = 2;

/**
 * Appends up to `maxProjectedMonths` future months, starting **after**
 * max(last data month, current calendar month), each month at most once,
 * and never past the goal deadline.
 */
export function extendMonthlyRowsThroughDeadline(
  rows: ProgressChartRow[],
  deadline: string,
  maxProjectedMonths: number = DEFAULT_MAX_PROJECTED_MONTHS,
  options?: { now?: Date }
): ProgressChartRow[] {
  const d = parseDeadlineYearMonth(deadline);
  if (!d || rows.length === 0) {
    return rows;
  }

  const cap = Math.max(0, Math.floor(maxProjectedMonths));
  const now = options?.now ?? new Date();
  const cy = now.getFullYear();
  const cm = now.getMonth() + 1;

  const last = rows[rows.length - 1];
  const out: ProgressChartRow[] = rows.map((r) => ({
    ...r,
    isProjected: false as const,
  }));

  if (ymOrder(last.year, last.monthIndex) >= ymOrder(d.year, d.month)) {
    return out;
  }

  let anchorY = last.year;
  let anchorM = last.monthIndex;
  if (ymOrder(cy, cm) > ymOrder(anchorY, anchorM)) {
    anchorY = cy;
    anchorM = cm;
  }

  let [y, m] = nextCalendarMonth(anchorY, anchorM);

  let added = 0;
  let guard = 0;
  while (added < cap && guard < 48) {
    guard += 1;
    if (ymOrder(y, m) > ymOrder(d.year, d.month)) break;

    const key = chartKeyFromYearMonth(y, m);
    if (out.some((r) => r.chartKey === key)) {
      [y, m] = nextCalendarMonth(y, m);
      continue;
    }

    out.push(
      toProgressChartRow({ month: "", amount: 0, year: y, monthIndex: m }, true)
    );
    added += 1;
    [y, m] = nextCalendarMonth(y, m);
  }

  return out;
}

/**
 * Green (on-track) bars — even split of what remains through the deadline.
 *
 * Every month: `planned = remaining / monthsLeft`.
 * For historical rows `savedSoFar` advances by the row's actual amount;
 * for projected rows `savedSoFar` stays put (no real savings yet).
 *
 * This guarantees every month with remaining > 0 and monthsLeft > 0 gets a
 * non-zero green bar — no carry-over formula that can compound to 0.
 *
 * Returns null when `deadline` cannot be parsed.
 */
export function computeOnTrackSeries(
  rows: ProgressChartRow[],
  goal: OnTrackGoalInput
): number[] | null {
  const deadline = parseDeadlineYearMonth(goal.deadline);
  if (!deadline) return null;

  const target = Math.max(0, goal.target);
  const sumHistorical = rows
    .filter((r) => !r.isProjected)
    .reduce((s, r) => s + r.amount, 0);
  let savedSoFar = Math.max(0, goal.current - sumHistorical);

  const out: number[] = [];

  for (const row of rows) {
    const remaining = Math.max(0, target - savedSoFar);
    const monthsLeft = inclusiveMonthsRemaining(
      row.year,
      row.monthIndex,
      deadline.year,
      deadline.month
    );

    let planned = 0;
    if (remaining > 0 && monthsLeft >= 1) {
      planned = remaining / monthsLeft;
    }
    if (!Number.isFinite(planned) || planned < 0) planned = 0;

    out.push(Math.round(planned));

    if (!row.isProjected) {
      savedSoFar += row.amount;
    }
  }

  return out;
}

/** Prefer the active goal with the soonest future deadline; else first goal. */
export function pickDefaultGoalId(goals: { id: string; deadline: string }[]): string | null {
  if (goals.length === 0) return null;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const tToday = startOfToday.getTime();

  let bestId: string | null = null;
  let bestT = Infinity;

  for (const g of goals) {
    const p = parseDeadlineYearMonth(g.deadline);
    if (!p) continue;
    const t = Date.UTC(p.year, p.month - 1, 1);
    if (t >= tToday && t < bestT) {
      bestT = t;
      bestId = g.id;
    }
  }

  if (bestId != null) return bestId;
  return goals[0].id;
}
