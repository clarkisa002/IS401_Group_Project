import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUserData } from "@/hooks/use-user-data";
import { insertIncome, upsertMonthlyProgressFromIncomeExpenses } from "@/lib/supabase-data";
import { Button } from "@/components/ui/button";
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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AddIncomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddIncomeDialog({ open, onOpenChange }: AddIncomeDialogProps) {
  const { user } = useAuth();
  const { invalidateUserData } = useUserData();
  const [amount, setAmount] = useState("");
  const [incomeDate, setIncomeDate] = useState(new Date().toISOString().slice(0, 10));
  const [source, setSource] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount || parseFloat(amount) <= 0) return;
    setSubmitting(true);
    try {
      await insertIncome(user.user_id, {
        amount: parseFloat(amount),
        income_date: incomeDate,
        source: source || undefined,
        description: description || undefined,
      });
      await upsertMonthlyProgressFromIncomeExpenses(user.user_id);
      invalidateUserData();
      toast.success("Income added successfully");
      setAmount("");
      setSource("");
      setDescription("");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add income");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Income</DialogTitle>
          <DialogDescription>
            Record a new income entry. This will update your financial overview.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="e.g. 2500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="income-date">Date</Label>
            <Input
              id="income-date"
              type="date"
              value={incomeDate}
              onChange={(e) => setIncomeDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="source">Source (optional)</Label>
            <Input
              id="source"
              placeholder="e.g. Salary, Freelance"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              placeholder="e.g. Monthly paycheck"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !amount || parseFloat(amount) <= 0}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Income
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
