import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUserData } from "@/hooks/use-user-data";
import {
  insertExpense,
  upsertMonthlyProgressFromIncomeExpenses,
  EXPENSE_CATEGORIES,
} from "@/lib/supabase-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddExpenseDialog({ open, onOpenChange }: AddExpenseDialogProps) {
  const { user } = useAuth();
  const { invalidateUserData } = useUserData();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>("");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount || parseFloat(amount) <= 0 || !category) return;
    setSubmitting(true);
    try {
      await insertExpense(user.user_id, {
        amount: parseFloat(amount),
        category,
        expense_date: expenseDate,
        description: description || undefined,
      });
      await upsertMonthlyProgressFromIncomeExpenses(user.user_id);
      invalidateUserData();
      toast.success("Expense added successfully");
      setAmount("");
      setCategory("");
      setDescription("");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add expense");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogDescription>
            Record a new expense. This will update your spending analysis.
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
              placeholder="e.g. 150"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="expense-date">Date</Label>
            <Input
              id="expense-date"
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              placeholder="e.g. Groceries at Costco"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !amount || parseFloat(amount) <= 0 || !category}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
              Add Expense
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
