import { createContext, useContext, type ReactNode } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { useUserData } from "@/hooks/use-user-data";
import type { UserData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const UserDataReadyContext = createContext<UserData | null>(null);

export function useRequiredUserData(): UserData {
  const ctx = useContext(UserDataReadyContext);
  if (!ctx) {
    throw new Error("useRequiredUserData must be used inside UserDataPageShell");
  }
  return ctx;
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  return "Something went wrong while loading your data.";
}

function UserDataLoading() {
  return (
    <div
      className="container space-y-8 py-8"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading your data</span>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <Skeleton className="h-9 w-48" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-36" />
        </div>
      </div>
      <Card>
        <CardContent className="space-y-6 p-8">
          <div className="flex justify-center py-10">
            <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
          </div>
          <Skeleton className="h-52 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

function UserDataErrorView({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="container max-w-lg py-10">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" aria-hidden />
        <AlertTitle>Couldn&apos;t load your data</AlertTitle>
        <AlertDescription className="mt-2 space-y-4">
          <p className="text-sm leading-relaxed">{message}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-destructive/40 bg-background"
            onClick={() => onRetry()}
          >
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}

export function UserDataPageShell({ children }: { children: ReactNode }) {
  const { loading, error, refreshData, data } = useUserData();

  if (loading) {
    return <UserDataLoading />;
  }

  if (error) {
    return (
      <UserDataErrorView
        message={getErrorMessage(error)}
        onRetry={() => {
          void refreshData();
        }}
      />
    );
  }

  if (!data) {
    return (
      <UserDataErrorView
        message="We couldn't load your profile. Check your connection and try again."
        onRetry={() => {
          void refreshData();
        }}
      />
    );
  }

  return (
    <UserDataReadyContext.Provider value={data}>{children}</UserDataReadyContext.Provider>
  );
}
