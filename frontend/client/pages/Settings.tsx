import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { useUserData } from "@/hooks/use-user-data";
import { AddIncomeDialog } from "@/components/AddIncomeDialog";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCircle2, Mail, Gauge, DollarSign, Receipt } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const { data } = useUserData();
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);

  const displayName = user?.name || data?.name || "Guest User";
  const displayEmail = user?.email || "No email available";
  const readinessScore = data?.readinessScore ?? 0;

  return (
    <Layout>
      <div className="container py-8 space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">User Settings</h1>
          <p className="text-muted-foreground">
            Manage your account details and enter your financial data.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              This data is connected to your authenticated account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <UserCircle2 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Full name</p>
                <p className="text-sm font-semibold">{displayName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Email</p>
                <p className="text-sm font-semibold">{displayEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Gauge className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Readiness score</p>
                <p className="text-sm font-semibold">{readinessScore}/100</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Data Entry</CardTitle>
            <CardDescription>
              Add income and expenses to keep your spending analysis up to date.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button onClick={() => setIncomeDialogOpen(true)} className="gap-2">
              <DollarSign className="h-4 w-4" /> Add Income
            </Button>
            <Button variant="outline" onClick={() => setExpenseDialogOpen(true)} className="gap-2">
              <Receipt className="h-4 w-4" /> Add Expense
            </Button>
          </CardContent>
        </Card>
      </div>

      <AddIncomeDialog open={incomeDialogOpen} onOpenChange={setIncomeDialogOpen} />
      <AddExpenseDialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen} />
    </Layout>
  );
}
