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
  achievements: {
    id: string;
    title: string;
    description: string;
    unlocked: boolean;
    icon: string;
  }[];
  streak: number;
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
  achievements: [
    { id: "1", title: "First $10k", description: "Saved your first $10,000", unlocked: true, icon: "Target" },
    { id: "2", title: "Consistent Saver", description: "Saved for 6 months straight", unlocked: true, icon: "TrendingUp" },
    { id: "3", title: "Debt Slayer", description: "Paid off 50% of your debt", unlocked: false, icon: "Zap" },
  ],
  streak: 6,
};
