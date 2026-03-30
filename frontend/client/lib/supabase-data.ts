import { supabase } from "@/lib/supabase";
import { getCategoryColor } from "@/lib/expense-category-colors";
import type { MonthlySavingsRow, UserData } from "@/lib/types";
import { DEMO_DATA } from "@/lib/types";
import { computeBadges } from "@/lib/badges";
import { historyDateKeyFromRecordedAt } from "@/lib/readiness-history-dates";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const GOAL_TYPE_ICON: Record<string, string> = {
  savings: "Target",
  down_payment: "Home",
  emergency_fund: "Shield",
  closing_costs: "FileText",
};

function getGoalIcon(goalType: string): string {
  return GOAL_TYPE_ICON[goalType] ?? "Target";
}

export interface DbReadiness {
  readiness_id: string;
  user_id: string;
  score: number | null;
  status: string | null;
  downpayment_goal: string | null;
  home_price_min: string | null;
  total_saved: string | null;
  credit_score: number | null;
  debt: string | null;
  debt_to_income_ratio: string | null;
  income: string | null;
  income_stability: string | null;
  savings_target: string | null;
}

export interface DbReadinessHistory {
  id: string;
  user_id: string;
  score: number;
  recorded_at: string;
}

export interface DbGoal {
  goal_id: string;
  goal_name: string;
  goal_type: string;
  target_amount: string | null;
  target_date: string | null;
  current_progress: string;
  is_active: boolean;
}

export interface DbExpense {
  expense_id: string;
  category: string;
  amount: string;
  expense_date: string;
  description: string | null;
}

export interface DbIncome {
  income_id: string;
  amount: string;
  income_date: string;
  source: string | null;
  description: string | null;
}

export interface DbMonthlyProgress {
  progress_id: string;
  month: number;
  year: number;
  total_income: string | null;
  total_expenses: string | null;
  net_savings: string | null;
}

export async function fetchUserData(userId: string, userName: string): Promise<UserData> {
  const [readinessRes, historyRes, goalsRes, expensesRes, incomeRes, progressRes] = await Promise.all([
    supabase
      .from("personal_readiness_score")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("readiness_history")
      .select("score, recorded_at")
      .eq("user_id", userId)
      .order("recorded_at", { ascending: true }),
    supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("expenses")
      .select("expense_id, category, amount, expense_date, description")
      .eq("user_id", userId)
      .gte("expense_date", getDateMonthsAgo(12))
      .lte("expense_date", new Date().toISOString().slice(0, 10)),
    supabase
      .from("income")
      .select("amount, income_date, source")
      .eq("user_id", userId)
      .gte("income_date", getDateMonthsAgo(12))
      .lte("income_date", new Date().toISOString().slice(0, 10)),
    supabase
      .from("monthly_progress")
      .select("*")
      .eq("user_id", userId)
      .order("year", { ascending: true })
      .order("month", { ascending: true }),
  ]);

  const loadErrors = [
    readinessRes.error,
    historyRes.error,
    goalsRes.error,
    expensesRes.error,
    incomeRes.error,
    progressRes.error,
  ].filter(Boolean);
  if (loadErrors.length > 0) {
    const msg = loadErrors[0]?.message || "Failed to load your data from the server.";
    throw new Error(msg);
  }

  const readiness = readinessRes.data as DbReadiness | null;
  const historyRows = (historyRes.data ?? []) as DbReadinessHistory[];
  const goals = (goalsRes.data ?? []) as DbGoal[];
  const expenses = (expensesRes.data ?? []) as DbExpense[];
  const incomeRows = (incomeRes.data ?? []) as DbIncome[];
  const monthlyProgress = (progressRes.data ?? []) as DbMonthlyProgress[];

  const score = readiness?.score ?? 0;
  const totalSaved = parseFloat(readiness?.total_saved ?? "0");
  const downpaymentGoal = parseFloat(readiness?.downpayment_goal ?? "0");
  const savingsTarget =
    parseFloat(readiness?.savings_target ?? "0") || downpaymentGoal || 80000;
  const targetAmount = savingsTarget > 0 ? savingsTarget : 80000;
  const homePriceMin = parseFloat(readiness?.home_price_min ?? "320000");
  const creditScore = readiness?.credit_score ?? 700;
  const debt = parseFloat(readiness?.debt ?? "0");
  const debtToIncomeRatio =
    (parseFloat(readiness?.debt_to_income_ratio ?? "0") || 0) / 100;
  const incomeAnnual = parseFloat(readiness?.income ?? "0");
  const incomeStability = parseFloat(readiness?.income_stability ?? "85");

  const totalIncomeFromRows = incomeRows.reduce((s, r) => s + parseFloat(r.amount), 0);
  const avgMonthlyIncome = incomeRows.length > 0
    ? totalIncomeFromRows / Math.max(1, uniqueMonths(incomeRows.map((r) => r.income_date)))
    : incomeAnnual / 12 || 85000 / 12;

  const expenseByCategory = aggregateExpensesByCategoryLast30Days(expenses);
  const expenseRows = Object.entries(expenseByCategory).map(([category, amount]) => ({
    category,
    amount,
    color: getCategoryColor(category),
  }));

  const expenseTransactions = expenses.map((e) => ({
    expense_id: e.expense_id,
    category: e.category || "Other",
    amount: parseFloat(e.amount),
    expense_date: e.expense_date,
    description: e.description,
  }));

  const incomeTransactions = incomeRows.map((r) => ({
    amount: parseFloat(r.amount),
    income_date: r.income_date,
    source: r.source,
  }));

  const monthlySavings = buildMonthlySavings(monthlyProgress);

  const history = historyRows.length > 0
    ? historyRows.map((h) => ({
        date: historyDateKeyFromRecordedAt(h.recorded_at),
        score: h.score,
      }))
    : [{ date: historyDateKeyFromRecordedAt(new Date()), score }];

  const goalsForUserData = goals.map((g) => ({
    id: g.goal_id,
    title: g.goal_name,
    target: parseFloat(g.target_amount ?? "0"),
    current: parseFloat(g.current_progress ?? "0"),
    deadline: g.target_date ?? "",
    icon: getGoalIcon(g.goal_type),
  }));

  const allocation = deriveAllocationFromGoals(goals, totalSaved);

  const computedIncome = incomeAnnual > 0 ? incomeAnnual : avgMonthlyIncome * 12;
  const computedDebtToIncome =
    computedIncome > 0 && debt > 0 ? (debt / (computedIncome / 12)) / 100 : debtToIncomeRatio;

  const userData: UserData = {
    name: userName,
    avatar: userName.slice(0, 1).toUpperCase(),
    creditScore,
    readinessScore: score,
    savings: {
      total: totalSaved,
      monthly: monthlySavings,
      target: targetAmount,
      homePriceMin: homePriceMin || undefined,
      allocation,
    },
    income: computedIncome || 85000,
    incomeStability,
    debt,
    debtToIncomeRatio: computedDebtToIncome || debtToIncomeRatio,
    expenses: expenseRows,
    expenseTransactions,
    incomeTransactions,
    history,
    goals: goalsForUserData,
    achievements: [],
    streak: computeStreak(monthlyProgress),
  };
  return { ...userData, achievements: computeBadges(userData) };
}

function getDateMonthsAgo(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString().slice(0, 10);
}

function uniqueMonths(dates: string[]): number {
  const set = new Set(dates.map((d) => d.slice(0, 7)));
  return set.size;
}

function aggregateExpensesByCategoryBetween(
  expenses: DbExpense[],
  startInclusive: string,
  endInclusive: string
): Record<string, number> {
  const byCategory: Record<string, number> = {};
  for (const e of expenses) {
    if (e.expense_date >= startInclusive && e.expense_date <= endInclusive) {
      const cat = e.category || "Other";
      byCategory[cat] = (byCategory[cat] ?? 0) + parseFloat(e.amount);
    }
  }
  return byCategory;
}

function aggregateExpensesByCategoryLast30Days(expenses: DbExpense[]): Record<string, number> {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return aggregateExpensesByCategoryBetween(
    expenses,
    start.toISOString().slice(0, 10),
    end.toISOString().slice(0, 10)
  );
}

function buildMonthlySavings(progress: DbMonthlyProgress[]): MonthlySavingsRow[] {
  if (progress.length === 0) {
    return DEMO_DATA.savings.monthly;
  }
  return progress.slice(-6).map((p) => ({
    month: MONTH_NAMES[p.month - 1] ?? `M${p.month}`,
    amount: parseFloat(p.net_savings ?? "0"),
    year: p.year,
    monthIndex: p.month,
  }));
}

function deriveAllocationFromGoals(
  goals: DbGoal[],
  totalSaved: number
): { downPayment: number; emergencyFund: number; closingCosts: number } {
  let downPayment = 0;
  let emergencyFund = 0;
  let closingCosts = 0;

  for (const g of goals) {
    const current = parseFloat(g.current_progress ?? "0");
    const name = g.goal_name.toLowerCase();
    if (name.includes("emergency")) {
      emergencyFund += current;
    } else if (name.includes("closing")) {
      closingCosts += current;
    } else {
      downPayment += current;
    }
  }

  const sum = downPayment + emergencyFund + closingCosts;
  if (sum === 0 && totalSaved > 0) {
    return {
      downPayment: Math.round(totalSaved * 0.78),
      emergencyFund: Math.round(totalSaved * 0.15),
      closingCosts: Math.round(totalSaved * 0.07),
    };
  }

  return { downPayment, emergencyFund, closingCosts };
}

/** Inputs for readiness score calculation */
export interface ReadinessScoreInputs {
  totalSaved: number;
  savingsTarget: number;
  creditScore: number;
  debt: number;
  income: number;
  incomeStability: number;
  emergencyFund: number;
  monthlyExpenses: number;
  homePriceMin: number;
}

export const READINESS_FACTOR_WEIGHTS = {
  savingsProgress: 0.25,
  creditScore: 0.2,
  debtToIncome: 0.2,
  incomeStability: 0.15,
  emergencyFund: 0.1,
  downPaymentPct: 0.1,
} as const;

export type ReadinessFactorId = keyof typeof READINESS_FACTOR_WEIGHTS;

/** Per-factor 0–100 scores using the same rules as `calculateReadinessScore`. */
export interface ReadinessFactorBreakdown {
  id: ReadinessFactorId;
  weight: number;
  score: number;
}

/**
 * Returns each readiness factor’s normalized score (0–100) and weight.
 * Must stay in sync with `calculateReadinessScore`.
 */
export function computeReadinessFactorScores(inputs: ReadinessScoreInputs): ReadinessFactorBreakdown[] {
  const {
    totalSaved,
    savingsTarget,
    creditScore,
    debt,
    income,
    incomeStability,
    emergencyFund,
    monthlyExpenses,
    homePriceMin,
  } = inputs;

  const savingsScore =
    savingsTarget > 0 ? Math.min(100, (totalSaved / savingsTarget) * 100) : 50;

  const creditRaw = Math.max(0, Math.min(100, ((creditScore - 300) / 550) * 100));

  const monthlyIncome = income > 0 ? income / 12 : 0;
  const dtiPct = monthlyIncome > 0 && debt > 0 ? (debt / monthlyIncome) * 100 : 0;
  const dtiRaw = Math.max(0, 100 - Math.min(100, dtiPct * 1.5));

  const stabilityRaw = Math.max(0, Math.min(100, incomeStability));

  const emergencyScore =
    monthlyExpenses > 0
      ? Math.min(100, (emergencyFund / (3 * monthlyExpenses)) * 100)
      : 50;

  const target20 = homePriceMin > 0 ? homePriceMin * 0.2 : 0;
  const downPaymentScore =
    target20 > 0 ? Math.min(100, (totalSaved / target20) * 100) : 50;

  return [
    { id: "savingsProgress", weight: READINESS_FACTOR_WEIGHTS.savingsProgress, score: savingsScore },
    { id: "creditScore", weight: READINESS_FACTOR_WEIGHTS.creditScore, score: creditRaw },
    { id: "debtToIncome", weight: READINESS_FACTOR_WEIGHTS.debtToIncome, score: dtiRaw },
    { id: "incomeStability", weight: READINESS_FACTOR_WEIGHTS.incomeStability, score: stabilityRaw },
    { id: "emergencyFund", weight: READINESS_FACTOR_WEIGHTS.emergencyFund, score: emergencyScore },
    { id: "downPaymentPct", weight: READINESS_FACTOR_WEIGHTS.downPaymentPct, score: downPaymentScore },
  ];
}

/**
 * Calculates readiness score (0-100) from financial inputs.
 * Uses 6 weighted factors; handles missing/zero inputs with neutral score (50).
 */
export function calculateReadinessScore(inputs: ReadinessScoreInputs): number {
  const factors = computeReadinessFactorScores(inputs);
  let score = 0;
  let weightSum = 0;
  for (const f of factors) {
    score += f.score * f.weight;
    weightSum += f.weight;
  }
  const total = weightSum > 0 ? score / weightSum : 50;
  return Math.round(Math.max(0, Math.min(100, total)));
}

export async function recalculateAndSaveReadinessScore(userId: string): Promise<void> {
  const [readinessRes, goalsRes, expensesRes, incomeRes] = await Promise.all([
    supabase
      .from("personal_readiness_score")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true),
    supabase
      .from("expenses")
      .select("amount, expense_date")
      .eq("user_id", userId)
      .gte("expense_date", getDateMonthsAgo(1)),
    supabase
      .from("income")
      .select("amount, income_date")
      .eq("user_id", userId)
      .gte("income_date", getDateMonthsAgo(12)),
  ]);

  const readiness = readinessRes.data as DbReadiness | null;
  const goals = (goalsRes.data ?? []) as DbGoal[];
  const expenses = (expensesRes.data ?? []) as DbExpense[];
  const incomeRows = (incomeRes.data ?? []) as DbIncome[];

  const totalSaved = parseFloat(readiness?.total_saved ?? "0");
  const downpaymentGoal = parseFloat(readiness?.downpayment_goal ?? "0");
  const savingsTarget =
    parseFloat(readiness?.savings_target ?? "0") || downpaymentGoal || 80000;
  const homePriceMin = parseFloat(readiness?.home_price_min ?? "320000");
  const creditScore = readiness?.credit_score ?? 700;
  const debt = parseFloat(readiness?.debt ?? "0");
  const incomeAnnual = parseFloat(readiness?.income ?? "0");
  const incomeStability = parseFloat(readiness?.income_stability ?? "50");

  const totalIncomeFromRows = incomeRows.reduce((s, r) => s + parseFloat(r.amount), 0);
  const avgMonthlyIncome =
    incomeRows.length > 0
      ? totalIncomeFromRows / Math.max(1, uniqueMonths(incomeRows.map((r) => r.income_date)))
      : 0;
  const income = incomeAnnual > 0 ? incomeAnnual : avgMonthlyIncome * 12;

  const last30 = new Date();
  last30.setDate(last30.getDate() - 30);
  const last30Cutoff = last30.toISOString().slice(0, 10);
  const monthlyExpenses = expenses
    .filter((e) => e.expense_date >= last30Cutoff)
    .reduce((s, e) => s + parseFloat(e.amount), 0);

  const allocation = deriveAllocationFromGoals(goals, totalSaved);
  const emergencyFund = allocation.emergencyFund;

  const score = calculateReadinessScore({
    totalSaved,
    savingsTarget: savingsTarget || 80000,
    creditScore,
    debt,
    income: income || 85000,
    incomeStability,
    emergencyFund,
    monthlyExpenses: monthlyExpenses || 3000,
    homePriceMin: homePriceMin || 320000,
  });

  const existing = readinessRes.data as DbReadiness | null;
  if (existing?.readiness_id) {
    const { error } = await supabase
      .from("personal_readiness_score")
      .update({ score })
      .eq("user_id", userId);
    if (error) throw error;
    if (score !== (existing.score ?? 0)) {
      await supabase.from("readiness_history").insert({ user_id: userId, score });
    }
  } else {
    const insertRow = {
      user_id: userId,
      score,
      downpayment_goal: downpaymentGoal || null,
      total_saved: totalSaved,
      home_price_min: homePriceMin || null,
      credit_score: creditScore,
      debt: debt,
      income: incomeAnnual || null,
      income_stability: incomeStability,
      savings_target: savingsTarget || null,
      status: "active",
    };
    const { error } = await supabase.from("personal_readiness_score").insert(insertRow);
    if (error) throw error;
    await supabase.from("readiness_history").insert({ user_id: userId, score });
  }
}

export const EXPENSE_CATEGORIES = [
  "Rent/Housing",
  "Food & Dining",
  "Transportation",
  "Entertainment/Fun",
  "Utilities",
  "Other",
] as const;

export async function insertIncome(
  userId: string,
  payload: { amount: number; income_date: string; source?: string; description?: string }
) {
  const { error } = await supabase.from("income").insert({
    user_id: userId,
    amount: payload.amount,
    income_date: payload.income_date,
    source: payload.source ?? null,
    description: payload.description ?? null,
  });
  if (error) throw error;
  await recalculateAndSaveReadinessScore(userId);
}

export async function insertExpense(
  userId: string,
  payload: { amount: number; category: string; expense_date: string; description?: string }
) {
  const { error } = await supabase.from("expenses").insert({
    user_id: userId,
    amount: payload.amount,
    category: payload.category,
    expense_date: payload.expense_date,
    description: payload.description ?? null,
  });
  if (error) throw error;
  await recalculateAndSaveReadinessScore(userId);
}

export async function upsertReadiness(
  userId: string,
  payload: {
    score?: number;
    downpayment_goal?: number;
    total_saved?: number;
    home_price_min?: number;
    credit_score?: number;
    debt?: number;
    debt_to_income_ratio?: number;
    income?: number;
    income_stability?: number;
    savings_target?: number;
    status?: string;
  }
) {
  const { data: existing } = await supabase
    .from("personal_readiness_score")
    .select("readiness_id, score")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  const row: Record<string, unknown> = {
    user_id: userId,
    status: payload.status ?? "active",
  };
  if (payload.score != null) row.score = payload.score;
  if (payload.downpayment_goal != null) row.downpayment_goal = payload.downpayment_goal;
  if (payload.total_saved != null) row.total_saved = payload.total_saved;
  if (payload.home_price_min != null) row.home_price_min = payload.home_price_min;
  if (payload.credit_score != null) row.credit_score = payload.credit_score;
  if (payload.debt != null) row.debt = payload.debt;
  if (payload.debt_to_income_ratio != null) row.debt_to_income_ratio = payload.debt_to_income_ratio;
  if (payload.income != null) row.income = payload.income;
  if (payload.income_stability != null) row.income_stability = payload.income_stability;
  if (payload.savings_target != null) row.savings_target = payload.savings_target;

  if (existing) {
    const { error } = await supabase
      .from("personal_readiness_score")
      .update(row)
      .eq("user_id", userId);
    if (error) throw error;
    if (payload.score != null && payload.score !== existing.score) {
      await supabase.from("readiness_history").insert({
        user_id: userId,
        score: payload.score,
      });
    }
  } else {
    const { error } = await supabase.from("personal_readiness_score").insert(row);
    if (error) throw error;
    if (payload.score != null) {
      await supabase.from("readiness_history").insert({
        user_id: userId,
        score: payload.score,
      });
    }
  }
}

export async function updateGoalProgress(
  userId: string,
  goalId: string,
  currentProgress: number
) {
  const { error } = await supabase
    .from("goals")
    .update({ current_progress: currentProgress })
    .eq("goal_id", goalId)
    .eq("user_id", userId);
  if (error) throw error;
  await recalculateAndSaveReadinessScore(userId);
}

export async function upsertMonthlyProgressFromIncomeExpenses(userId: string) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const [incomeRes, expenseRes] = await Promise.all([
    supabase
      .from("income")
      .select("amount")
      .eq("user_id", userId)
      .gte("income_date", `${year}-${String(month).padStart(2, "0")}-01`)
      .lt("income_date", month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, "0")}-01`),
    supabase
      .from("expenses")
      .select("amount")
      .eq("user_id", userId)
      .gte("expense_date", `${year}-${String(month).padStart(2, "0")}-01`)
      .lt("expense_date", month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, "0")}-01`),
  ]);

  const totalIncome = (incomeRes.data ?? []).reduce((s, r) => s + parseFloat(String(r.amount)), 0);
  const totalExpenses = (expenseRes.data ?? []).reduce((s, r) => s + parseFloat(String(r.amount)), 0);
  const netSavings = totalIncome - totalExpenses;

  const { error } = await supabase.from("monthly_progress").upsert(
    {
      user_id: userId,
      month,
      year,
      total_income: totalIncome,
      total_expenses: totalExpenses,
      net_savings: netSavings,
    },
    { onConflict: "user_id,month,year" }
  );
  if (error) throw error;
}

function computeStreak(progress: DbMonthlyProgress[]): number {
  if (progress.length === 0) return 0;
  const sorted = [...progress].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });
  let streak = 0;
  const now = new Date();
  let expectYear = now.getFullYear();
  let expectMonth = now.getMonth() + 1;

  for (const p of sorted) {
    if (p.year === expectYear && p.month === expectMonth) {
      const net = parseFloat(p.net_savings ?? "0");
      if (net > 0) streak++;
      expectMonth--;
      if (expectMonth < 1) {
        expectMonth = 12;
        expectYear--;
      }
    } else break;
  }
  return streak;
}
