import { differenceInDays, startOfYear, subDays, subMonths } from "date-fns";
import { getCategoryColor } from "@/lib/expense-category-colors";
import type { ExpenseTransaction, IncomeTransaction } from "@/lib/types";

export type SpendingRange = "Last 30 Days" | "Last 3 Months" | "Year to Date";

export const SPENDING_RANGE_LABELS: SpendingRange[] = [
  "Last 30 Days",
  "Last 3 Months",
  "Year to Date",
];

export function isSpendingRange(value: string): value is SpendingRange {
  return SPENDING_RANGE_LABELS.includes(value as SpendingRange);
}

/** Inclusive ISO date bounds for filtering transactions. */
export function getDateRangeForSpending(range: SpendingRange, now = new Date()): {
  start: string;
  end: string;
} {
  const end = now.toISOString().slice(0, 10);
  if (range === "Last 30 Days") {
    return { start: subDays(now, 30).toISOString().slice(0, 10), end };
  }
  if (range === "Last 3 Months") {
    return { start: subMonths(now, 3).toISOString().slice(0, 10), end };
  }
  return { start: startOfYear(now).toISOString().slice(0, 10), end };
}

/**
 * Expected income for the selected window from annual salary (readiness profile).
 * Last 30 Days ≈ one month; Last 3 Months ≈ three months; YTD prorates by days elapsed in the calendar year.
 */
export function expectedIncomeForPeriod(
  annualIncome: number,
  range: SpendingRange,
  now = new Date()
): number {
  if (annualIncome <= 0) return 0;
  const monthly = annualIncome / 12;
  if (range === "Last 30 Days") return monthly;
  if (range === "Last 3 Months") return monthly * 3;
  const yStart = startOfYear(now);
  const daysElapsed = differenceInDays(now, yStart) + 1;
  const year = now.getFullYear();
  const daysInYear =
    (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365;
  return annualIncome * (daysElapsed / daysInYear);
}

export function aggregateExpensesForRange(
  transactions: ExpenseTransaction[],
  start: string,
  end: string
): { category: string; amount: number; color: string }[] {
  const byCategory: Record<string, number> = {};
  for (const e of transactions) {
    if (e.expense_date >= start && e.expense_date <= end) {
      const cat = e.category || "Other";
      byCategory[cat] = (byCategory[cat] ?? 0) + e.amount;
    }
  }
  return Object.entries(byCategory)
    .map(([category, amount]) => ({
      category,
      amount,
      color: getCategoryColor(category),
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function sumExpensesInRange(
  transactions: ExpenseTransaction[],
  start: string,
  end: string
): number {
  return transactions
    .filter((t) => t.expense_date >= start && t.expense_date <= end)
    .reduce((s, t) => s + t.amount, 0);
}

export function sumIncomeInRange(
  transactions: IncomeTransaction[],
  start: string,
  end: string
): number {
  return transactions
    .filter((t) => t.income_date >= start && t.income_date <= end)
    .reduce((s, t) => s + t.amount, 0);
}

export function rangeDescription(range: SpendingRange): string {
  if (range === "Last 30 Days") return "Last 30 days";
  if (range === "Last 3 Months") return "Last 3 months";
  return "Year to date";
}
