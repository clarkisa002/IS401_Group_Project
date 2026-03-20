/**
 * Motivational quotes for home ownership readiness, organized by score range.
 * Option C: 5 ranges - 0-19, 20-39, 40-59, 60-79, 80-100
 */

export type QuoteRange = "starting" | "building" | "onTrack" | "almostThere" | "ready";

const QUOTES: Record<QuoteRange, string[]> = {
  starting: [
    "Every expert was once a beginner. Your journey to home ownership starts today.",
    "The journey of a thousand miles begins with a single step.",
    "Start where you are. Use what you have. Do what you can.",
    "You don't have to be great to start, but you have to start to be great.",
    "Small beginnings lead to big endings. Your first dollar saved matters.",
    "The best investment you can make is in yourself. Begin your savings journey now.",
    "It's never too late to start planning for your future home.",
    "Dream big, start small, act now.",
    "Your homeownership story begins with one bold decision today.",
    "The secret of getting ahead is getting started.",
  ],
  building: [
    "Progress, not perfection. Every dollar saved brings you closer.",
    "Consistency beats intensity. Keep building your savings habit.",
    "You're building more than a fund—you're building a future.",
    "Rome wasn't built in a day, and neither is a down payment.",
    "Momentum is built one month at a time. You're on your way.",
    "The foundation you're building now will support your dreams.",
    "Little by little, a little becomes a lot.",
    "Your persistence is your power. Keep going.",
    "Every month you save is a month closer to your keys.",
    "Building wealth is a marathon, not a sprint. You're in the race.",
  ],
  onTrack: [
    "The best time to plant a tree was 20 years ago. The second best time is now.",
    "You're closer than you think. Stay the course.",
    "Small steps every day add up to big results.",
    "Your dedication is paying off. Keep your eyes on the goal.",
    "Halfway there means you've already proven you can do this.",
    "The middle of the journey is where most give up. You're not most.",
    "Steady progress beats sporadic perfection.",
    "You've found your rhythm. Don't change the beat.",
    "Your future self will thank you for today's discipline.",
    "On track is the best place to be. Keep moving forward.",
  ],
  almostThere: [
    "You didn't come this far to only come this far.",
    "The finish line is in sight. One more push.",
    "Almost there isn't the same as there—but you're almost there.",
    "Stay the course. The keys are within reach.",
    "Your perseverance has brought you here. Don't stop now.",
    "The last stretch is often the hardest. You've got this.",
    "Excellence is not a destination; it's a continuous journey. You're almost home.",
    "Your patience and discipline are about to pay off.",
    "So close. Stay focused. Stay consistent.",
    "The view from the top is worth every step. Keep climbing.",
  ],
  ready: [
    "You made it. Your readiness speaks volumes.",
    "Celebrate your progress. You've earned this moment.",
    "You didn't just dream—you did the work. Well done.",
    "Your readiness score reflects your commitment. Own it.",
    "From vision to reality. You're home-buying ready.",
    "The best reward for hard work is the opportunity to do more. You're ready.",
    "You've proven that discipline and patience create results.",
    "Welcome to the finish line. You've prepared well.",
    "Your future home is waiting. You're ready to take the next step.",
    "Success is the sum of small efforts repeated day in and day out. You did it.",
  ],
};

/**
 * Maps a readiness score (0-100) to a quote range.
 * Option C: 0-19, 20-39, 40-59, 60-79, 80-100
 */
export function getQuoteRangeForScore(score: number): QuoteRange {
  const s = Math.max(0, Math.min(100, Math.round(score)));
  if (s <= 19) return "starting";
  if (s <= 39) return "building";
  if (s <= 59) return "onTrack";
  if (s <= 79) return "almostThere";
  return "ready";
}

/**
 * Returns the array of quotes for a given score range.
 */
export function getQuotesForRange(range: QuoteRange): string[] {
  return QUOTES[range];
}
