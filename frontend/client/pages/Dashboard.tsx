import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useUserData } from "@/hooks/use-user-data";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Wallet,
  ArrowUpRight, 
  Users,
  Info,
  Download,
  RefreshCcw
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
import { cn } from "@/lib/utils";
import { useSessionQuote } from "@/hooks/use-session-quote";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { FinancialSnapshotForm } from "@/components/FinancialSnapshotForm";
import { Progress } from "@/components/ui/progress";
import { Tooltip as UITooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data, refreshData, exportData } = useUserData();
  const quote = useSessionQuote(data?.readinessScore ?? 0);
  const [snapshotDialogOpen, setSnapshotDialogOpen] = useState(false);

  if (!data) return null;

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

  const getScoreBg = (score: number) => {
    if (score >= 70) return "bg-emerald-500";
    if (score >= 40) return "bg-amber-500";
    return "bg-destructive";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 70) return "Making Good Progress";
    if (score >= 40) return "On Your Way";
    return "Getting Started";
  };

  const chartData = data.history.map(h => ({
    name: h.date,
    score: h.score,
  }));

  return (
    <Layout>
      <div className="container py-8 space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <div
                className={cn(
                  "rounded-full border bg-background/60 px-3 py-1.5 text-xs font-bold uppercase tracking-wider",
                  data.readinessScore >= 70
                    ? "border-emerald-500/20 text-emerald-600"
                    : data.readinessScore >= 40
                      ? "border-amber-500/20 text-amber-600"
                      : "border-destructive/20 text-destructive"
                )}
              >
                Readiness: {data.readinessScore}/100
              </div>
            </div>
            <p className="text-muted-foreground">
              A clean view of what matters now: your readiness score, trends, and next actions.
            </p>
          </div>
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
            <Button size="sm" className="gap-2">
              <Users className="h-4 w-4" /> Compare with Peers
            </Button>
          </div>
        </header>

        {/* Readiness Score (primary focal point) */}
        <Card className="overflow-hidden border border-primary/10 shadow-xl bg-gradient-to-br from-primary/8 via-primary/5 to-transparent">
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

                  <div className="mt-6 space-y-3">
                    <div
                      className={cn(
                        "rounded-full px-6 py-2.5 text-sm md:text-base font-bold text-white shadow-lg w-fit",
                        getScoreBg(data.readinessScore)
                      )}
                    >
                      {getScoreLabel(data.readinessScore)}
                    </div>
                    <Progress value={data.readinessScore} className="h-2" />
                  </div>
                </div>
              </div>
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
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      dy={8}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, strokeDasharray: '5 5' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
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
                {data.achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-2xl border text-center transition-all w-[140px]",
                      achievement.unlocked ? "bg-primary/5 border-primary/20" : "opacity-40 bg-muted grayscale"
                    )}
                  >
                    <div className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-full shadow-inner",
                      achievement.unlocked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-bold leading-tight">{achievement.title}</span>
                    {!achievement.unlocked && <span className="text-[10px] uppercase tracking-tighter font-bold">Locked</span>}
                  </div>
                ))}
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
                You've consistently saved for {data.streak} months.
                Keep it up to reach your goal by Dec 2025!
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action Section */}
        <Card className="bg-primary/5 border border-primary/20">
          <CardContent className="flex flex-col md:flex-row items-center justify-between p-8 gap-6 text-center md:text-left">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold italic font-serif text-foreground">
                "{quote}"
              </h3>
              <p className="text-muted-foreground">
                You've reached{" "}
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
          <FinancialSnapshotForm onSaved={() => setSnapshotDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
