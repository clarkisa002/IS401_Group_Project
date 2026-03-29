/**
 * Data-driven budget tips for the Spending page (no fabricated loan/subscription claims).
 */

export type BudgetRecIcon = "alert" | "trending" | "pie" | "wallet" | "target";

export type BudgetRecAction =
  | { kind: "openExpenseDialog" }
  | { kind: "openIncomeDialog" }
  | { kind: "openBreakdownDialog" }
  | { kind: "link"; href: string }
  | { kind: "none" };

export interface BudgetRecommendation {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  action: BudgetRecAction;
  icon: BudgetRecIcon;
}

function fmt(n: number): string {
  return Math.round(n).toLocaleString();
}

const MAX_RECS = 3;

export interface BuildBudgetRecommendationsInput {
  rangeLabel: string;
  hasTx: boolean;
  chartRows: { category: string; amount: number }[];
  totalExpenses: number;
  periodIncomeActual: number;
  periodIncomeExpected: number;
  netCashFlow: number;
  overspentVsExpected: boolean;
  annualIncome: number;
  debt: number;
  /** Stored as decimal fraction (e.g. 0.35 = 35%) in app data */
  debtToIncomeRatio: number;
  savingsTotal: number;
  savingsTarget: number;
  expenseTransactionCount: number;
}

export function buildBudgetRecommendations(
  input: BuildBudgetRecommendationsInput
): BudgetRecommendation[] {
  const {
    rangeLabel,
    hasTx,
    chartRows,
    totalExpenses,
    periodIncomeActual,
    periodIncomeExpected,
    netCashFlow,
    overspentVsExpected,
    annualIncome,
    debt,
    debtToIncomeRatio,
    savingsTotal,
    savingsTarget,
    expenseTransactionCount,
  } = input;

  const out: BudgetRecommendation[] = [];

  const push = (rec: BudgetRecommendation) => {
    if (out.length >= MAX_RECS) return;
    if (out.some((r) => r.id === rec.id)) return;
    out.push(rec);
  };

  if (!hasTx) {
    push({
      id: "itemize-expenses",
      title: "Switch to itemized expenses",
      description:
        "Your chart is using rolled-up category totals from your profile, not dated transactions. Add individual expenses to unlock time ranges, cash-flow math, and tips tied to this period.",
      actionLabel: "Add expense",
      action: { kind: "openExpenseDialog" },
      icon: "pie",
    });
  }

  if (hasTx && totalExpenses <= 0 && expenseTransactionCount === 0) {
    push({
      id: "no-spend-in-range",
      title: "No spending in this window",
      description: `There are no expenses between your selected dates for ${rangeLabel}. Pick another range or add expenses that fall inside it.`,
      actionLabel: "Add expense",
      action: { kind: "openExpenseDialog" },
      icon: "wallet",
    });
  }

  if (periodIncomeExpected > 0 && overspentVsExpected) {
    const gap = totalExpenses - periodIncomeExpected;
    push({
      id: "over-expected-income",
      title: "Spending above profile income",
      description: `For ${rangeLabel}, spending ($${fmt(totalExpenses)}) is higher than expected income from your annual salary ($${fmt(periodIncomeExpected)}) by about $${fmt(gap)}. If your income changed, update it in Settings; otherwise focus cuts on your largest categories.`,
      actionLabel: "Update income",
      action: { kind: "link", href: "/settings" },
      icon: "alert",
    });
  }

  if (hasTx && periodIncomeActual > 0 && netCashFlow < -50) {
    push({
      id: "negative-net-actual",
      title: "Recorded income below spending",
      description: `Actual income logged for ${rangeLabel} ($${fmt(periodIncomeActual)}) is below spending ($${fmt(
        totalExpenses
      )}) by about $${fmt(Math.abs(netCashFlow))}. Add missing income entries or trim discretionary categories.`,
      actionLabel: "Add income",
      action: { kind: "openIncomeDialog" },
      icon: "trending",
    });
  }

  if (totalExpenses > 0 && chartRows.length > 0) {
    const top = [...chartRows].sort((a, b) => b.amount - a.amount)[0];
    const pct = Math.round((top.amount / totalExpenses) * 100);
    if (pct >= 22) {
      const shave = Math.round(top.amount * 0.1);
      push({
        id: "top-category",
        title: `${top.category} is ${pct}% of spending`,
        description: `About $${fmt(top.amount)} went to ${top.category} in ${rangeLabel}. Cutting that category by ~10% would free roughly $${fmt(
          shave
        )} for savings or debt—open the breakdown to see individual entries.`,
        actionLabel: "View breakdown",
        action: { kind: "openBreakdownDialog" },
        icon: "pie",
      });
    }
  }

  if (debt > 0 && out.length < MAX_RECS) {
    const dtiPct = Math.round(debtToIncomeRatio * 100);
    const dtiNote =
      Number.isFinite(dtiPct) && dtiPct > 0 && dtiPct <= 100
        ? ` Your snapshot’s debt-to-income context is about ${dtiPct}%.`
        : "";
    push({
      id: "debt-context",
      title: "Debt in your financial snapshot",
      description: `Your profile lists about $${fmt(debt)} in debt.${dtiNote} Extra dollars freed from spending can accelerate paydown; update the snapshot if balances changed.`,
      actionLabel: "Edit snapshot",
      action: { kind: "link", href: "/dashboard" },
      icon: "wallet",
    });
  }

  if (savingsTarget > 0 && savingsTotal < savingsTarget && out.length < MAX_RECS) {
    const pct = Math.round((savingsTotal / savingsTarget) * 100);
    const remaining = Math.max(0, savingsTarget - savingsTotal);
    push({
      id: "savings-goal",
      title: "Savings target progress",
      description: `You’ve saved about $${fmt(savingsTotal)} toward a $${fmt(savingsTarget)} target (${pct}% complete), with roughly $${fmt(
        remaining
      )} left. Aligning discretionary spend with that gap keeps your readiness score honest.`,
      actionLabel: "View goals",
      action: { kind: "link", href: "/goals" },
      icon: "target",
    });
  }

  if (hasTx && expenseTransactionCount > 0 && expenseTransactionCount < 6 && totalExpenses > 0 && out.length < MAX_RECS) {
    push({
      id: "more-granularity",
      title: "More entries, sharper insights",
      description: `Only ${expenseTransactionCount} expense line item${expenseTransactionCount === 1 ? "" : "s"} in ${rangeLabel}. Splitting big purchases by category makes the pie chart and these tips more accurate.`,
      actionLabel: "Add expense",
      action: { kind: "openExpenseDialog" },
      icon: "pie",
    });
  }

  if (out.length === 0) {
    if (annualIncome <= 0) {
      return [
        {
          id: "set-income",
          title: "Add your income",
          description:
            "Your profile doesn’t have annual income yet, so we can’t compare spending to expected earnings. Add it in Settings to unlock stronger guidance.",
          actionLabel: "Open Settings",
          action: { kind: "link", href: "/settings" },
          icon: "wallet",
        },
        {
          id: "log-spend",
          title: "Keep logging spending",
          description: `Track expenses for ${rangeLabel} so category trends stay current.`,
          actionLabel: "Add expense",
          action: { kind: "openExpenseDialog" },
          icon: "pie",
        },
      ];
    }
    return [
      {
        id: "balanced",
        title: "Spending looks in line",
        description: `For ${rangeLabel}, total spending is at or under expected income from your profile ($${fmt(
          periodIncomeExpected
        )}). Keep adding expenses so this view reflects reality.`,
        actionLabel: "Add expense",
        action: { kind: "openExpenseDialog" },
        icon: "pie",
      },
      {
        id: "goals-nudge",
        title: "Tie spending to goals",
        description:
          savingsTarget > 0
            ? `You’re ${Math.round((savingsTotal / Math.max(1, savingsTarget)) * 100)}% of the way to your savings target—Goals shows how contributions add up.`
            : "Create savings goals with deadlines so tradeoffs between spending today and buying a home stay visible.",
        actionLabel: "View goals",
        action: { kind: "link", href: "/goals" },
        icon: "target",
      },
    ];
  }

  return out.slice(0, MAX_RECS);
}
