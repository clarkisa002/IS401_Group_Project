import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { UserDataPageShell, useRequiredUserData } from "@/components/UserDataPageShell";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { AddIncomeDialog } from "@/components/AddIncomeDialog";
import { ExpenseBreakdownDialog } from "@/components/ExpenseBreakdownDialog";
import {
  PieChart as LucidePieChart,
  ArrowDownCircle,
  TrendingDown,
  AlertCircle,
  ChevronRight,
  Filter,
  Lightbulb,
  DollarSign,
  Wallet,
  CreditCard,
  Target,
  type LucideIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  aggregateExpensesForRange,
  expectedIncomeForPeriod,
  filterExpenseTransactionsInRange,
  getDateRangeForSpending,
  isSpendingRange,
  rangeDescription,
  sumExpensesInRange,
  sumIncomeInRange,
  type SpendingRange,
} from "@/lib/spending-range";
import {
  buildBudgetRecommendations,
  type BudgetRecAction,
  type BudgetRecIcon,
} from "@/lib/spending-budget-recommendations";

const BUDGET_REC_ICONS: Record<BudgetRecIcon, LucideIcon> = {
  alert: AlertCircle,
  trending: TrendingDown,
  pie: LucidePieChart,
  wallet: Wallet,
  target: Target,
};

function SpendingBudgetRecActionButton({
  action,
  actionLabel,
  onOpenExpense,
  onOpenIncome,
  onOpenBreakdown,
}: {
  action: BudgetRecAction;
  actionLabel: string;
  onOpenExpense: () => void;
  onOpenIncome: () => void;
  onOpenBreakdown: () => void;
}) {
  if (action.kind === "none") {
    return null;
  }
  if (action.kind === "link") {
    return (
      <Button variant="link" className="h-auto p-0 text-xs font-bold text-primary" asChild>
        <Link to={action.href}>
          {actionLabel} <ChevronRight className="ml-1 h-3 w-3" aria-hidden />
        </Link>
      </Button>
    );
  }
  const onClick =
    action.kind === "openExpenseDialog"
      ? onOpenExpense
      : action.kind === "openIncomeDialog"
        ? onOpenIncome
        : onOpenBreakdown;
  return (
    <Button type="button" variant="link" className="h-auto p-0 text-xs font-bold text-primary" onClick={onClick}>
      {actionLabel} <ChevronRight className="ml-1 h-3 w-3" aria-hidden />
    </Button>
  );
}

function SpendingContent() {
  const data = useRequiredUserData();
  const [range, setRange] = useState<SpendingRange>("Last 30 Days");
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [breakdownDialogOpen, setBreakdownDialogOpen] = useState(false);

  const spendingView = useMemo(() => {
    const hasTx = data.expenseTransactions.length > 0;
    const bounds = getDateRangeForSpending(range);
    if (!hasTx) {
      const total = data.expenses.reduce((acc, c) => acc + c.amount, 0);
      return {
        hasTx: false as const,
        chartRows: data.expenses,
        totalExpenses: total,
        periodIncomeActual: sumIncomeInRange(
          data.incomeTransactions,
          bounds.start,
          bounds.end
        ),
        periodIncomeExpected: expectedIncomeForPeriod(data.income, range),
        rangeBounds: bounds,
      };
    }
    const chartRows = aggregateExpensesForRange(
      data.expenseTransactions,
      bounds.start,
      bounds.end
    );
    const totalExpenses = sumExpensesInRange(
      data.expenseTransactions,
      bounds.start,
      bounds.end
    );
    const periodIncomeActual = sumIncomeInRange(
      data.incomeTransactions,
      bounds.start,
      bounds.end
    );
    const periodIncomeExpected = expectedIncomeForPeriod(data.income, range);
    return {
      hasTx: true as const,
      chartRows,
      totalExpenses,
      periodIncomeActual,
      periodIncomeExpected,
      rangeBounds: bounds,
    };
  }, [data, range]);

  const transactionsInRange = useMemo(() => {
    if (!data.expenseTransactions.length) return [];
    const b = getDateRangeForSpending(range);
    return filterExpenseTransactionsInRange(data.expenseTransactions, b.start, b.end);
  }, [data.expenseTransactions, range]);

  const savingsOpportunities = useMemo(() => {
    if (!spendingView) return [];
    return [...spendingView.chartRows]
      .filter((r) => r.amount > 0)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3)
      .map((row) => ({
        title: `Review ${row.category}`,
        amount: row.amount,
      }));
  }, [spendingView]);

  const budgetRecommendations = useMemo(() => {
    if (!spendingView) return [];
    const net = spendingView.periodIncomeActual - spendingView.totalExpenses;
    return buildBudgetRecommendations({
      rangeLabel: rangeDescription(range),
      hasTx: spendingView.hasTx,
      chartRows: spendingView.chartRows,
      totalExpenses: spendingView.totalExpenses,
      periodIncomeActual: spendingView.periodIncomeActual,
      periodIncomeExpected: spendingView.periodIncomeExpected,
      netCashFlow: net,
      overspentVsExpected: spendingView.totalExpenses > spendingView.periodIncomeExpected,
      annualIncome: data.income,
      debt: data.debt,
      debtToIncomeRatio: data.debtToIncomeRatio,
      savingsTotal: data.savings.total,
      savingsTarget: data.savings.target,
      expenseTransactionCount: transactionsInRange.length,
    });
  }, [spendingView, range, data, transactionsInRange.length]);

  if (!spendingView) return null;

  const { chartRows, totalExpenses, periodIncomeActual, periodIncomeExpected, hasTx } =
    spendingView;
  const netCashFlow = periodIncomeActual - totalExpenses;
  const overspentVsExpected = totalExpenses > periodIncomeExpected;

  const netClass =
    netCashFlow >= 0
      ? "text-emerald-600"
      : netCashFlow >= -1000
        ? "text-amber-600"
        : "text-destructive";

  const topFixed = chartRows.slice(0, 3);
  const expenseTotalClass = overspentVsExpected ? "text-destructive" : "text-foreground";

  return (
    <>
      <div className="container py-8 space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Spending Habits Analysis</h1>
            <p className="text-muted-foreground">
              Understand where your money goes and find opportunities to save.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={() => setIncomeDialogOpen(true)} className="gap-2">
              <DollarSign className="h-4 w-4" /> Add Income
            </Button>
            <Button size="sm" onClick={() => setExpenseDialogOpen(true)} className="gap-2">
              <CreditCard className="h-4 w-4" /> Add Expense
            </Button>
            <Filter className="h-4 w-4 text-muted-foreground" aria-hidden />
            <Select
              value={range}
              onValueChange={(v) => {
                if (isSpendingRange(v)) setRange(v);
              }}
              disabled={!hasTx}
            >
              <SelectTrigger className="w-[180px]" aria-label="Time range for spending data">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Last 30 Days">Last 30 Days</SelectItem>
                <SelectItem value="Last 3 Months">Last 3 Months</SelectItem>
                <SelectItem value="Year to Date">Year to Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </header>
        {!hasTx && (
          <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Add itemized expenses to unlock time-range filters and more accurate charts. Until then, totals below
              use your latest category rollups.
            </p>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button type="button" size="sm" onClick={() => setExpenseDialogOpen(true)}>
                Add expense
              </Button>
              <Button type="button" size="sm" variant="outline" asChild>
                <Link to="/settings">Settings</Link>
              </Button>
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
              <CardDescription>
                {hasTx
                  ? `Spending by category — ${rangeDescription(range)}`
                  : "Distribution of spending by category"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-8 md:grid-cols-2">
                <div className="h-[300px] w-full">
                  {chartRows.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartRows}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="amount"
                          nameKey="category"
                        >
                          {chartRows.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: "12px",
                            border: "none",
                            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                          }}
                          formatter={(value: number) => `$${value.toLocaleString()}`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-4 px-4 text-center">
                      <p className="max-w-xs text-sm text-muted-foreground leading-relaxed">
                        {hasTx
                          ? "No spending in this date range. Try another range or add expenses that fall inside it."
                          : "No category amounts to show yet. Add expenses to build your spending picture."}
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        <Button type="button" size="sm" onClick={() => setExpenseDialogOpen(true)}>
                          Add expense
                        </Button>
                        {!hasTx && (
                          <Button type="button" size="sm" variant="outline" onClick={() => setIncomeDialogOpen(true)}>
                            Add income
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-center space-y-4">
                  {chartRows.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm font-medium">{item.category}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">${item.amount.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground font-bold">
                          {totalExpenses > 0
                            ? `${((item.amount / totalExpenses) * 100).toFixed(0)}%`
                            : "0%"}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t flex items-center justify-between">
                    <span className="text-sm font-bold">Total expenses</span>
                    <span className={cn("text-lg font-black", expenseTotalClass)}>
                      ${totalExpenses.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Income &amp; cash flow
              </CardTitle>
              <CardDescription>
                Expected income uses your annual salary from your profile ({rangeDescription(range)}
                ).
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center space-y-6 py-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Expected income</span>
                  <span className="font-semibold tabular-nums">
                    ${periodIncomeExpected.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Actual income</span>
                  <span className="font-semibold tabular-nums text-emerald-700">
                    ${periodIncomeActual.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Spending</span>
                  <span className="font-semibold tabular-nums text-foreground">
                    ${totalExpenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
              <div className="rounded-xl border bg-muted/40 p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Net cash flow
                </p>
                <p className={cn("text-2xl font-bold tabular-nums", netClass)}>
                  {netCashFlow >= 0 ? "+" : ""}
                  ${netCashFlow.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Actual income minus spending for this window.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowDownCircle className="h-5 w-5 text-muted-foreground" />
                Top categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topFixed.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg border bg-background/50"
                  >
                    <span className="text-sm font-medium">{item.category}</span>
                    <span className="text-sm font-bold tabular-nums text-foreground">
                      ${item.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
                {topFixed.length === 0 && (
                  <div className="space-y-3 rounded-lg border border-dashed bg-muted/20 p-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      No categories to rank for this range. Add expenses (or pick a wider range) to see your top
                      spending areas.
                    </p>
                    <Button type="button" size="sm" onClick={() => setExpenseDialogOpen(true)}>
                      Add expense
                    </Button>
                  </div>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-xs font-bold gap-1 text-muted-foreground"
                  disabled={!hasTx}
                  title={
                    hasTx
                      ? "Open a detailed list of each expense in this period"
                      : "Add expenses to see each entry by category and date"
                  }
                  onClick={() => setBreakdownDialogOpen(true)}
                  aria-label="Open full expense breakdown by category and date"
                >
                  View full breakdown <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
                <Lightbulb className="h-5 w-5 text-emerald-600" />
                Savings Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {savingsOpportunities.length === 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Add expenses to see which categories are largest in this range—those are often the best places
                      to trim.
                    </p>
                    <Button type="button" size="sm" variant="secondary" onClick={() => setExpenseDialogOpen(true)}>
                      Add expense
                    </Button>
                  </div>
                ) : (
                  savingsOpportunities.map((opp, i) => (
                    <div
                      key={`${opp.title}-${i}`}
                      className="flex items-center justify-between rounded-lg border border-emerald-100 bg-background p-3 dark:border-emerald-900/50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                          <LucidePieChart className="h-4 w-4" aria-hidden />
                        </span>
                        <span className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                          {opp.title}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-emerald-600">
                        ${opp.amount.toLocaleString()} spent
                      </span>
                    </div>
                  ))
                )}
                <Button type="button" variant="outline" className="h-10 w-full font-semibold" asChild>
                  <Link to="/goals">Review goals &amp; savings targets</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="surface-accent-soft">
          <CardHeader>
            <CardTitle>Budget recommendations</CardTitle>
            <CardDescription className="text-xs">
              Based on this time range, your logged transactions, and your financial snapshot—not generic ads.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-3">
            {budgetRecommendations.map((rec) => {
              const RecIcon = BUDGET_REC_ICONS[rec.icon];
              return (
                <div key={rec.id} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <RecIcon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <h4 className="text-sm font-bold leading-snug">{rec.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{rec.description}</p>
                  <SpendingBudgetRecActionButton
                    action={rec.action}
                    actionLabel={rec.actionLabel}
                    onOpenExpense={() => setExpenseDialogOpen(true)}
                    onOpenIncome={() => setIncomeDialogOpen(true)}
                    onOpenBreakdown={() => setBreakdownDialogOpen(true)}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <AddIncomeDialog open={incomeDialogOpen} onOpenChange={setIncomeDialogOpen} />
      <AddExpenseDialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen} />
      <ExpenseBreakdownDialog
        open={breakdownDialogOpen}
        onOpenChange={setBreakdownDialogOpen}
        chartRows={chartRows}
        transactionsInRange={transactionsInRange}
        rangeDescription={rangeDescription(range)}
      />
    </>
  );
}

export default function SpendingPage() {
  return (
    <Layout>
      <UserDataPageShell>
        <SpendingContent />
      </UserDataPageShell>
    </Layout>
  );
}
