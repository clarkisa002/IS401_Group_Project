export interface ExpenseTransaction {
  /** Present for Supabase rows; demo rows may omit. */
  expense_id?: string;
  category: string;
  amount: number;
  expense_date: string;
  description?: string | null;
}

export interface IncomeTransaction {
  amount: number;
  income_date: string;
  source?: string | null;
}

export interface UserData {
  name: string;
  avatar: string;
  creditScore: number;
  readinessScore: number;
  savings: {
    total: number;
    monthly: { month: string; amount: number; costTrend: number }[];
    target: number;
    homePriceMin?: number;
    allocation: {
      downPayment: number;
      emergencyFund: number;
      closingCosts: number;
    };
  };
  income: number;
  incomeStability: number;
  debt: number;
  debtToIncomeRatio: number;
  expenses: {
    category: string;
    amount: number;
    color: string;
  }[];
  /** Raw rows for date-filtered spending views; empty when using demo fallback without DB. */
  expenseTransactions: ExpenseTransaction[];
  incomeTransactions: IncomeTransaction[];
  history: {
    date: string;
    score: number;
  }[];
  goals: {
    id: string;
    title: string;
    target: number;
    current: number;
    deadline: string;
    icon: string;
  }[];
  achievements: Achievement[];
  streak: number;
}

/** Dashboard badges — unlock rules live in `lib/badges.ts` */
export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: AchievementIcon;
  /** How to earn (always shown) */
  howToEarn: string;
  /** When unlocked: what your data shows */
  earnedDetail: string | null;
  /** When locked: optional current status (e.g. progress toward the rule) */
  lockedHint?: string | null;
}

export type AchievementIcon =
  | "Target"
  | "TrendingUp"
  | "Zap"
  | "PiggyBank"
  | "Wallet"
  | "Receipt"
  | "Award"
  | "Shield"
  | "Flame";

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export const DEMO_DATA: UserData = {
  name: "Isaac",
  avatar: "I",
  creditScore: 720,
  readinessScore: 68,
  savings: {
    total: 45000,
    target: 80000,
    monthly: [
      { month: "Jan", amount: 2000, costTrend: 320000 },
      { month: "Feb", amount: 2200, costTrend: 325000 },
      { month: "Mar", amount: 1800, costTrend: 330000 },
      { month: "Apr", amount: 2500, costTrend: 328000 },
      { month: "May", amount: 2100, costTrend: 335000 },
      { month: "Jun", amount: 2400, costTrend: 340000 },
    ],
    allocation: {
      downPayment: 35000,
      emergencyFund: 7000,
      closingCosts: 3000,
    },
  },
  income: 85000,
  incomeStability: 85,
  debt: 12000,
  debtToIncomeRatio: 15,
  expenses: [
    { category: "Rent/Housing", amount: 1800, color: "#3b82f6" },
    { category: "Food & Dining", amount: 600, color: "#10b981" },
    { category: "Transportation", amount: 400, color: "#f59e0b" },
    { category: "Entertainment/Fun", amount: 300, color: "#8b5cf6" },
    { category: "Utilities", amount: 200, color: "#ec4899" },
    { category: "Other", amount: 150, color: "#6b7280" },
  ],
  expenseTransactions: [
    {
      expense_id: "demo-1",
      category: "Rent/Housing",
      amount: 1800,
      expense_date: isoDaysAgo(3),
      description: "Monthly rent",
    },
    {
      expense_id: "demo-2",
      category: "Food & Dining",
      amount: 150,
      expense_date: isoDaysAgo(7),
      description: "Groceries",
    },
    {
      expense_id: "demo-3",
      category: "Food & Dining",
      amount: 120,
      expense_date: isoDaysAgo(12),
      description: "Restaurant",
    },
    {
      expense_id: "demo-4",
      category: "Transportation",
      amount: 200,
      expense_date: isoDaysAgo(15),
      description: "Gas",
    },
    {
      expense_id: "demo-5",
      category: "Entertainment/Fun",
      amount: 180,
      expense_date: isoDaysAgo(20),
      description: "Concert tickets",
    },
    {
      expense_id: "demo-6",
      category: "Utilities",
      amount: 200,
      expense_date: isoDaysAgo(25),
      description: "Electric bill",
    },
    {
      expense_id: "demo-7",
      category: "Other",
      amount: 80,
      expense_date: isoDaysAgo(28),
      description: null,
    },
    {
      expense_id: "demo-8",
      category: "Transportation",
      amount: 200,
      expense_date: isoDaysAgo(45),
      description: "Oil change",
    },
    {
      expense_id: "demo-9",
      category: "Food & Dining",
      amount: 200,
      expense_date: isoDaysAgo(70),
      description: "Bulk groceries",
    },
  ],
  incomeTransactions: [
    { amount: 3500, income_date: isoDaysAgo(2), source: "Paycheck" },
    { amount: 3500, income_date: isoDaysAgo(16), source: "Paycheck" },
    { amount: 3500, income_date: isoDaysAgo(44), source: "Paycheck" },
  ],
  history: [
    { date: "2023-01", score: 45 },
    { date: "2023-02", score: 48 },
    { date: "2023-03", score: 52 },
    { date: "2023-04", score: 58 },
    { date: "2023-05", score: 62 },
    { date: "2023-06", score: 68 },
  ],
  goals: [
    { id: "1", title: "Down Payment", target: 60000, current: 35000, deadline: "2025-12-31", icon: "Home" },
    { id: "2", title: "Emergency Fund", target: 10000, current: 7000, deadline: "2024-06-30", icon: "Shield" },
    { id: "3", title: "Closing Costs", target: 10000, current: 3000, deadline: "2025-12-31", icon: "FileText" },
  ],
  achievements: [],
  streak: 6,
};
