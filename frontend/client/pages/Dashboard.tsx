import { Layout } from "@/components/Layout";
import { useUserData } from "@/hooks/use-user-data";
import { Link } from "react-router-dom";
import {
  TrendingUp, 
  CreditCard, 
  Wallet, 
  ArrowUpRight, 
  Users, 
  Briefcase, 
  Info,
  ChevronRight,
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
  CartesianGrid,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip as UITooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data, resetToDemo, exportData } = useUserData();

  if (!data) return null;

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

  const readinessMetrics = [
    {
      title: "Credit Score Impact",
      value: data.creditScore,
      target: 850,
      percentage: (data.creditScore / 850) * 100,
      icon: CreditCard,
      color: "blue",
      description: "A higher credit score unlocks lower mortgage rates."
    },
    {
      title: "Savings Progress",
      value: `$${(data.savings.total / 1000).toFixed(1)}k`,
      target: `$${(data.savings.target / 1000).toFixed(0)}k`,
      percentage: (data.savings.total / data.savings.target) * 100,
      icon: Wallet,
      color: "emerald",
      description: "Targeting 20% down payment + closing costs."
    },
    {
      title: "DTI Ratio",
      value: `${data.debtToIncomeRatio}%`,
      target: "36%",
      percentage: Math.max(0, 100 - (data.debtToIncomeRatio / 36) * 100),
      icon: TrendingUp,
      color: "amber",
      description: "Debt-to-income ratio should ideally be below 36%."
    },
    {
      title: "Income Stability",
      value: `${data.incomeStability}%`,
      target: "100%",
      percentage: data.incomeStability,
      icon: Briefcase,
      color: "purple",
      description: "Lenders look for 2+ years of consistent employment."
    }
  ];

  return (
    <Layout>
      <div className="container py-8 space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Financial Readiness</h1>
            <p className="text-muted-foreground">Detailed breakdown of your path to home ownership.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={resetToDemo} className="gap-2">
              <RefreshCcw className="h-4 w-4" /> Reset Demo
            </Button>
            <Button variant="outline" size="sm" onClick={exportData} className="gap-2">
              <Download className="h-4 w-4" /> Export Report
            </Button>
            <Button size="sm" className="gap-2">
              <Users className="h-4 w-4" /> Compare with Peers
            </Button>
          </div>
        </header>

        {/* Hero Readiness Score (dominant) */}
        <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl md:text-3xl">Your Home Readiness Score</CardTitle>
            <CardDescription className="text-sm md:text-base">
              A single view of how prepared you are to buy.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="relative mb-10">
              <svg
                className="h-64 w-64 md:h-72 md:w-72 -rotate-90 transform"
                viewBox="0 0 192 192"
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
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-2">
                <span className={cn("text-5xl md:text-6xl font-black", getScoreColor(data.readinessScore))}>
                  {data.readinessScore}
                </span>
                <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-muted-foreground">
                  Readiness Points
                </span>
              </div>
            </div>

            <div className={cn("rounded-full px-6 py-2.5 text-sm md:text-base font-bold text-white shadow-lg", getScoreBg(data.readinessScore))}>
              {getScoreLabel(data.readinessScore)}
            </div>

            <div className="mt-10 w-full max-w-xl space-y-4 rounded-2xl bg-background/60 p-5 backdrop-blur-sm">
              <p className="text-sm md:text-base font-medium leading-relaxed text-center italic">
                "You're in a great position! Focusing on your debt-to-income ratio could boost your score by 15 points."
              </p>
              <Button asChild variant="ghost" className="w-full gap-2 text-primary" size="sm">
                <Link to="/goals">
                  View personalized tips <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Historical Trend - now secondary and smaller */}
        <div className="grid gap-6 pt-6 lg:grid-cols-3 items-start">
          <Card className="lg:col-span-2">
            <CardHeader>
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

          {/* Small summary card to sit next to the chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Snapshot</CardTitle>
              <CardDescription className="text-xs">
                Quick view of where you stand today.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs md:text-sm">
              <p>
                <span className="font-semibold">Readiness:</span>{" "}
                <span className={getScoreColor(data.readinessScore)}>{data.readinessScore}/100</span>
              </p>
              <p>
                <span className="font-semibold">Savings toward target:</span>{" "}
                {((data.savings.total / data.savings.target) * 100).toFixed(0)}%
              </p>
              <p>
                <span className="font-semibold">Debt-to-income ratio:</span>{" "}
                {data.debtToIncomeRatio}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Breakdown Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {readinessMetrics.map((metric, i) => (
            <Card key={i} className="group relative overflow-hidden transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className={cn(
                    "rounded-lg p-2 transition-colors",
                    metric.color === 'blue' ? "bg-blue-100 text-blue-600" :
                    metric.color === 'emerald' ? "bg-emerald-100 text-emerald-600" :
                    metric.color === 'amber' ? "bg-amber-100 text-amber-600" : "bg-purple-100 text-purple-600"
                  )}>
                    <metric.icon className="h-5 w-5" />
                  </div>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[200px]">
                      {metric.description}
                    </TooltipContent>
                  </UITooltip>
                </div>
                <CardTitle className="mt-4 text-sm font-medium">{metric.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{metric.value}</span>
                  <span className="text-xs text-muted-foreground">/ Target {metric.target}</span>
                </div>
                <div className="mt-4 space-y-2">
                  <Progress value={metric.percentage} className="h-2" />
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <span>Current</span>
                    <span>{metric.percentage.toFixed(0)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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

          <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white border-none shadow-lg shadow-orange-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
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
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="flex flex-col md:flex-row items-center justify-between p-8 gap-6 text-center md:text-left">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold italic font-serif">"The best time to plant a tree was 20 years ago. The second best time is now."</h3>
              <p className="text-primary-foreground/80">You've reached <span className="font-bold text-white">68%</span> of your goal. Keep up the momentum!</p>
            </div>
            <Button size="lg" variant="secondary" className="h-12 px-8 font-bold shadow-lg" asChild>
              <Link to="/progress">Track Current Progress <ArrowUpRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
