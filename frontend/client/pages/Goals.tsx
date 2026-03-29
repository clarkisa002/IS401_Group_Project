import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useUserData } from "@/hooks/use-user-data";
import { useSessionQuote } from "@/hooks/use-session-quote";
import { useAuth } from "@/hooks/use-auth";
import { 
  Target, 
  Home, 
  Shield, 
  FileText, 
  Plus, 
  TrendingUp, 
  Calendar,
  PiggyBank,
  Loader2,
  Trash2,
  ArrowUpRight,
  Wallet,
  Scale,
  Briefcase,
  CheckCircle2,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip,
  Legend
} from "recharts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/lib/supabase";
import { updateGoalProgress, recalculateAndSaveReadinessScore } from "@/lib/supabase-data";
import { getTopReadinessRecommendations, READINESS_FACTOR_LABELS } from "@/lib/readiness-recommendations";
import type { ReadinessFactorId } from "@/lib/supabase-data";
import { toast } from "sonner";

const RECOMMENDATION_ICONS: Record<ReadinessFactorId, LucideIcon> = {
  savingsProgress: TrendingUp,
  creditScore: Wallet,
  debtToIncome: Scale,
  incomeStability: Briefcase,
  emergencyFund: Shield,
  downPaymentPct: Home,
};

interface DbGoal {
  goal_id: string;
  goal_name: string;
  goal_type: string;
  target_amount: string;
  target_date: string | null;
  current_progress: string;
  is_active: boolean;
  created_at: string;
}

export default function GoalsPage() {
  const { data, invalidateUserData } = useUserData();
  const { user } = useAuth();
  const userId = user?.user_id;
  const quote = useSessionQuote(data?.readinessScore ?? 0);
  const [dbGoals, setDbGoals] = useState<DbGoal[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [goalName, setGoalName] = useState("");
  const [goalType, setGoalType] = useState("savings");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<DbGoal | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [goalToContribute, setGoalToContribute] = useState<DbGoal | null>(null);
  const [contributeAmount, setContributeAmount] = useState("");
  const [contributing, setContributing] = useState(false);

  const fetchGoals = useCallback(async () => {
    if (!userId) return;
    try {
      const { data: rows, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error && rows) {
        setDbGoals(rows as DbGoal[]);
      } else if (error) {
        console.error("Could not fetch goals:", error.message);
      }
    } catch (err) {
      console.error("Could not reach Supabase for goals:", err);
    }
  }, [userId]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleSubmit = async () => {
    if (!goalName.trim() || !targetAmount.trim() || !userId) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const { data: newGoal, error } = await supabase
        .from("goals")
        .insert({
          user_id: userId,
          goal_name: goalName.trim(),
          goal_type: goalType,
          target_amount: parseFloat(targetAmount),
          target_date: targetDate || null,
        })
        .select()
        .single();

      if (!error && newGoal) {
        setGoalName("");
        setGoalType("savings");
        setTargetAmount("");
        setTargetDate("");
        setDialogOpen(false);
        await recalculateAndSaveReadinessScore(userId);
        invalidateUserData();
        await fetchGoals();
      } else {
        setSubmitError(error?.message || "Could not create goal. Please try again.");
      }
    } catch (err) {
      console.error("Failed to create goal:", err);
      setSubmitError("Could not reach the server. Make sure Supabase is configured.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!goalToDelete || !userId) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("goals")
        .delete()
        .eq("goal_id", goalToDelete.goal_id)
        .eq("user_id", userId);

      if (!error) {
        setGoalToDelete(null);
        await recalculateAndSaveReadinessScore(userId);
        invalidateUserData();
        await fetchGoals();
      } else {
        console.error("Could not delete goal:", error.message);
      }
    } catch (err) {
      console.error("Could not reach Supabase for delete:", err);
    } finally {
      setDeleting(false);
    }
  };

  const handleContribute = async () => {
    if (!goalToContribute || !userId || !contributeAmount || parseFloat(contributeAmount) <= 0) return;
    setContributing(true);
    try {
      const current = parseFloat(goalToContribute.current_progress);
      const add = parseFloat(contributeAmount);
      await updateGoalProgress(userId, goalToContribute.goal_id, current + add);
      invalidateUserData();
      setGoalToContribute(null);
      setContributeAmount("");
      await fetchGoals();
      toast.success("Contribution added successfully");
    } catch (err) {
      console.error("Failed to update goal progress:", err);
    } finally {
      setContributing(false);
    }
  };

  const recommendations = useMemo(
    () => (data ? getTopReadinessRecommendations(data, 2) : []),
    [data]
  );

  if (!data) return null;

  const allocationData = [
    { name: "Down Payment", value: data.savings.allocation.downPayment, color: "#3b82f6" },
    { name: "Emergency Fund", value: data.savings.allocation.emergencyFund, color: "#10b981" },
    { name: "Closing Costs", value: data.savings.allocation.closingCosts, color: "#f59e0b" },
  ];

  const getGoalIcon = (goal: DbGoal) => {
    const name = goal.goal_name.toLowerCase();
    const type = goal.goal_type.toLowerCase();
    if (name.includes("down payment") || type.includes("down") || type === "home") return Home;
    if (name.includes("emergency") || type.includes("emergency") || type === "shield") return Shield;
    if (name.includes("closing") || type.includes("closing") || type === "filetext") return FileText;
    return Target;
  };

  return (
    <Layout>
      <div className="container py-8 space-y-8">
        {/* Quote Card - same as Dashboard */}
        <Card className="bg-primary/5 border border-primary/20">
          <CardContent className="flex flex-col md:flex-row items-center justify-between p-8 gap-6 text-center md:text-left">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold italic font-serif text-foreground">
                "{quote}"
              </h3>
              <p className="text-muted-foreground">
                Your readiness score: <span className="font-bold text-foreground">{data.readinessScore}/100</span>.
                Keep working toward your goals.
              </p>
            </div>
            <Button size="lg" variant="secondary" className="h-12 px-8 font-bold shadow-sm" asChild>
              <Link to="/dashboard">Back to Dashboard <ArrowUpRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </CardContent>
        </Card>

        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Home Ownership Goals</h1>
            <p className="text-muted-foreground">Define your targets and track your allocation.</p>
          </div>
          <Button className="gap-2" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" /> Set Up New Goal
          </Button>
        </header>

        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setSubmitError(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Goal</DialogTitle>
              <DialogDescription>
                Set a savings target to track your progress toward home ownership.
              </DialogDescription>
            </DialogHeader>
            {submitError && (
              <div role="alert" className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive font-medium">
                {submitError}
              </div>
            )}
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="goal-name">Goal Name</Label>
                <Input
                  id="goal-name"
                  placeholder="e.g. Down Payment"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-type">Goal Type</Label>
                <Input
                  id="goal-type"
                  placeholder="e.g. savings, debt, investment"
                  value={goalType}
                  onChange={(e) => setGoalType(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target-amount">Target Amount ($)</Label>
                <Input
                  id="target-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 60000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target-date">Target Date (optional)</Label>
                <Input
                  id="target-date"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={submitting || !goalName.trim() || !targetAmount.trim()}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
                Create Goal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!goalToContribute} onOpenChange={(open) => !open && (setGoalToContribute(null), setContributeAmount(""))}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Contribution</DialogTitle>
              <DialogDescription>
                Add to &quot;{goalToContribute?.goal_name}&quot; progress. Current: ${goalToContribute ? parseFloat(goalToContribute.current_progress).toLocaleString() : "0"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="contribute-amount">Amount to add ($)</Label>
                <Input
                  id="contribute-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="e.g. 500"
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => (setGoalToContribute(null), setContributeAmount(""))}>
                Cancel
              </Button>
              <Button
                onClick={handleContribute}
                disabled={contributing || !contributeAmount || parseFloat(contributeAmount) <= 0}
              >
                {contributing && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
                Add Contribution
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!goalToDelete} onOpenChange={(open) => !open && setGoalToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Goal</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{goalToDelete?.goal_name}&quot;? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Goal Cards — from database */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              {dbGoals.map((goal) => {
                const Icon = getGoalIcon(goal);
                const target = parseFloat(goal.target_amount);
                const current = parseFloat(goal.current_progress);
                const progress = target > 0 ? (current / target) * 100 : 0;
                return (
                  <Card key={goal.goal_id} className="relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
                      <Icon className="h-16 w-16" />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 z-10 h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => setGoalToDelete(goal)}
                      aria-label={`Delete ${goal.goal_name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <CardHeader className="pb-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
                        <Icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-lg">{goal.goal_name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {goal.target_date
                          ? `Target: ${new Date(goal.target_date).toLocaleDateString()}`
                          : "No deadline set"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-bold">${current.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground">of ${target.toLocaleString()}</span>
                      </div>
                      <div className="space-y-2">
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          <span>{progress.toFixed(0)}% Complete</span>
                          <span>${(target - current).toLocaleString()} left</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2"
                        onClick={() => {
                          setGoalToContribute(goal);
                          setContributeAmount("");
                        }}
                      >
                        <PiggyBank className="h-4 w-4" /> Add Contribution
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
              
              <button
                type="button"
                onClick={() => setDialogOpen(true)}
                className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 p-8 transition-colors hover:border-primary/50 hover:bg-primary/5 group"
                aria-label="Add new goal"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground mb-4">
                  <Plus className="h-6 w-6" />
                </div>
                <span className="font-bold text-muted-foreground group-hover:text-primary">Add New Goal</span>
              </button>
            </div>

            {/* Recommendations — layout distinct from old two-tile cards */}
            <section className="rounded-2xl border-2 border-dashed border-primary/25 bg-gradient-to-b from-primary/[0.07] via-background to-muted/20 p-1 shadow-inner">
              <div className="rounded-[0.9rem] border border-border/60 bg-card/80 backdrop-blur-sm">
                <div className="flex flex-col gap-1 border-b border-border/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/25">
                      <Sparkles className="h-5 w-5" aria-hidden />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold tracking-tight">Personalized next steps</h2>
                      <p className="text-sm text-muted-foreground">
                        Pulled from your weakest readiness factors (max 2). Overall score:{" "}
                        <span className="font-semibold text-foreground">{data.readinessScore}/100</span>
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="w-fit shrink-0 font-mono text-xs">
                    Live from your data
                  </Badge>
                </div>

                <div className="space-y-4 p-5">
                  {recommendations.length === 0 ? (
                    <div className="flex gap-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4">
                      <CheckCircle2 className="h-10 w-10 shrink-0 text-emerald-600" aria-hidden />
                      <div className="space-y-1">
                        <p className="font-semibold text-emerald-900 dark:text-emerald-100">
                          Nothing urgent to flag
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Your tracked factors are in decent shape right now. Update your financial snapshot on the
                          dashboard if anything changed—we&apos;ll refresh these tips automatically.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <ol className="space-y-4">
                      {recommendations.map((rec, index) => {
                        const Icon = RECOMMENDATION_ICONS[rec.factorId];
                        return (
                          <li
                            key={rec.factorId}
                            className="relative overflow-hidden rounded-xl border bg-background shadow-sm ring-1 ring-border/80"
                          >
                            <div className="absolute left-0 top-0 h-full w-1 bg-primary" aria-hidden />
                            <div className="pl-5 pr-4 py-4 sm:pl-6">
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex min-w-0 flex-1 gap-3">
                                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-black text-primary">
                                    {index + 1}
                                  </span>
                                  <div className="min-w-0 space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                        <Icon className="h-5 w-5 text-primary" aria-hidden />
                                      </div>
                                      <Badge variant="outline" className="text-[11px] font-normal">
                                        {READINESS_FACTOR_LABELS[rec.factorId]}
                                      </Badge>
                                      <span className="text-[11px] text-muted-foreground">
                                        ~{rec.weightPercent}% of readiness score
                                      </span>
                                    </div>
                                    <h3 className="text-base font-bold leading-tight">{rec.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{rec.description}</p>
                                    <div className="space-y-1">
                                      <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                        <span>Factor strength</span>
                                        <span className="tabular-nums text-foreground">{rec.factorScore}/100</span>
                                      </div>
                                      <Progress value={rec.factorScore} className="h-2" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-4 rounded-lg bg-muted/40 p-3 sm:ml-11">
                                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                  Try these steps
                                </p>
                                <ul className="space-y-2">
                                  {rec.steps.map((step, i) => (
                                    <li key={i} className="flex gap-2 text-sm leading-snug">
                                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary/10 text-[10px] font-bold text-primary">
                                        {i + 1}
                                      </span>
                                      <span>{step}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  )}
                  <Button className="w-full" variant="secondary" asChild>
                    <Link to="/dashboard">Open Dashboard &amp; snapshot</Link>
                  </Button>
                </div>
              </div>
            </section>
          </div>

          {/* Fund Allocation Chart */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Fund Allocation</CardTitle>
                <CardDescription>Current distribution of your total savings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {allocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => `$${value.toLocaleString()}`}
                      />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-6 space-y-4">
                  {allocationData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <span className="text-sm font-bold">${item.value.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="pt-4 border-t flex items-center justify-between">
                    <span className="text-sm font-bold">Total Allocation</span>
                    <span className="text-lg font-black text-primary">${data.savings.total.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary to-blue-700 text-primary-foreground">
              <CardHeader>
                <CardTitle>Timeline Projections</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <p className="text-xs opacity-80 font-bold uppercase tracking-widest">Optimistic Scenario</p>
                  <p className="text-xl font-bold">October 2025</p>
                  <p className="text-[10px] opacity-70 italic">Assumes +10% monthly income</p>
                </div>
                <div className="space-y-1 pt-4 border-t border-white/10">
                  <p className="text-xs opacity-80 font-bold uppercase tracking-widest">Standard Scenario</p>
                  <p className="text-xl font-bold">December 2025</p>
                  <p className="text-[10px] opacity-70 italic">Current savings rate maintained</p>
                </div>
                <Button variant="secondary" className="w-full mt-4 h-10 font-bold">Adjust Scenarios</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
