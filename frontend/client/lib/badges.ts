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

  // ---- Additional badges ----

  {
    id: "savings_1k",
    title: "First $1K",
    description: "Your savings journey begins",
    icon: "PiggyBank",
    howToEarn: "Save your first $1,000.",
    evaluate: (data) => {
      const t = data.savings.total;
      const unlocked = t >= 1_000;
      return {
        unlocked,
        earnedDetail: unlocked ? `Total saved: ${fmtMoney(t)}.` : null,
        lockedHint: unlocked ? undefined : `Currently ${fmtMoney(t)} — need ${fmtMoney(Math.max(0, 1_000 - t))} more.`,
      };
    },
  },
  {
    id: "savings_25k",
    title: "$25K milestone",
    description: "A serious down payment takes shape",
    icon: "PiggyBank",
    howToEarn: "Grow total savings to at least $25,000.",
    evaluate: (data) => {
      const t = data.savings.total;
      const unlocked = t >= 25_000;
      return {
        unlocked,
        earnedDetail: unlocked ? `Total saved: ${fmtMoney(t)}.` : null,
        lockedHint: unlocked ? undefined : `Currently ${fmtMoney(t)} — need ${fmtMoney(Math.max(0, 25_000 - t))} more.`,
      };
    },
  },
  {
    id: "savings_50k",
    title: "$50K saved",
    description: "Halfway to six figures",
    icon: "PiggyBank",
    howToEarn: "Grow total savings to at least $50,000.",
    evaluate: (data) => {
      const t = data.savings.total;
      const unlocked = t >= 50_000;
      return {
        unlocked,
        earnedDetail: unlocked ? `Total saved: ${fmtMoney(t)}.` : null,
        lockedHint: unlocked ? undefined : `Currently ${fmtMoney(t)} — need ${fmtMoney(Math.max(0, 50_000 - t))} more.`,
      };
    },
  },
  {
    id: "savings_100k",
    title: "Six-figure saver",
    description: "You saved $100,000!",
    icon: "Award",
    howToEarn: "Reach $100,000 in total savings.",
    evaluate: (data) => {
      const t = data.savings.total;
      const unlocked = t >= 100_000;
      return {
        unlocked,
        earnedDetail: unlocked ? `Total saved: ${fmtMoney(t)}.` : null,
        lockedHint: unlocked ? undefined : `Currently ${fmtMoney(t)} — need ${fmtMoney(Math.max(0, 100_000 - t))} more.`,
      };
    },
  },
  {
    id: "goal_complete",
    title: "Goal crushed",
    description: "Fully fund a savings goal",
    icon: "Target",
    howToEarn: "Reach 100% progress on any active goal.",
    evaluate: (data) => {
      const done = data.goals.find((g) => g.target > 0 && g.current >= g.target);
      return {
        unlocked: !!done,
        earnedDetail: done ? `"${done.title}" is fully funded!` : null,
        lockedHint: done ? undefined : "No goals completed yet.",
      };
    },
  },
  {
    id: "multi_goals",
    title: "Multi-tasker",
    description: "Juggle three or more goals",
    icon: "Target",
    howToEarn: "Have at least 3 active goals at once.",
    evaluate: (data) => {
      const n = data.goals.length;
      const unlocked = n >= 3;
      return {
        unlocked,
        earnedDetail: unlocked ? `You're tracking ${n} goals.` : null,
        lockedHint: unlocked ? undefined : `${n}/3 active goals.`,
      };
    },
  },
  {
    id: "goal_half",
    title: "Halfway there",
    description: "Reach 50% on any goal",
    icon: "TrendingUp",
    howToEarn: "Get any goal to at least 50% funded.",
    evaluate: (data) => {
      const half = data.goals.find((g) => g.target > 0 && g.current / g.target >= 0.5);
      return {
        unlocked: !!half,
        earnedDetail: half
          ? `"${half.title}" is ${Math.round((half.current / half.target) * 100)}% funded.`
          : null,
        lockedHint: half ? undefined : "No goal is at 50% yet.",
      };
    },
  },
  {
    id: "expense_tracker_10",
    title: "Expense pro",
    description: "Build a real spending picture",
    icon: "Receipt",
    howToEarn: "Log at least 10 expense entries.",
    evaluate: (data) => {
      const n = data.expenseTransactions.length;
      const unlocked = n >= 10;
      return {
        unlocked,
        earnedDetail: unlocked ? `${n} expenses recorded.` : null,
        lockedHint: unlocked ? undefined : `${n}/10 expenses logged.`,
      };
    },
  },
  {
    id: "income_5",
    title: "Steady earner",
    description: "Consistent income tracking",
    icon: "Wallet",
    howToEarn: "Log at least 5 income entries.",
    evaluate: (data) => {
      const n = data.incomeTransactions.length;
      const unlocked = n >= 5;
      return {
        unlocked,
        earnedDetail: unlocked ? `${n} income entries logged.` : null,
        lockedHint: unlocked ? undefined : `${n}/5 income entries.`,
      };
    },
  },
  {
    id: "credit_good",
    title: "Good credit",
    description: "Your credit score is in great shape",
    icon: "Shield",
    howToEarn: "Have a credit score of 700 or higher in your profile.",
    evaluate: (data) => {
      const score = data.creditScore;
      const unlocked = score >= 700;
      return {
        unlocked,
        earnedDetail: unlocked ? `Credit score: ${score}.` : null,
        lockedHint: unlocked ? undefined : `Score: ${score} — need 700+.`,
      };
    },
  },
  {
    id: "credit_excellent",
    title: "Excellent credit",
    description: "Top-tier credit score",
    icon: "Award",
    howToEarn: "Reach a credit score of 750 or higher.",
    evaluate: (data) => {
      const score = data.creditScore;
      const unlocked = score >= 750;
      return {
        unlocked,
        earnedDetail: unlocked ? `Credit score: ${score}.` : null,
        lockedHint: unlocked ? undefined : `Score: ${score} — need 750+.`,
      };
    },
  },
  {
    id: "readiness_50",
    title: "Readiness 50+",
    description: "You're getting closer to home-ready",
    icon: "Zap",
    howToEarn: "Raise your readiness score to at least 50.",
    evaluate: (data) => {
      const score = data.readinessScore;
      const unlocked = score >= 50;
      return {
        unlocked,
        earnedDetail: unlocked ? `Score: ${score}/100.` : null,
        lockedHint: unlocked ? undefined : `Score: ${score}/100 — need 50+.`,
      };
    },
  },
  {
    id: "readiness_90",
    title: "Almost there!",
    description: "Readiness score above 90",
    icon: "Award",
    howToEarn: "Push your readiness score to 90 or higher — you're nearly home-ready!",
    evaluate: (data) => {
      const score = data.readinessScore;
      const unlocked = score >= 90;
      return {
        unlocked,
        earnedDetail: unlocked ? `Score: ${score}/100.` : null,
        lockedHint: unlocked ? undefined : `Score: ${score}/100 — need 90+.`,
      };
    },
  },
  {
    id: "streak_12",
    title: "Year-long streak",
    description: "A full year of consistent saving",
    icon: "Flame",
    howToEarn: "Save for 12 consecutive months.",
    evaluate: (data) => {
      const s = data.streak;
      const unlocked = s >= 12;
      return {
        unlocked,
        earnedDetail: unlocked ? `Current streak: ${s} months.` : null,
        lockedHint: unlocked ? undefined : `Streak: ${s}/12 months.`,
      };
    },
  },
  {
    id: "debt_free",
    title: "Debt free",
    description: "Zero debt on the books",
    icon: "Shield",
    howToEarn: "Bring your total debt to $0 in your financial snapshot.",
    evaluate: (data) => {
      const unlocked = data.debt <= 0;
      return {
        unlocked,
        earnedDetail: unlocked ? "You have no recorded debt!" : null,
        lockedHint: unlocked ? undefined : `Current debt: ${fmtMoney(data.debt)}.`,
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
