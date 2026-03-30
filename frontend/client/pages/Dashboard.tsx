import { useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { UserDataPageShell, useRequiredUserData } from "@/components/UserDataPageShell";
import { useUserData } from "@/hooks/use-user-data";
import { Link } from "react-router-dom";
import type { Achievement } from "@/lib/types";
import {
  TrendingUp,
  Wallet,
  ArrowUpRight,
  Info,
  HelpCircle,
  Download,
  RefreshCcw,
  Target,
  Zap,
  PiggyBank,
  Receipt,
  Award,
  Shield,
  Flame,
  type LucideIcon,
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid
} from "recharts";
import { cn, chartTheme } from "@/lib/utils";
import { buildReadinessHistoryChartRows } from "@/lib/readiness-history-dates";
import { useSessionQuote } from "@/hooks/use-session-quote";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FinancialSnapshotForm } from "@/components/FinancialSnapshotForm";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { calculateReadinessScore, computeReadinessFactorScores } from "@/lib/supabase-data";
import {
  getReadinessRecommendationsBundle,
  READINESS_FACTOR_LABELS,
  userDataToReadinessInputs,
} from "@/lib/readiness-recommendations";

const BADGE_ICONS: Record<string, LucideIcon> = {
  Target,
  TrendingUp,
  Zap,
  PiggyBank,
  Wallet,
  Receipt,
  Award,
  Shield,
  Flame,
};

function DashboardContent() {
  const data = useRequiredUserData();
  const { refreshData, exportData } = useUserData();
  const quote = useSessionQuote(data.readinessScore);
  const [snapshotDialogOpen, setSnapshotDialogOpen] = useState(false);
  const [scoreExplainOpen, setScoreExplainOpen] = useState(false);
  const [badgeDetail, setBadgeDetail] = useState<Achievement | null>(null);

  const scoreExplain = useMemo(() => {
    const inputs = userDataToReadinessInputs(data);
    const factors = computeReadinessFactorScores(inputs);
    const calculated = calculateReadinessScore(inputs);
    const recBundle = getReadinessRecommendationsBundle(data, 3);
    return { factors, calculated, recBundle };
  }, [data]);

  const savingsProgress =
    data.savings.target > 0 ? (data.savings.total / data.savings.target) * 100 : 0;

  const nextGoalDeadline = data.goals
    .filter((g) => Boolean(g.deadline))
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0]?.deadline;

  const nextDeadlineText = nextGoalDeadline
    ? new Date(nextGoalDeadline).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
      })
    : null;

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-emerald-500";
    if (score >= 40) return "text-amber-500";
    return "text-destructive";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 70) return "Making Good Progress";
    if (score >= 40) return "On Your Way";
    return "Getting Started";
  };

  const chartData = useMemo(
    () => buildReadinessHistoryChartRows(data.history),
    [data.history]
  );
  const scoreHistoryTiltTicks = chartData.length > 5;
  const hasReadableScoreHistory = data.history.length >= 2;

  return (
    <>
      <div className="container py-8 space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <Button variant="outline" size="sm" onClick={() => setSnapshotDialogOpen(true)} className="gap-2">
              <Info className="h-4 w-4" /> Edit financial snapshot
            </Button>
            <Button variant="outline" size="sm" onClick={refreshData} className="gap-2">
              <RefreshCcw className="h-4 w-4" /> Refresh Data
            </Button>
            <Button variant="outline" size="sm" onClick={exportData} className="gap-2">
              <Download className="h-4 w-4" /> Export Report
            </Button>
          </div>
        </header>

        {/* Readiness Score (primary focal point) */}
        <Card className="surface-hero">
          <CardContent className="p-8 md:p-10">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-5">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1.5 text-xs font-bold uppercase tracking-wider">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        data.readinessScore >= 70
                          ? "bg-emerald-500"
                          : data.readinessScore >= 40
                            ? "bg-amber-500"
                            : "bg-destructive"
                      )}
                    />
                    Home Readiness
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Your Home Readiness Score</h2>
                  <p className="text-muted-foreground">Your single readiness number, driven by credit and savings.</p>
                </div>
              </div>

              <div className="lg:col-span-7 flex justify-center">
                <div className="flex flex-col items-center text-center">
                  <div className="relative w-[260px] h-[260px] md:w-[280px] md:h-[280px]">
                    <svg
                      viewBox="0 0 192 192"
                      preserveAspectRatio="xMidYMid meet"
                      className="absolute inset-0 h-full w-full -rotate-90"
                      role="img"
                      aria-label={`Readiness score ${data.readinessScore} out of 100`}
                      style={{ transformOrigin: "50% 50%" }}
                    >
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="12"
                        className="text-muted/20"
                      />
                      <motion.circle
                        initial={{ strokeDasharray: "0 553" }}
                        animate={{ strokeDasharray: `${(data.readinessScore / 100) * 553} 553` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        cx="96"
                        cy="96"
                        r="88"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="12"
                        strokeLinecap="round"
                        className={getScoreColor(data.readinessScore)}
                      />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className={cn("text-7xl md:text-8xl font-black", getScoreColor(data.readinessScore))}>
                        {data.readinessScore}
                      </span>
                      <span className="mt-1 text-xs md:text-sm font-bold uppercase tracking-widest text-muted-foreground">
                        / 100
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex w-full max-w-xs flex-col items-center gap-3">
                    <p
                      className={cn(
                        "text-center text-sm font-semibold md:text-base",
                        getScoreColor(data.readinessScore)
                      )}
                    >
                      {getScoreLabel(data.readinessScore)}
                    </p>
                    <Progress value={data.readinessScore} className="h-2 w-full" />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => setScoreExplainOpen(true)}
                    >
                      <HelpCircle className="h-4 w-4" aria-hidden />
                      Understand my score
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-primary/10 pt-8">
              <p className="text-center text-xl font-bold italic font-serif text-foreground md:text-2xl max-w-3xl mx-auto leading-snug">
                &ldquo;{quote}&rdquo;
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Historical Trend - now secondary and smaller */}
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          <Card className="lg:col-span-4 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Saving Progress</CardTitle>
              <CardDescription className="text-xs">
                How close you are to your savings target.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex h-[180px] md:h-[220px] flex-col justify-center space-y-3 text-xs md:text-sm">
              {data.savings.total <= 0 && data.savings.target > 0 ? (
                <div className="space-y-3">
                  <p className="text-muted-foreground leading-relaxed">
                    You haven&apos;t recorded savings toward your target yet. Update your snapshot with current
                    savings, or add contributions on Goals.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" size="sm" variant="secondary" onClick={() => setSnapshotDialogOpen(true)}>
                      Edit snapshot
                    </Button>
                    <Button type="button" size="sm" variant="outline" asChild>
                      <Link to="/goals">Add to goals</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p>
                    <span className="font-semibold text-emerald-600">Toward target:</span>{" "}
                    <span className="font-bold text-emerald-700">
                      {Math.max(0, Math.min(100, Math.round(savingsProgress)))}%
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold">Saved:</span>{" "}
                    <span className="font-medium">${data.savings.total.toLocaleString()}</span>
                  </p>
                  <p>
                    <span className="font-semibold">Target:</span>{" "}
                    <span className="font-medium">${data.savings.target.toLocaleString()}</span>
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-8 h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base md:text-lg">Score History</CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    Your progress over the last 6 months
                  </CardDescription>
                </div>
                <div className="hidden md:flex h-8 items-center gap-2 rounded-lg border bg-muted/50 px-3">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Ready Score</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[180px] w-full md:h-[220px]">
                {hasReadableScoreHistory ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.gridStroke} />
                      <XAxis
                        type="category"
                        dataKey="name"
                        interval={0}
                        tickFormatter={(v) => chartData[Number(v)]?.displayLabel ?? ""}
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: chartTheme.tickFill,
                          fontSize: scoreHistoryTiltTicks ? 9 : 11,
                        }}
                        dy={8}
                        angle={scoreHistoryTiltTicks ? -32 : 0}
                        textAnchor={scoreHistoryTiltTicks ? "end" : "middle"}
                        height={scoreHistoryTiltTicks ? 48 : 32}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: chartTheme.tickFill, fontSize: 11 }}
                        domain={[0, 100]}
                      />
                      <Tooltip
                        labelFormatter={(label) =>
                          chartData[Number(label)]?.displayLabel ?? String(label)
                        }
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, strokeDasharray: '5 5' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-4 rounded-lg border border-dashed bg-muted/20 px-4 text-center">
                    <p className="max-w-sm text-sm text-muted-foreground leading-relaxed">
                      Your score history needs at least two points in time to draw a trend. Update your financial
                      snapshot when your situation changes so we can log new scores.
                    </p>
                    <Button type="button" size="sm" className="gap-2" onClick={() => setSnapshotDialogOpen(true)}>
                      <Info className="h-4 w-4" aria-hidden />
                      Update financial snapshot
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gamification: Achievements & Streak */}
        <div className="grid gap-8 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Achievement Badges</CardTitle>
              <CardDescription>Milestones reached on your journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {data.achievements.map((achievement) => {
                  const Icon = BADGE_ICONS[achievement.icon] ?? TrendingUp;
                  return (
                    <button
                      key={achievement.id}
                      type="button"
                      onClick={() => setBadgeDetail(achievement)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-2xl border text-center transition-all w-[140px]",
                        "hover:ring-2 hover:ring-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        achievement.unlocked ? "bg-primary/5 border-primary/20" : "opacity-40 bg-muted grayscale"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-full shadow-inner",
                          achievement.unlocked
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        <Icon className="h-6 w-6" aria-hidden />
                      </div>
                      <span className="text-xs font-bold leading-tight">{achievement.title}</span>
                      {!achievement.unlocked && (
                        <span className="text-[10px] uppercase tracking-tighter font-bold">Locked</span>
                      )}
                      <span className="sr-only">View how to earn this badge</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-red-600/10 border border-orange-500/20 text-foreground shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                Saving Streak
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <div className="text-6xl font-black mb-2">{data.streak}</div>
              <div className="text-sm font-bold uppercase tracking-widest opacity-80">Months Strong</div>
              <p className="mt-6 text-sm leading-relaxed opacity-90">
                {data.streak > 0 ? (
                  <>
                    You&apos;ve consistently saved for {data.streak} months.
                    {nextDeadlineText
                      ? ` Keep it up to reach your next goal target by ${nextDeadlineText}.`
                      : " Add target dates on your goals to see when you might hit your savings targets."}
                  </>
                ) : (
                  <>
                    No streak yet — we count consecutive months with positive net savings on your Progress page.
                    Log monthly savings there to start a streak.
                  </>
                )}
              </p>
              {data.streak === 0 && (
                <Button type="button" variant="outline" size="sm" className="mt-4" asChild>
                  <Link to="/progress">Go to Progress</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Call to Action Section */}
        <Card className="surface-accent-soft">
          <CardContent className="flex flex-col md:flex-row items-center justify-between p-8 gap-6 text-center md:text-left">
            <div className="space-y-2">
              <p className="text-muted-foreground">
                You&apos;ve reached{" "}
                <span className="font-bold text-foreground">
                  {Math.max(0, Math.min(100, Math.round(savingsProgress)))}%
                </span>{" "}
                of your savings target. Keep up the momentum{nextDeadlineText ? ` until ${nextDeadlineText}` : ""}!
              </p>
            </div>
            <Button size="lg" variant="secondary" className="h-12 px-8 font-bold shadow-sm" asChild>
              <Link to="/goals">View Goals & Tips <ArrowUpRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={snapshotDialogOpen} onOpenChange={setSnapshotDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogTitle className="sr-only">Edit financial snapshot</DialogTitle>
          <DialogDescription className="sr-only">
            Update your credit score, income, debt, and savings snapshot.
          </DialogDescription>
          <FinancialSnapshotForm onSaved={() => setSnapshotDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={scoreExplainOpen} onOpenChange={setScoreExplainOpen}>
        <DialogContent className="max-h-[85vh] max-w-lg gap-4 overflow-y-auto">
            <>
              <DialogHeader>
                <DialogTitle>How your score is built</DialogTitle>
                <DialogDescription asChild>
                  <div className="space-y-3 text-left text-sm leading-relaxed text-muted-foreground">
                    <p>
                      Your Home Readiness Score is{" "}
                      <span className="font-semibold text-foreground">{data.readinessScore}</span> out of 100. We
                      combine six financial signals—each scored from 0–100—using fixed weights, then average them.
                      That mirrors how savings, credit, debt burden, and stability work together when you apply for
                      a mortgage.
                    </p>
                    {Math.abs(scoreExplain.calculated - data.readinessScore) > 1 ? (
                      <p>
                        Recalculated from your current snapshot:{" "}
                        <span className="font-medium text-foreground">{scoreExplain.calculated}</span>. If this
                        differs from the big number above, use <strong>Refresh Data</strong> or update your{" "}
                        <strong>financial snapshot</strong> so everything stays in sync.
                      </p>
                    ) : null}
                  </div>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Your factors
                </p>
                <ul className="space-y-3">
                  {scoreExplain.factors.map((f) => {
                    const pts = Math.round(f.score * f.weight);
                    return (
                      <li
                        key={f.id}
                        className="space-y-2 rounded-lg border border-border/80 bg-muted/30 p-3"
                      >
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="text-sm font-medium">{READINESS_FACTOR_LABELS[f.id]}</span>
                          <span className="text-xs text-muted-foreground">
                            {Math.round(f.weight * 100)}% weight · ~{pts} pts toward total
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={f.score} className="h-2 flex-1" />
                          <span
                            className={cn(
                              "w-10 text-right text-xs font-semibold tabular-nums",
                              getScoreColor(f.score)
                            )}
                          >
                            {Math.round(f.score)}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {scoreExplain.recBundle.recommendations.length > 0 ? (
                <div className="space-y-3 border-t border-border pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Strongest levers to improve
                  </p>
                  <p className="text-sm text-muted-foreground">
                    These areas are below a strong threshold relative to the rest of your profile. Small wins here
                    often move the overall score the most.
                  </p>
                  <ul className="space-y-4">
                    {scoreExplain.recBundle.recommendations.map((r) => (
                      <li
                        key={r.factorId}
                        className="space-y-2 rounded-lg bg-primary/5 p-3 text-sm dark:bg-primary/10"
                      >
                        <p className="font-semibold text-foreground">{r.title}</p>
                        <p className="text-muted-foreground leading-relaxed">{r.description}</p>
                        <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
                          {r.steps.slice(0, 3).map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="border-t border-border pt-4 text-sm text-muted-foreground leading-relaxed">
                  Every factor looks relatively strong right now. Keep logging income and expenses, update your
                  snapshot when your situation changes, and keep saving toward your targets to hold or raise your
                  score.
                </p>
              )}

              <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={() => setScoreExplainOpen(false)}>
                  Close
                </Button>
                <Button type="button" className="gap-1" asChild>
                  <Link to="/goals" onClick={() => setScoreExplainOpen(false)}>
                    Goals & more tips <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </Link>
                </Button>
              </DialogFooter>
            </>
        </DialogContent>
      </Dialog>

      <Dialog open={badgeDetail !== null} onOpenChange={(open) => !open && setBadgeDetail(null)}>
        <DialogContent className="sm:max-w-md">
          {badgeDetail && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
                      badgeDetail.unlocked
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {(() => {
                      const DetailIcon = BADGE_ICONS[badgeDetail.icon] ?? TrendingUp;
                      return <DetailIcon className="h-6 w-6" aria-hidden />;
                    })()}
                  </div>
                  <div>
                    <DialogTitle className="text-left">{badgeDetail.title}</DialogTitle>
                    <p className="text-sm text-muted-foreground text-left mt-1">{badgeDetail.description}</p>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-semibold text-foreground mb-1">How to earn</p>
                  <p className="text-muted-foreground leading-relaxed">{badgeDetail.howToEarn}</p>
                </div>
                {badgeDetail.unlocked && badgeDetail.earnedDetail ? (
                  <div className="rounded-lg border bg-emerald-500/5 border-emerald-500/20 p-3">
                    <p className="font-semibold text-emerald-800 dark:text-emerald-200 mb-1">Earned</p>
                    <p className="text-muted-foreground">{badgeDetail.earnedDetail}</p>
                  </div>
                ) : (
                  <div className="rounded-lg border bg-muted/50 p-3">
                    <p className="font-semibold mb-1">Not yet earned</p>
                    {badgeDetail.lockedHint ? (
                      <p className="text-muted-foreground">{badgeDetail.lockedHint}</p>
                    ) : (
                      <p className="text-muted-foreground">
                        Keep tracking data in the app — this badge unlocks when you meet the criteria above.
                      </p>
                    )}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setBadgeDetail(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function Dashboard() {
  return (
    <Layout>
      <UserDataPageShell>
        <DashboardContent />
      </UserDataPageShell>
    </Layout>
  );
}
