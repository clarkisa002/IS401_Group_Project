import { Layout } from "@/components/Layout";
import { useUserData } from "@/hooks/use-user-data";
import { 
  Target, 
  Home, 
  Shield, 
  FileText, 
  Plus, 
  Zap, 
  TrendingUp, 
  Calendar,
  AlertCircle
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

export default function GoalsPage() {
  const { data } = useUserData();

  if (!data) return null;

  const allocationData = [
    { name: "Down Payment", value: data.savings.allocation.downPayment, color: "#3b82f6" },
    { name: "Emergency Fund", value: data.savings.allocation.emergencyFund, color: "#10b981" },
    { name: "Closing Costs", value: data.savings.allocation.closingCosts, color: "#f59e0b" },
  ];

  const getGoalIcon = (iconName: string) => {
    switch (iconName) {
      case 'Home': return Home;
      case 'Shield': return Shield;
      case 'FileText': return FileText;
      default: return Target;
    }
  };

  return (
    <Layout>
      <div className="container py-8 space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Home Ownership Goals</h1>
            <p className="text-muted-foreground">Define your targets and track your allocation.</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Set Up New Goal
          </Button>
        </header>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Goal Cards */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              {data.goals.map((goal) => {
                const Icon = getGoalIcon(goal.icon);
                const progress = (goal.current / goal.target) * 100;
                return (
                  <Card key={goal.id} className="relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
                      <Icon className="h-16 w-16" />
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
                        <Icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Target: {new Date(goal.deadline).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-bold">${goal.current.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground">of ${goal.target.toLocaleString()}</span>
                      </div>
                      <div className="space-y-2">
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          <span>{progress.toFixed(0)}% Complete</span>
                          <span>${(goal.target - goal.current).toLocaleString()} left</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              <button className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 p-8 transition-colors hover:border-primary/50 hover:bg-primary/5 group">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground mb-4">
                  <Plus className="h-6 w-6" />
                </div>
                <span className="font-bold text-muted-foreground group-hover:text-primary">Add New Goal</span>
              </button>
            </div>

            {/* Recommendations */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <CardTitle>Actionable Recommendations</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex gap-3 p-4 rounded-xl bg-background border shadow-sm">
                    <TrendingUp className="h-5 w-5 text-emerald-500 shrink-0 mt-1" />
                    <div className="space-y-1">
                      <p className="text-sm font-bold">Aggressive Savings Mode</p>
                      <p className="text-xs text-muted-foreground">By increasing your monthly savings by 15%, you'll hit your Down Payment goal 4 months earlier.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-4 rounded-xl bg-background border shadow-sm">
                    <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-1" />
                    <div className="space-y-1">
                      <p className="text-sm font-bold">Emergency Fund Re-balancing</p>
                      <p className="text-xs text-muted-foreground">Consider topping up your emergency fund. Lenders prefer seeing 6 months of reserves.</p>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full">Save As Fast As You Want</Button>
              </CardContent>
            </Card>
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
