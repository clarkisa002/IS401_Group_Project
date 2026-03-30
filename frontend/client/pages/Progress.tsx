import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Layout } from "@/components/Layout";
import { UserDataPageShell, useRequiredUserData } from "@/components/UserDataPageShell";
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  Info,
  ChevronRight,
  Target,
  PiggyBank,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { chartTheme } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  buildProgressChartRows,
  computeOnTrackSeries,
  labelFromChartKey,
  parseDeadlineYearMonth,
  pickDefaultGoalId,
  type ProgressChartRow,
} from "@/lib/progress-on-track";
import { formatReadinessHistoryDateLabel } from "@/lib/readiness-history-dates";

const ON_TRACK_BAR_COLOR = "#10b981";

type ChartRow = ProgressChartRow & { onTrackPlanned: number };

function ProgressContent() {
  const data = useRequiredUserData();

  const defaultGoalId = useMemo(() => pickDefaultGoalId(data.goals), [data.goals]);

  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  useEffect(() => {
    if (!data?.goals.length) {
      setSelectedGoalId(null);
      return;
    }
    setSelectedGoalId((prev) =>
      prev && data.goals.some((g) => g.id === prev) ? prev : defaultGoalId
    );
  }, [data, defaultGoalId]);

  const selectedGoal = useMemo(() => {
    if (!data?.goals.length) return null;
    return (
      data.goals.find((g) => g.id === selectedGoalId) ?? data.goals[0] ?? null
    );
  }, [data, selectedGoalId]);

  const progressRows: ProgressChartRow[] = useMemo(() => {
    if (!data) return [];
    return buildProgressChartRows(
      data.savings.monthly,
      selectedGoal && parseDeadlineYearMonth(selectedGoal.deadline)
        ? selectedGoal.deadline
        : null
    );
  }, [data, selectedGoal]);

  const onTrackSeries = useMemo(() => {
    if (!selectedGoal || !parseDeadlineYearMonth(selectedGoal.deadline)) return null;
    return computeOnTrackSeries(progressRows, {
      target: selectedGoal.target,
      current: selectedGoal.current,
      deadline: selectedGoal.deadline,
    });
  }, [progressRows, selectedGoal]);

  const hasDeadline = selectedGoal
    ? parseDeadlineYearMonth(selectedGoal.deadline) !== null
    : false;
  const showOnTrack = onTrackSeries !== null && hasDeadline;

  const monthlyStats = useMemo(() => {
    if (!data) {
      return { monthlyAverage: 0, targetRemaining: 0, monthCount: 0 };
    }
    const monthlyAverage =
      data.savings.monthly.reduce((acc, curr) => acc + curr.amount, 0) /
      Math.max(1, data.savings.monthly.length);
    return {
      monthlyAverage,
      targetRemaining: data.savings.target - data.savings.total,
      monthCount: data.savings.monthly.length,
    };
  }, [data]);

  const journeyMilestones = useMemo(() => {
    if (!data) return [];
    type M = { title: string; date: string; status: "completed" | "upcoming" };
    const out: M[] = [];
    if (data.history.length >= 1) {
      out.push({
        title: "Started tracking readiness",
        date: formatReadinessHistoryDateLabel(data.history[0].date),
        status: "completed",
      });
    }
    if (data.savings.target > 0) {
      const pct = (data.savings.total / data.savings.target) * 100;
      if (pct >= 50 && pct < 100) {
        const lastMo =
          data.savings.monthly.length > 0
            ? data.savings.monthly[data.savings.monthly.length - 1]
            : undefined;
        out.push({
          title: "Reached half your savings target",
          date: lastMo ? `${lastMo.month} ${lastMo.year}` : "—",
          status: "completed",
        });
      }
    }
    const goalDeadlines = [...data.goals]
      .filter((g) => g.deadline?.trim())
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    const now = new Date();
    for (const g of goalDeadlines) {
      const d = new Date(g.deadline);
      if (Number.isNaN(d.getTime())) continue;
      out.push({
        title: g.title,
        date: d.toLocaleDateString(undefined, { month: "short", year: "numeric" }),
        status: d < now ? "completed" : "upcoming",
      });
    }
    if (out.length === 0) {
      out.push({
        title: "Add goals with target dates to build your timeline",
        date: "—",
        status: "upcoming",
      });
    }
    return out;
  }, [data]);

  const recentActivity = useMemo(() => {
    if (!data) return [];
    type Row = { at: string; label: string; amount: number };
    const rows: Row[] = [];
    for (const t of data.incomeTransactions) {
      rows.push({
        at: t.income_date,
        label: (t.source && t.source.trim()) || "Income",
        amount: t.amount,
      });
    }
    for (const t of data.expenseTransactions) {
      rows.push({
        at: t.expense_date,
        label: t.category?.trim() || "Expense",
        amount: -t.amount,
      });
    }
    return rows
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 5)
      .map((r) => ({
        label: r.label,
        amount: r.amount,
        dateLabel: formatDistanceToNow(new Date(r.at), { addSuffix: true }),
      }));
  }, [data]);

  const proTipText = useMemo(() => {
    const { monthlyAverage, targetRemaining } = monthlyStats;
    if (targetRemaining <= 0 || monthlyAverage <= 0) {
      return "Add income, expenses, and goals with deadlines so we can estimate how extra savings affect your timeline.";
    }
    const bump = Math.max(50, Math.round(monthlyAverage * 0.08));
    const monthsAtPace = Math.ceil(targetRemaining / monthlyAverage);
    const monthsWithBump = Math.ceil(targetRemaining / (monthlyAverage + bump));
    const saved = Math.max(0, monthsAtPace - monthsWithBump);
    if (saved <= 0) {
      return "Keep logging monthly savings—when your pace stabilizes, we can estimate how small increases shorten your timeline.";
    }
    return `At your current pace, raising savings by about $${bump.toLocaleString()} per month could shorten your timeline by roughly ${saved} month${saved === 1 ? "" : "s"}.`;
  }, [monthlyStats]);

  const chartData: ChartRow[] = useMemo(() => {
    return progressRows.map((row, i) => ({
      ...row,
      onTrackPlanned: showOnTrack && onTrackSeries ? (onTrackSeries[i] ?? 0) : 0,
    }));
  }, [progressRows, onTrackSeries, showOnTrack]);

  const { monthlyAverage, targetRemaining, monthCount } = monthlyStats;

  return (
    <>
      <div className="container py-8 space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Savings Progress</h1>
          <p className="text-muted-foreground">
            Compare what you saved each month to the pace needed for your goal.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
              <PiggyBank className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${data.savings.total.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {((data.savings.total / data.savings.target) * 100).toFixed(1)}% of total goal reached
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Monthly Average</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${monthlyAverage.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <p className="text-xs text-muted-foreground">
                {monthCount > 0
                  ? `Across ${monthCount} month${monthCount === 1 ? "" : "s"} with savings data`
                  : "No monthly savings rows yet — log progress in Settings or your workflow when you add data."}
              </p>
              {monthCount === 0 && (
                <Button type="button" variant="link" className="mt-1 h-auto p-0 text-xs" asChild>
                  <Link to="/settings">Open Settings to add income &amp; expenses</Link>
                </Button>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Target Remaining</CardTitle>
              <Target className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${targetRemaining.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Approximately {Math.ceil(targetRemaining / Math.max(1, monthlyAverage))} months left
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Monthly savings vs on-track pace</CardTitle>
                <CardDescription>
                  Blue bars are your actual savings each month. Green bars show how much you
                  need to save that month to stay on track — whatever is left gets split evenly
                  across the remaining months, so saving more one month lowers the next.
                </CardDescription>
              </div>
              <div className="w-full sm:w-64 shrink-0 space-y-2 rounded-lg border bg-muted/30 p-3">
                <label htmlFor="progress-goal" className="text-xs font-medium text-muted-foreground">
                  Goal for pace
                </label>
                {data.goals.length > 0 ? (
                  <Select
                    value={selectedGoalId ?? defaultGoalId ?? data.goals[0]?.id ?? ""}
                    onValueChange={setSelectedGoalId}
                  >
                    <SelectTrigger id="progress-goal" className="h-9 bg-background">
                      <SelectValue placeholder="Select a goal" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.goals.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm leading-snug text-muted-foreground">
                      Go to Goals to track your current savings with your goals.
                    </p>
                    <Button size="sm" className="w-full" asChild>
                      <Link to="/goals">
                        Go to Goals
                        <ChevronRight className="ml-1 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
            {selectedGoal && !hasDeadline && (
              <p className="text-sm text-amber-700 dark:text-amber-500">
                Add a target date to &quot;{selectedGoal.title}&quot; to see green on-track bars.
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm bg-primary" />
                <span>Actual savings</span>
              </div>
              {showOnTrack && (
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: ON_TRACK_BAR_COLOR }} />
                  <span>On-track pace</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.gridStroke} />
                  <XAxis
                    dataKey="chartKey"
                    tickFormatter={labelFromChartKey}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: chartTheme.tickFill, fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: chartTheme.tickFill, fontSize: 12 }}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: number, name: string) => {
                      const label =
                        name === "Actual savings"
                          ? "Actual savings"
                          : name === "On-track pace"
                            ? "On-track pace"
                            : name;
                      return [`$${value.toLocaleString()}`, label];
                    }}
                  />
                  <Bar
                    name="Actual savings"
                    dataKey="amount"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                    barSize={showOnTrack ? 28 : 40}
                  />
                  {showOnTrack && (
                    <Bar
                      name="On-track pace"
                      dataKey="onTrackPlanned"
                      fill={ON_TRACK_BAR_COLOR}
                      radius={[4, 4, 0, 0]}
                      barSize={28}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-8 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Journey Timeline</CardTitle>
              <CardDescription>Key milestones on your way to ownership</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                {journeyMilestones.map((milestone, i) => (
                  <div
                    key={i}
                    className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white bg-white shadow md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      {milestone.status === "completed" ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                    <div className="w-[calc(100%-4rem)] rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md md:w-[calc(50%-2.5rem)]">
                      <div className="mb-1 flex items-center justify-between">
                        {milestone.date && milestone.date !== "—" ? (
                          <time className="text-xs font-bold uppercase tracking-wider text-primary">
                            {milestone.date}
                          </time>
                        ) : (
                          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            —
                          </span>
                        )}
                        {milestone.status === "completed" && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                            Completed
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold">{milestone.title}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Quick Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress to Target</span>
                  <span className="font-bold text-primary">
                    {((data.savings.total / data.savings.target) * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress value={(data.savings.total / data.savings.target) * 100} className="h-2" />
              </div>

              <div className="space-y-4 rounded-xl bg-primary/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Info className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold">Pro Tip</span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">{proTipText}</p>
                <Button variant="link" className="h-auto p-0 text-xs font-bold" asChild>
                  <Link to="/goals">
                    View your roadmap <ChevronRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold">Recent Activity</h4>
                {recentActivity.length === 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      No recent income or expenses yet. Add entries on Spending or Settings to see them here.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" size="sm" variant="secondary" asChild>
                        <Link to="/spending">Spending</Link>
                      </Button>
                      <Button type="button" size="sm" variant="outline" asChild>
                        <Link to="/settings">Settings</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.map((activity, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex min-w-0 items-center gap-2">
                          <div
                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${activity.amount >= 0 ? "bg-emerald-500" : "bg-rose-500"}`}
                          />
                          <span className="truncate font-medium">{activity.label}</span>
                        </div>
                        <div className="flex shrink-0 items-center gap-3 pl-2">
                          <span
                            className={`font-bold tabular-nums ${activity.amount >= 0 ? "text-foreground" : "text-destructive"}`}
                          >
                            {activity.amount >= 0 ? "+" : ""}${Math.abs(activity.amount).toLocaleString()}
                          </span>
                          <span className="text-muted-foreground">{activity.dateLabel}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

export default function ProgressPage() {
  return (
    <Layout>
      <UserDataPageShell>
        <ProgressContent />
      </UserDataPageShell>
    </Layout>
  );
}
