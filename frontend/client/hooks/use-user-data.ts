import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UserData, DEMO_DATA } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { fetchUserData } from "@/lib/supabase-data";
import { computeBadges } from "@/lib/badges";

export const USER_DATA_QUERY_KEY = ["userData"] as const;

export function useUserData() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: supabaseData,
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: [...USER_DATA_QUERY_KEY, user?.user_id ?? "anon"],
    queryFn: () =>
      user ? fetchUserData(user.user_id, user.name) : Promise.resolve(DEMO_DATA),
    enabled: true,
    placeholderData: user ? undefined : DEMO_DATA,
  });

  const base: UserData | null =
    supabaseData && user
      ? { ...supabaseData, name: user.name }
      : supabaseData ?? (user ? null : DEMO_DATA);

  const data: UserData | null = base ? { ...base, achievements: computeBadges(base) } : null;

  const loading = isLoading;

  const refreshData = () => {
    void refetch();
  };

  const exportData = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "home-readiness-data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const invalidateUserData = () => {
    void queryClient.invalidateQueries({ queryKey: USER_DATA_QUERY_KEY });
  };

  return {
    data: data ?? null,
    loading,
    refreshData,
    exportData,
    invalidateUserData,
    error,
  };
}
