import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUserData } from "@/hooks/use-user-data";
import { upsertReadiness, recalculateAndSaveReadinessScore } from "@/lib/supabase-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

interface FinancialSnapshotFormProps {
  onSaved?: () => void;
}

export function FinancialSnapshotForm({ onSaved }: FinancialSnapshotFormProps) {
  const { user } = useAuth();
  const { data, invalidateUserData } = useUserData();
  const [downpaymentGoal, setDownpaymentGoal] = useState("");
  const [totalSaved, setTotalSaved] = useState("");
  const [homePriceMin, setHomePriceMin] = useState("");
  const [creditScore, setCreditScore] = useState("");
  const [debt, setDebt] = useState("");
  const [income, setIncome] = useState("");
  const [incomeStability, setIncomeStability] = useState("");
  const [savingsTarget, setSavingsTarget] = useState("");
  const [hasUserEdited, setHasUserEdited] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (data) {
      // Prevent overwriting user edits while Supabase/react-query is refetching.
      // We only hydrate from `data` until the user starts typing.
      if (hasUserEdited) return;
      setDownpaymentGoal(String(data.savings?.target ?? ""));
      setTotalSaved(String(data.savings?.total ?? ""));
      setHomePriceMin(String(data.savings?.homePriceMin ?? 320000));
      setCreditScore(String(data.creditScore ?? ""));
      setDebt(String(data.debt ?? ""));
      setIncome(String(data.income ?? ""));
      setIncomeStability(String(data.incomeStability ?? ""));
      setSavingsTarget(String(data.savings?.target ?? ""));
    }
  }, [data, hasUserEdited]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      await upsertReadiness(user.user_id, {
        downpayment_goal: downpaymentGoal ? parseFloat(downpaymentGoal) : undefined,
        total_saved: totalSaved ? parseFloat(totalSaved) : undefined,
        home_price_min: homePriceMin ? parseFloat(homePriceMin) : undefined,
        credit_score: creditScore ? parseInt(creditScore, 10) : undefined,
        debt: debt ? parseFloat(debt) : undefined,
        debt_to_income_ratio: income && debt
          ? (parseFloat(debt) / (parseFloat(income) / 12)) * 100
          : undefined,
        income: income ? parseFloat(income) : undefined,
        income_stability: incomeStability ? parseFloat(incomeStability) : undefined,
        savings_target: savingsTarget ? parseFloat(savingsTarget) : undefined,
      });
      await recalculateAndSaveReadinessScore(user.user_id);
      invalidateUserData();
      toast.success("Financial snapshot saved");
      setHasUserEdited(false);
      onSaved?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Snapshot</CardTitle>
        <CardDescription>
          Update your readiness score and financial overview. This drives your charts and recommendations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Your readiness score is calculated automatically from the data below and updates whenever you add income, expenses, or goal progress.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="credit-score">Credit Score</Label>
              <Input
                id="credit-score"
                type="number"
                min="300"
                max="850"
                placeholder="e.g. 720"
                value={creditScore}
                onChange={(e) => {
                  setHasUserEdited(true);
                  setCreditScore(e.target.value);
                }}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="total-saved">Total Saved ($)</Label>
              <Input
                id="total-saved"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 45000"
                value={totalSaved}
                onChange={(e) => {
                  setHasUserEdited(true);
                  setTotalSaved(e.target.value);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="savings-target">Savings Target ($)</Label>
              <Input
                id="savings-target"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 80000"
                value={savingsTarget}
                onChange={(e) => {
                  setHasUserEdited(true);
                  setSavingsTarget(e.target.value);
                }}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="downpayment-goal">Down Payment Goal ($)</Label>
              <Input
                id="downpayment-goal"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 60000"
                value={downpaymentGoal}
                onChange={(e) => {
                  setHasUserEdited(true);
                  setDownpaymentGoal(e.target.value);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="home-price-min">Target Home Price ($)</Label>
              <Input
                id="home-price-min"
                type="number"
                min="0"
                step="1000"
                placeholder="e.g. 320000"
                value={homePriceMin}
                onChange={(e) => {
                  setHasUserEdited(true);
                  setHomePriceMin(e.target.value);
                }}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="income">Annual Income ($)</Label>
              <Input
                id="income"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 85000"
                value={income}
                onChange={(e) => {
                  setHasUserEdited(true);
                  setIncome(e.target.value);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="debt">Total Debt ($)</Label>
              <Input
                id="debt"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 12000"
                value={debt}
                onChange={(e) => {
                  setHasUserEdited(true);
                  setDebt(e.target.value);
                }}
              />
            </div>
          </div>
          <div className="space-y-2 sm:max-w-xs">
            <Label htmlFor="income-stability">Income Stability (0-100)</Label>
            <Input
              id="income-stability"
              type="number"
              min="0"
              max="100"
              placeholder="e.g. 85"
              value={incomeStability}
              onChange={(e) => {
                setHasUserEdited(true);
                setIncomeStability(e.target.value);
              }}
            />
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Snapshot
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
