import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { useUserData } from "@/hooks/use-user-data";
import {
  COLOR_SCHEMES,
  COLOR_SCHEME_SWATCHES,
  type ColorSchemeId,
  useColorScheme,
} from "@/hooks/use-color-scheme";
import { AddIncomeDialog } from "@/components/AddIncomeDialog";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UserCircle2, Mail, Gauge, DollarSign, Receipt, Palette } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const { data } = useUserData();
  const { scheme, setScheme } = useColorScheme();
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
            <CardTitle className="flex items-center gap-2" id="appearance-heading">
              <Palette className="h-5 w-5 text-primary" aria-hidden />
              Appearance
            </CardTitle>
            <CardDescription>
              Choose a color theme for the app. Your choice is saved on this device.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={scheme}
              onValueChange={(v) => setScheme(v as ColorSchemeId)}
              aria-labelledby="appearance-heading"
              className="gap-3"
            >
              {COLOR_SCHEMES.map((opt) => {
                const swatch = COLOR_SCHEME_SWATCHES[opt.id];
                return (
                  <div
                    key={opt.id}
                    className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 sm:items-center"
                  >
                    <RadioGroupItem value={opt.id} id={`color-scheme-${opt.id}`} className="mt-0.5 sm:mt-0" />
                    <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <Label
                        htmlFor={`color-scheme-${opt.id}`}
                        className="cursor-pointer text-left font-normal leading-snug"
                      >
                        <span className="block font-medium text-foreground">{opt.label}</span>
                        <span className="block text-sm text-muted-foreground">{opt.description}</span>
                      </Label>
                      <div className="flex shrink-0 gap-1.5" aria-hidden>
                        <span
                          className="h-7 w-7 rounded-md border border-border shadow-sm"
                          style={{ backgroundColor: `hsl(${swatch.primary})` }}
                          title="Primary"
                        />
                        <span
                          className="h-7 w-7 rounded-md border border-border shadow-sm"
                          style={{ backgroundColor: `hsl(${swatch.secondary})` }}
                          title="Secondary"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </RadioGroup>
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
