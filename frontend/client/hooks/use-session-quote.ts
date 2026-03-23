import { useState, useEffect } from "react";
import {
  getQuoteRangeForScore,
  getQuotesForRange,
  type QuoteRange,
} from "@/lib/quotes";

const SESSION_STORAGE_KEY = "home_tracker_session_quote";

interface CachedQuote {
  range: QuoteRange;
  quoteIndex: number;
}

function getCachedQuote(): CachedQuote | null {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedQuote;
    if (parsed && typeof parsed.range === "string" && typeof parsed.quoteIndex === "number") {
      return parsed;
    }
  } catch {
    // ignore parse errors
  }
  return null;
}

function setCachedQuote(cached: CachedQuote): void {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(cached));
  } catch {
    // ignore storage errors
  }
}

/**
 * Returns a quote that stays consistent for the session based on readiness score.
 * When the score changes to a different range, a new quote is picked for that range.
 */
export function useSessionQuote(readinessScore: number): string {
  const range = getQuoteRangeForScore(readinessScore);

  const [quote, setQuote] = useState<string>(() => {
    const rangeQuotes = getQuotesForRange(range);
    const cached = getCachedQuote();
    if (cached && cached.range === range) {
      const q = rangeQuotes[cached.quoteIndex];
      if (q) return q;
    }
    const index = Math.floor(Math.random() * rangeQuotes.length);
    const selected = rangeQuotes[index];
    setCachedQuote({ range, quoteIndex: index });
    return selected;
  });

  useEffect(() => {
    const rangeQuotes = getQuotesForRange(range);
    const cached = getCachedQuote();
    if (cached && cached.range === range) {
      const q = rangeQuotes[cached.quoteIndex];
      if (q) {
        setQuote(q);
        return;
      }
    }
    const index = Math.floor(Math.random() * rangeQuotes.length);
    const selected = rangeQuotes[index];
    setCachedQuote({ range, quoteIndex: index });
    setQuote(selected);
  }, [range]);

  return quote;
}
