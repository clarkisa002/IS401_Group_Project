import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { UserDataPageShell, useRequiredUserData } from "@/components/UserDataPageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Trophy,
  Target,
  TrendingUp,
  Zap,
  PiggyBank,
  Wallet,
  Receipt,
  Award,
  Shield,
  Flame,
  Lock,
} from "lucide-react";
import type { AchievementIcon } from "@/lib/types";

const ICON_MAP: Record<AchievementIcon, React.ElementType> = {
  Target,
  TrendingUp,
  Zap,
  PiggyBank,
  Wallet,
  Receipt,
  Award,
  Shield,
  Flame,
};

function AchievementsContent() {
  const data = useRequiredUserData();

  const achievements = data.achievements;
  const unlocked = achievements.filter((a) => a.unlocked);
  const locked = achievements.filter((a) => !a.unlocked);

  return (
    <>
      <div className="container py-8 space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Trophy className="h-8 w-8 text-primary" />
            Achievements
          </h1>
          <p className="text-muted-foreground">
            Earn badges by saving money, reaching goals, and building healthy financial habits.
            {achievements.length > 0 && (
              <> {unlocked.length} of {achievements.length} unlocked.</>
            )}
          </p>
        </header>

        {unlocked.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Earned</CardTitle>
              <CardDescription>
                Badges you&apos;ve already unlocked — nice work!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {unlocked.map((badge) => {
                  const Icon = ICON_MAP[badge.icon] ?? Award;
                  return (
                    <div
                      key={badge.id}
                      className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/40"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">{badge.title}</p>
                        <p className="text-sm text-muted-foreground">{badge.description}</p>
                        {badge.earnedDetail && (
                          <p className="mt-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                            {badge.earnedDetail}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {locked.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{unlocked.length > 0 ? "Not yet earned" : "Available badges"}</CardTitle>
              <CardDescription>
                Here&apos;s what you can work towards.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {locked.map((badge) => (
                  <div
                    key={badge.id}
                    className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <Lock className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{badge.title}</p>
                      <p className="text-sm text-muted-foreground">{badge.howToEarn}</p>
                      {badge.lockedHint && (
                        <p className="mt-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                          {badge.lockedHint}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {achievements.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
              <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
                No badges are defined for your profile yet. As you use the app (savings, goals, spending), badges will
                appear here when you meet each milestone.
              </p>
              <Button type="button" variant="secondary" asChild>
                <Link to="/dashboard">Back to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

export default function Achievements() {
  return (
    <Layout>
      <UserDataPageShell>
        <AchievementsContent />
      </UserDataPageShell>
    </Layout>
  );
}
