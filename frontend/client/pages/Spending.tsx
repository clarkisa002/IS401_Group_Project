import { useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { useUserData } from "@/hooks/use-user-data";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { AddIncomeDialog } from "@/components/AddIncomeDialog";
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
  getDateRangeForSpending,
  isSpendingRange,
  rangeDescription,
  sumExpensesInRange,
  sumIncomeInRange,
  type SpendingRange,
} from "@/lib/spending-range";

export default function SpendingPage() {
  const { data } = useUserData();
  const [range, setRange] = useState<SpendingRange>("Last 30 Days");
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);

  const spendingView = useMemo(() => {
    if (!data) return null;
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

  if (!data || !spendingView) return null;

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

  const savingsOpportunities = [
    { title: "Reduce Dining Out", amount: 200, icon: "🍔" },
    { title: "Cancel Unused Subs", amount: 45, icon: "📺" },
    { title: "Switch Insurance", amount: 80, icon: "🛡️" },
  ];

  const topFixed = chartRows.slice(0, 3);
  const expenseTotalClass = overspentVsExpected ? "text-destructive" : "text-foreground";

  return (
    <Layout>
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
          <p className="text-sm text-muted-foreground rounded-lg border bg-muted/30 px-4 py-3">
            Add expenses to enable time-range filters. Showing your latest category totals below.
          </p>
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
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      No expenses in this period.
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
                  <p className="text-sm text-muted-foreground">No categories in this range.</p>
                )}
                <Button variant="ghost" className="w-full text-xs font-bold gap-1 text-muted-foreground">
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
                {savingsOpportunities.map((opp, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg border border-emerald-100 bg-background dark:border-emerald-900/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{opp.icon}</span>
                      <span className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                        {opp.title}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-emerald-600">
                      +${opp.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10">
                  Implement All Savings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Budget Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Optimize Utilities",
                desc: "Switching to smart thermostats could save you 10% on energy bills.",
                action: "View Energy Tips",
                icon: AlertCircle,
                color: "text-blue-500",
              },
              {
                title: "Refinance Student Loan",
                desc: "Current rates are 1.5% lower than yours. Potential monthly savings: $85.",
                action: "Check Eligibility",
                icon: TrendingDown,
                color: "text-emerald-500",
              },
              {
                title: "Subscription Audit",
                desc: "We found 2 overlapping streaming services you haven't used in 60 days.",
                action: "Audit Now",
                icon: LucidePieChart,
                color: "text-amber-500",
              },
            ].map((rec, i) => (
              <div key={i} className="space-y-3">
                <div className="flex items-center gap-2">
                  <rec.icon className={cn("h-4 w-4", rec.color)} />
                  <h4 className="text-sm font-bold">{rec.title}</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{rec.desc}</p>
                <Button variant="link" className="p-0 h-auto text-xs font-bold text-primary">
                  {rec.action} <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <AddIncomeDialog open={incomeDialogOpen} onOpenChange={setIncomeDialogOpen} />
      <AddExpenseDialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen} />
    </Layout>
  );
}
