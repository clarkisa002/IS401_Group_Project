import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Matches `Button` keyboard focus — use with `rounded-*` on the same element. */
export const focusRingClasses =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** Recharts stroke/fill values aligned with CSS theme tokens */
export const chartTheme = {
  gridStroke: "hsl(var(--border))",
  tickFill: "hsl(var(--muted-foreground))",
  series2: "hsl(var(--chart-series-2))",
} as const;
