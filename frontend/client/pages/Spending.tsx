import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useUserData } from "@/hooks/use-user-data";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { 
  PieChart as LucidePieChart, 
  ArrowDownCircle, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight,
  Filter,
  Lightbulb,
  CreditCard
} from "lucide-react";
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function SpendingPage() {
  const { data } = useUserData();
  const [range, setRange] = useState("Last 30 Days");
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);

  if (!data) return null;

  const totalMonthlyExpenses = data.expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const debtStatus = data.debt > 20000 ? "Red" : data.debt > 5000 ? "Yellow" : "Green";

  const savingsOpportunities = [
    { title: "Reduce Dining Out", amount: 200, icon: "🍔" },
    { title: "Cancel Unused Subs", amount: 45, icon: "📺" },
    { title: "Switch Insurance", amount: 80, icon: "🛡️" },
  ];

  return (
    <Layout>
      <div className="container py-8 space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Spending Habits Analysis</h1>
            <p className="text-muted-foreground">Understand where your money goes and find opportunities to save.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setExpenseDialogOpen(true)} className="gap-2">
              <CreditCard className="h-4 w-4" /> Add Expense
            </Button>
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={range} onValueChange={setRange}>
              <SelectTrigger className="w-[180px]">
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

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Spending Breakdown Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
              <CardDescription>Monthly distribution of spending</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-8 md:grid-cols-2">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.expenses}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="amount"
                        nameKey="category"
                      >
                        {data.expenses.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => `$${value.toLocaleString()}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col justify-center space-y-4">
                  {data.expenses.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm font-medium">{item.category}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">${item.amount.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground font-bold">{((item.amount / totalMonthlyExpenses) * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t flex items-center justify-between">
                    <span className="text-sm font-bold">Total Expenses</span>
                    <span className="text-lg font-black text-destructive">${totalMonthlyExpenses.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Debt Indicator */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Debt Health Indicator</CardTitle>
              <CardDescription>Your current debt-to-income balance</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center py-6">
              <div className="relative mb-6">
                <div className={cn(
                  "h-32 w-32 rounded-full border-[12px] flex items-center justify-center transition-colors",
                  debtStatus === 'Green' ? "border-emerald-500/20 text-emerald-500" :
                  debtStatus === 'Yellow' ? "border-amber-500/20 text-amber-500" :
                  "border-destructive/20 text-destructive"
                )}>
                  <div className={cn(
                    "h-20 w-20 rounded-full flex items-center justify-center bg-current opacity-10 absolute"
                  )} />
                  <CreditCard className="h-12 w-12" />
                </div>
                <div className="absolute top-0 right-0 h-8 w-8 rounded-full bg-background border shadow-sm flex items-center justify-center">
                  <div className={cn(
                    "h-4 w-4 rounded-full animate-pulse",
                    debtStatus === 'Green' ? "bg-emerald-500" :
                    debtStatus === 'Yellow' ? "bg-amber-500" :
                    "bg-destructive"
                  )} />
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-2xl font-black">${data.debt.toLocaleString()}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Active Debt</p>
              </div>
              
              <div className="mt-8 w-full p-4 rounded-xl bg-muted/50 border space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>DTI Ratio Status</span>
                  <span className={cn(
                    debtStatus === 'Green' ? "text-emerald-600" :
                    debtStatus === 'Yellow' ? "text-amber-600" :
                    "text-destructive"
                  )}>{debtStatus === 'Green' ? "Healthy" : debtStatus === 'Yellow' ? "Moderate" : "High"}</span>
                </div>
                <Progress 
                  value={data.debtToIncomeRatio * 2} 
                  className={cn(
                    "h-1.5",
                    debtStatus === 'Green' ? "[&>div]:bg-emerald-500" :
                    debtStatus === 'Yellow' ? "[&>div]:bg-amber-500" :
                    "[&>div]:bg-destructive"
                  )} 
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expenses vs Help By */}
        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowDownCircle className="h-5 w-5 text-destructive" />
                Fixed Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.expenses.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-background/50">
                    <span className="text-sm font-medium">{item.category}</span>
                    <span className="text-sm font-bold text-destructive">-${item.amount.toLocaleString()}</span>
                  </div>
                ))}
                <Button variant="ghost" className="w-full text-xs font-bold gap-1 text-muted-foreground">
                  View Full breakdown <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-emerald-50/50 border-emerald-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-800">
                <Lightbulb className="h-5 w-5 text-emerald-600" />
                Savings Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {savingsOpportunities.map((opp, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-emerald-100 bg-white">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{opp.icon}</span>
                      <span className="text-sm font-medium text-emerald-900">{opp.title}</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-600">+${opp.amount.toLocaleString()}</span>
                  </div>
                ))}
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10">Implement All Savings</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations & Alerts */}
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
                color: "text-blue-500"
              },
              { 
                title: "Refinance Student Loan", 
                desc: "Current rates are 1.5% lower than yours. Potential monthly savings: $85.",
                action: "Check Eligibility",
                icon: TrendingDown,
                color: "text-emerald-500"
              },
              { 
                title: "Subscription Audit", 
                desc: "We found 2 overlapping streaming services you haven't used in 60 days.",
                action: "Audit Now",
                icon: LucidePieChart,
                color: "text-amber-500"
              }
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

      <AddExpenseDialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen} />
    </Layout>
  );
}
