import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { useUserData } from "@/hooks/use-user-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCircle2, Mail, Gauge } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const { data } = useUserData();

  const displayName = user?.name || data?.name || "Guest User";
  const displayEmail = user?.email || "No email available";
  const readinessScore = data?.readinessScore ?? 0;

  return (
    <Layout>
      <div className="container py-8 space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">User Settings</h1>
          <p className="text-muted-foreground">
            Manage your account details and view personalized profile information.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              This data is connected to your authenticated account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <UserCircle2 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Full name</p>
                <p className="text-sm font-semibold">{displayName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Email</p>
                <p className="text-sm font-semibold">{displayEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Gauge className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Readiness score</p>
                <p className="text-sm font-semibold">{readinessScore}/100</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
