/** Local calendar date as YYYY-MM-DD for chart keys and history[].date */
export function historyDateKeyFromRecordedAt(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) {
    const now = new Date();
    return formatYmd(now);
  }
  return formatYmd(d);
}

function formatYmd(d: Date): string {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Human-readable date for readiness history (charts, milestones).
 * Accepts YYYY-MM-DD (local calendar), legacy YYYY-MM (first day of month), or ISO timestamps.
 */
export function formatReadinessHistoryDateLabel(value: string): string {
  const ymd = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymd) {
    const d = new Date(
      parseInt(ymd[1], 10),
      parseInt(ymd[2], 10) - 1,
      parseInt(ymd[3], 10)
    );
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  const ym = value.match(/^(\d{4})-(\d{2})$/);
  if (ym) {
    const d = new Date(parseInt(ym[1], 10), parseInt(ym[2], 10) - 1, 1);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
