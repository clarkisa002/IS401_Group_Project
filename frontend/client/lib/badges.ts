import type { Achievement, AchievementIcon, UserData } from "@/lib/types";

type EvalResult = {
  unlocked: boolean;
  earnedDetail: string | null;
  lockedHint?: string | null;
};

interface BadgeRule {
  id: string;
  title: string;
  description: string;
  icon: AchievementIcon;
  howToEarn: string;
  evaluate: (data: UserData) => EvalResult;
}

const fmtMoney = (n: number) =>
  n.toLocaleString(undefined, { maximumFractionDigits: 0, style: "currency", currency: "USD" });

/** Supports ratio as 0–1 or legacy percent 0–100 (e.g. demo data uses 15 for 15%). */
function dtiAsFraction(ratio: number): number {
  if (ratio > 1) return ratio / 100;
  return ratio;
}

const RULES: BadgeRule[] = [
  {
    id: "log_income",
    title: "Income logged",
    description: "Track money coming in",
    icon: "Wallet",
    howToEarn: "Add at least one income entry (Settings or Spending → Add income).",
    evaluate: (data) => {
      const n = data.incomeTransactions.length;
      const unlocked = n >= 1;
      return {
        unlocked,
        earnedDetail: unlocked ? `You’ve logged ${n} income entr${n === 1 ? "y" : "ies"}.` : null,
        lockedHint: unlocked ? undefined : "No income entries yet.",
      };
    },
  },
  {
    id: "log_expenses",
    title: "Spending tracked",
    description: "Record where money goes",
    icon: "Receipt",
    howToEarn: "Add at least three expense entries so spending analysis reflects real habits.",
    evaluate: (data) => {
      const n = data.expenseTransactions.length;
      const unlocked = n >= 3;
      return {
        unlocked,
        earnedDetail: unlocked ? `You’ve recorded ${n} expense${n === 1 ? "" : "s"}.` : null,
        lockedHint: unlocked ? undefined : `${n}/3 expenses logged.`,
      };
    },
  },
  {
    id: "savings_10k",
    title: "$10K saved",
    description: "Reach five figures toward your goal",
    icon: "PiggyBank",
    howToEarn: "Grow total savings to at least $10,000 (updates from your profile / readiness snapshot).",
    evaluate: (data) => {
      const t = data.savings.total;
      const unlocked = t >= 10_000;
      return {
        unlocked,
        earnedDetail: unlocked ? `Total saved: ${fmtMoney(t)}.` : null,
        lockedHint: unlocked ? undefined : `Currently ${fmtMoney(t)} — need ${fmtMoney(Math.max(0, 10_000 - t))} more.`,
      };
    },
  },
  {
    id: "streak_3",
    title: "3-month streak",
    description: "Keep saving month over month",
    icon: "Flame",
    howToEarn: "Maintain positive monthly savings activity for 3 consecutive months (from monthly progress).",
    evaluate: (data) => {
      const s = data.streak;
      const unlocked = s >= 3;
      return {
        unlocked,
        earnedDetail: unlocked ? `Current streak: ${s} month${s === 1 ? "" : "s"}.` : null,
        lockedHint: unlocked ? undefined : `Streak: ${s}/3 months.`,
      };
    },
  },
  {
    id: "streak_6",
    title: "6-month streak",
    description: "Serious consistency",
    icon: "TrendingUp",
    howToEarn: "Hit 6 consecutive months of tracked savings progress.",
    evaluate: (data) => {
      const s = data.streak;
      const unlocked = s >= 6;
      return {
        unlocked,
        earnedDetail: unlocked ? `Current streak: ${s} month${s === 1 ? "" : "s"}.` : null,
        lockedHint: unlocked ? undefined : `Streak: ${s}/6 months.`,
      };
    },
  },
  {
    id: "readiness_70",
    title: "Readiness 70+",
    description: "Strong homebuying position",
    icon: "Award",
    howToEarn: "Raise your readiness score to 70 or higher (goals, savings, and snapshot all contribute).",
    evaluate: (data) => {
      const score = data.readinessScore;
      const unlocked = score >= 70;
      return {
        unlocked,
        earnedDetail: unlocked ? `Your score is ${score}/100.` : null,
        lockedHint: unlocked ? undefined : `Score: ${score}/100 — need 70+.`,
      };
    },
  },
  {
    id: "goal_created",
    title: "Goal setter",
    description: "Name what you’re saving for",
    icon: "Target",
    howToEarn: "Create at least one active goal on the Goals page.",
    evaluate: (data) => {
      const n = data.goals.length;
      const unlocked = n >= 1;
      return {
        unlocked,
        earnedDetail: unlocked ? `You have ${n} active goal${n === 1 ? "" : "s"}.` : null,
        lockedHint: unlocked ? undefined : "No active goals yet.",
      };
    },
  },
  {
    id: "healthy_dti",
    title: "Healthy debt load",
    description: "Keep debt manageable",
    icon: "Shield",
    howToEarn: "Bring debt-to-income ratio under 20% (lower debt or higher income in your snapshot helps).",
    evaluate: (data) => {
      const frac = dtiAsFraction(data.debtToIncomeRatio);
      const unlocked = frac < 0.2;
      const pct = (frac * 100).toFixed(1);
      return {
        unlocked,
        earnedDetail: unlocked ? `Debt-to-income ratio is ${pct}%.` : null,
        lockedHint: unlocked ? undefined : `DTI is ${pct}% — need under 20%.`,
      };
    },
  },
];

/**
 * Derives badge unlock state from tracked profile, transactions, goals, and streak.
 */
export function computeBadges(data: UserData): Achievement[] {
  return RULES.map((rule) => {
    const ev = rule.evaluate(data);
    return {
      id: rule.id,
      title: rule.title,
      description: rule.description,
      icon: rule.icon,
      unlocked: ev.unlocked,
      howToEarn: rule.howToEarn,
      earnedDetail: ev.earnedDetail,
      lockedHint: ev.unlocked ? null : ev.lockedHint ?? null,
    };
  });
}
