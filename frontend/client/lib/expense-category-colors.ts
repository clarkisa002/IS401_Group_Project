const CATEGORY_COLORS: Record<string, string> = {
  "Rent/Housing": "#3b82f6",
  "Food & Dining": "#10b981",
  "Transportation": "#f59e0b",
  "Entertainment/Fun": "#8b5cf6",
  "Utilities": "#ec4899",
  "Other": "#6b7280",
};

const DEFAULT_CATEGORY_COLOR = "#6b7280";

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? DEFAULT_CATEGORY_COLOR;
}
