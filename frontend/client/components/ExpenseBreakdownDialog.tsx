import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { ExpenseTransaction } from "@/lib/types";
import { getCategoryColor } from "@/lib/expense-category-colors";
import { CalendarDays } from "lucide-react";

export interface ChartRowLite {
  category: string;
  amount: number;
  color: string;
}

function formatExpenseDate(isoDate: string): string {
  const d = new Date(isoDate + "T12:00:00");
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function buildOrderedCategoryGroups(
  chartRows: ChartRowLite[],
  transactions: ExpenseTransaction[]
): { category: string; color: string; categoryTotal: number; entries: ExpenseTransaction[] }[] {
  const byCategory = new Map<string, ExpenseTransaction[]>();
  for (const t of transactions) {
    const cat = t.category || "Other";
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(t);
  }
  for (const arr of byCategory.values()) {
    arr.sort((a, b) => b.expense_date.localeCompare(a.expense_date));
  }

  const colorMap = new Map(chartRows.map((r) => [r.category, r.color]));
  const result: {
    category: string;
    color: string;
    categoryTotal: number;
    entries: ExpenseTransaction[];
  }[] = [];

  const seen = new Set<string>();
  for (const row of chartRows) {
    const entries = byCategory.get(row.category);
    if (!entries?.length) continue;
    seen.add(row.category);
    result.push({
      category: row.category,
      color: row.color,
      categoryTotal: row.amount,
      entries,
    });
  }

  const orphans = [...byCategory.keys()].filter((c) => !seen.has(c)).sort();
  for (const cat of orphans) {
    const entries = byCategory.get(cat)!;
    const sum = entries.reduce((s, e) => s + e.amount, 0);
    result.push({
      category: cat,
      color: colorMap.get(cat) ?? getCategoryColor(cat),
      categoryTotal: sum,
      entries,
    });
  }

  return result;
}

interface ExpenseBreakdownDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chartRows: ChartRowLite[];
  transactionsInRange: ExpenseTransaction[];
  rangeDescription: string;
}

export function ExpenseBreakdownDialog({
  open,
  onOpenChange,
  chartRows,
  transactionsInRange,
  rangeDescription,
}: ExpenseBreakdownDialogProps) {
  const groups = useMemo(
    () => buildOrderedCategoryGroups(chartRows, transactionsInRange),
    [chartRows, transactionsInRange]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="space-y-1 border-b px-6 py-4 text-left">
          <DialogTitle>Expense breakdown</DialogTitle>
          <DialogDescription>
            Every entry in this period ({rangeDescription}), grouped by category. Newest first within
            each category.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {groups.length === 0 ? (
            <p className="text-sm text-muted-foreground">No expenses in this period.</p>
          ) : (
            <div className="space-y-8">
              {groups.map((group, gi) => (
                <section key={group.category} aria-labelledby={`cat-${gi}`}>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: group.color }}
                        aria-hidden
                      />
                      <h3 id={`cat-${gi}`} className="truncate text-base font-semibold">
                        {group.category}
                      </h3>
                    </div>
                    <span className="shrink-0 text-sm font-semibold tabular-nums">
                      ${group.categoryTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <ul className="relative space-y-0 border-l-2 border-muted pl-4 ml-1.5">
                    {group.entries.map((e, ei) => (
                      <li
                        key={e.expense_id ?? `${group.category}-${e.expense_date}-${e.amount}-${ei}`}
                        className="relative pb-6 last:pb-0"
                      >
                        <span
                          className="absolute -left-[calc(0.25rem+5px)] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-muted-foreground/60"
                          aria-hidden
                        />
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden />
                            <time dateTime={e.expense_date}>{formatExpenseDate(e.expense_date)}</time>
                          </div>
                          <span className="text-sm font-semibold tabular-nums text-foreground sm:text-right">
                            ${e.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        {e.description ? (
                          <p className="mt-1 text-sm text-muted-foreground leading-snug pl-0 sm:pl-0">
                            {e.description}
                          </p>
                        ) : (
                          <p className="mt-1 text-xs italic text-muted-foreground">No description</p>
                        )}
                      </li>
                    ))}
                  </ul>

                  {gi < groups.length - 1 && <Separator className="mt-8" />}
                </section>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
