import type { UserData } from "@/lib/types";
import {
  computeReadinessFactorScores,
  type ReadinessFactorId,
  type ReadinessScoreInputs,
} from "@/lib/supabase-data";

/** Factor sub-score below this is considered “needs improvement” for recommendations. */
const WEAK_SCORE_THRESHOLD = 68;

export interface ReadinessRecommendation {
  factorId: ReadinessFactorId;
  /** 0–100 sub-score for this factor (why it was flagged). */
  factorScore: number;
  /** Share of overall readiness score (e.g. 25 for 25%). */
  weightPercent: number;
  title: string;
  description: string;
  /** 3–4 concrete steps */
  steps: string[];
}

type RecommendationBody = Omit<ReadinessRecommendation, "factorScore" | "weightPercent">;

/** Short labels for UI chips. */
export const READINESS_FACTOR_LABELS: Record<ReadinessFactorId, string> = {
  savingsProgress: "Savings progress",
  creditScore: "Credit score",
  debtToIncome: "Debt-to-income",
  incomeStability: "Income stability",
  emergencyFund: "Emergency fund",
  downPaymentPct: "Down payment vs. home price",
};

function sumExpensesLast30Days(data: UserData): number {
  const last30 = new Date();
  last30.setDate(last30.getDate() - 30);
  const cutoff = last30.toISOString().slice(0, 10);
  return data.expenseTransactions
    .filter((e) => e.expense_date >= cutoff)
    .reduce((s, e) => s + e.amount, 0);
}

/**
 * Aligns with `recalculateAndSaveReadinessScore`: last-30-day spend sum, default $3,000 if none.
 */
export function userDataToReadinessInputs(data: UserData): ReadinessScoreInputs {
  const last30Sum = sumExpensesLast30Days(data);
  const monthlyExpenses = last30Sum > 0 ? last30Sum : 3000;

  return {
    totalSaved: data.savings.total,
    savingsTarget: data.savings.target > 0 ? data.savings.target : 80000,
    creditScore: data.creditScore,
    debt: data.debt,
    income: data.income > 0 ? data.income : 85000,
    incomeStability: data.incomeStability,
    emergencyFund: data.savings.allocation.emergencyFund,
    monthlyExpenses,
    homePriceMin: data.savings.homePriceMin ?? 320000,
  };
}

function factorApplies(
  id: ReadinessFactorId,
  inputs: ReadinessScoreInputs,
  data: UserData
): boolean {
  switch (id) {
    case "savingsProgress":
      return data.savings.target > 0;
    case "creditScore":
      return inputs.creditScore < 720;
    case "debtToIncome":
      return inputs.debt > 0 && inputs.income > 0;
    case "incomeStability":
      return true;
    case "emergencyFund":
      return inputs.monthlyExpenses > 0;
    case "downPaymentPct":
      return (data.savings.homePriceMin ?? 0) > 0 || inputs.homePriceMin > 0;
    default:
      return true;
  }
}

function buildRecommendation(id: ReadinessFactorId, inputs: ReadinessScoreInputs): RecommendationBody {
  const pctTowardSavings =
    inputs.savingsTarget > 0
      ? Math.round((inputs.totalSaved / inputs.savingsTarget) * 100)
      : 0;
  const target20 = inputs.homePriceMin > 0 ? inputs.homePriceMin * 0.2 : 0;
  const pctTowardDown =
    target20 > 0 ? Math.round((inputs.totalSaved / target20) * 100) : 0;
  const threeMoNeed = inputs.monthlyExpenses * 3;
  const monthsCovered =
    inputs.monthlyExpenses > 0
      ? inputs.emergencyFund / inputs.monthlyExpenses
      : 0;

  switch (id) {
    case "savingsProgress":
      return {
        factorId: id,
        title: "Accelerate toward your savings target",
        description: `Savings progress is the largest part of your readiness score. You’re at about ${pctTowardSavings}% of your goal—closing that gap strengthens your down payment and emergency cushion.`,
        steps: [
          "Set up an automatic transfer to savings on payday so progress happens before discretionary spending.",
          "Review one recurring bill (subscriptions, insurance, phone) and redirect any savings to your home fund.",
          "Add or increase a dedicated “home purchase” goal on this page so the target stays visible.",
          "Track one month of spending to find a realistic extra amount to save each month—even small increases compound.",
        ],
      };
    case "creditScore":
      return {
        factorId: id,
        title: "Strengthen your credit profile",
        description:
          "Mortgage pricing and approval lean heavily on credit. Improving your score can widen lender options and reduce interest cost over the life of the loan.",
        steps: [
          "Pay every bill on time; set calendar reminders or autopay for at least the minimum.",
          "Keep credit card balances low versus limits—under 30% utilization per card is a common target.",
          "Avoid opening several new credit accounts in the months before you apply for a mortgage.",
          "Check your credit reports for errors and dispute inaccuracies with the bureaus.",
        ],
      };
    case "debtToIncome":
      return {
        factorId: id,
        title: "Lower your debt-to-income ratio",
        description:
          "Lenders compare monthly debt payments to income. A lower ratio improves readiness and can increase how much home you qualify for.",
        steps: [
          "List debts by interest rate and put extra payments toward the highest-rate balance first.",
          "Avoid large new loans or leases before applying for a mortgage.",
          "If possible, pay down revolving balances to reduce minimum monthly payments.",
          "Keep documentation of income stable; sudden drops in reported income raise DTI concerns.",
        ],
      };
    case "incomeStability":
      return {
        factorId: id,
        title: "Stabilize and document your income",
        description:
          "Consistent, verifiable income reassures lenders you can handle a mortgage. Your stability score has room to improve relative to the rest of your profile.",
        steps: [
          "Maintain steady employment in the same field if you can—large job changes near application time need explanation.",
          "Save pay stubs and tax returns so you can document income quickly when you apply.",
          "If income is variable, build a larger cash buffer to smooth slower months.",
          "Avoid major unexplained deposits or income gaps that are hard to document.",
        ],
      };
    case "emergencyFund":
      return {
        factorId: id,
        title: "Build your emergency reserve",
        description: `Your score compares emergency savings to about three months of spending (~$${Math.round(threeMoNeed).toLocaleString()}). You’re at roughly ${monthsCovered.toFixed(1)} months of expenses in your emergency allocation—lenders like seeing reserves beyond the down payment.`,
        steps: [
          "Route a fixed amount monthly into your emergency bucket until you hit at least three months of core expenses.",
          "Keep emergency funds in liquid savings (high-yield savings or money market), not volatile investments.",
          "Separate “emergency” from “down payment” mentally so you don’t drain the buffer for closing costs.",
          "After large expenses, rebuild the fund before increasing discretionary spending.",
        ],
      };
    case "downPaymentPct":
      return {
        factorId: id,
        title: "Grow savings toward a typical down payment",
        description: `We benchmark total savings against about 20% of your minimum home price (~$${Math.round(target20).toLocaleString()}). You’re near ${pctTowardDown}% of that benchmark—more savings here directly improves readiness and may reduce mortgage insurance needs.`,
        steps: [
          "Confirm your target home price range and revisit the 20% benchmark as prices or goals change.",
          "Prioritize this bucket after a minimal emergency fund so both scores improve together.",
          "Use windfalls (tax refunds, bonuses) as one-time boosts to the down-payment portion of savings.",
          "Compare loan programs: some allow less than 20% down, but a larger down payment often improves terms.",
        ],
      };
    default: {
      const _exhaustive: never = id;
      return _exhaustive;
    }
  }
}

/**
 * Returns up to `max` recommendations for the weakest applicable readiness factors,
 * ordered by factor weight (highest first), then by lowest factor score.
 */
export function getTopReadinessRecommendations(
  data: UserData,
  max: number = 2
): ReadinessRecommendation[] {
  const inputs = userDataToReadinessInputs(data);
  const factors = computeReadinessFactorScores(inputs);

  const weak = factors.filter((f) => {
    if (f.score >= WEAK_SCORE_THRESHOLD) return false;
    return factorApplies(f.id, inputs, data);
  });

  weak.sort((a, b) => {
    if (b.weight !== a.weight) return b.weight - a.weight;
    return a.score - b.score;
  });

  return weak.slice(0, max).map((f) => ({
    ...buildRecommendation(f.id, inputs),
    factorScore: Math.round(f.score),
    weightPercent: Math.round(f.weight * 100),
  }));
}
