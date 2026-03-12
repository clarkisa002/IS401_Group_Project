import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useUserData } from "@/hooks/use-user-data";
import { 
  TrendingUp, 
  ArrowUpRight, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Info,
  ChevronRight,
  Target,
  PiggyBank
} from "lucide-react";
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Legend
} from "recharts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip as UITooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";

export default function ProgressPage() {
  const { data } = useUserData();

  if (!data) return null;

  const monthlyAverage = data.savings.monthly.reduce((acc, curr) => acc + curr.amount, 0) / data.savings.monthly.length;
  const targetRemaining = data.savings.target - data.savings.total;
  
  const milestones = [
    { title: "Started Journey", date: "Jan 2023", status: "completed" },
    { title: "First $10k Saved", date: "Mar 2023", status: "completed" },
    { title: "Halfway Point", date: "Oct 2023", status: "completed" },
    { title: "Down Payment Ready", date: "Jun 2024", status: "upcoming" },
    { title: "Closing Day", date: "Dec 2025", status: "upcoming" },
  ];

  return (
    <Layout>
      <div className="container py-8 space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Savings Progress</h1>
          <p className="text-muted-foreground">Tracking your monthly contributions and home cost trends.</p>
        </header>

        {/* Quick Stats */}
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
              <div className="text-2xl font-bold">${monthlyAverage.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              <p className="text-xs text-muted-foreground">Based on the last 6 months</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Target Remaining</CardTitle>
              <Target className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${targetRemaining.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Approximately {Math.ceil(targetRemaining / monthlyAverage)} months left</p>
            </CardContent>
          </Card>
        </div>

        {/* Savings History & Cost Trends */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Monthly Visualization</CardTitle>
                <CardDescription>Cash saved vs Market cost trends</CardDescription>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-sm bg-primary" />
                  <span>Savings</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full border-2 border-amber-500" />
                  <span>Avg Home Cost</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.savings.monthly}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis 
                    yAxisId="left"
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(value) => `$${value/1000}k`}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(value) => `$${value/1000}k`}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any, name: string) => [
                      `$${value.toLocaleString()}`, 
                      name === 'amount' ? 'Monthly Savings' : 'Avg Home Price'
                    ]}
                  />
                  <Bar 
                    yAxisId="left"
                    dataKey="amount" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]} 
                    barSize={40}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="costTrend" 
                    stroke="#f59e0b" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#f59e0b' }} 
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Timeline View */}
        <div className="grid gap-8 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Journey Timeline</CardTitle>
              <CardDescription>Key milestones on your way to ownership</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                {milestones.map((milestone, i) => (
                  <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      {milestone.status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-card shadow-sm transition-all hover:shadow-md">
                      <div className="flex items-center justify-between mb-1">
                        <time className="text-xs font-bold uppercase tracking-wider text-primary">{milestone.date}</time>
                        {milestone.status === 'completed' && (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase">Completed</span>
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
                  <span className="font-bold text-primary">{((data.savings.total / data.savings.target) * 100).toFixed(0)}%</span>
                </div>
                <Progress value={(data.savings.total / data.savings.target) * 100} className="h-2" />
              </div>

              <div className="rounded-xl bg-primary/5 p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Info className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold">Pro Tip</span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Increasing your monthly savings by just **$200** could shave **6 months** off your timeline.
                </p>
                <Button variant="link" className="p-0 h-auto text-xs font-bold" asChild>
                  <Link to="/dashboard">View your roadmap <ChevronRight className="h-3 w-3" /></Link>
                </Button>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold">Recent Activity</h4>
                <div className="space-y-3">
                  {[
                    { type: 'Deposit', amount: 2400, date: '2 days ago' },
                    { type: 'Interest', amount: 45, date: '1 week ago' },
                    { type: 'Deposit', amount: 2100, date: '1 month ago' },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="font-medium">{activity.type}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-foreground">+${activity.amount}</span>
                        <span className="text-muted-foreground">{activity.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
