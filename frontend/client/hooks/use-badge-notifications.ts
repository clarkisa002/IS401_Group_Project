import { useEffect, useRef } from "react";
import { toast } from "sonner";
import type { Achievement } from "@/lib/types";

const SEEN_KEY = "badge-notifications-seen";

function getSeenIds(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function markSeen(ids: string[]) {
  const current = getSeenIds();
  for (const id of ids) current.add(id);
  localStorage.setItem(SEEN_KEY, JSON.stringify([...current]));
}

/**
 * Fires a sonner toast for each badge that just became unlocked and hasn't
 * been toasted before (tracked in localStorage so it's once-per-device).
 */
export function useBadgeNotifications(achievements: Achievement[] | undefined) {
  const initialised = useRef(false);

  useEffect(() => {
    if (!achievements?.length) return;

    if (!initialised.current) {
      initialised.current = true;
      const seen = getSeenIds();
      if (seen.size === 0) {
        markSeen(achievements.filter((a) => a.unlocked).map((a) => a.id));
      }
      return;
    }

    const seen = getSeenIds();
    const newlyUnlocked = achievements.filter((a) => a.unlocked && !seen.has(a.id));
    if (newlyUnlocked.length === 0) return;

    markSeen(newlyUnlocked.map((a) => a.id));

    for (const badge of newlyUnlocked) {
      toast.success(`Badge unlocked: ${badge.title}`, {
        description: badge.earnedDetail ?? badge.description,
        duration: 5000,
      });
    }
  }, [achievements]);
}
