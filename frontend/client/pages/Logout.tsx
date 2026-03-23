import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export default function Logout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    logout();
  }, [logout]);

  return (
    <Layout>
      <section className="flex min-height-[60vh] items-center justify-center py-16">
        <div className="container max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">You&apos;ve been signed out</h1>
          <p className="text-sm text-muted-foreground">
            Your session has ended. You can safely close this tab or sign back in to continue your journey toward home ownership.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button variant="outline" onClick={() => navigate("/")}>
              Back to home
            </Button>
            <Button onClick={() => navigate("/login")}>Sign back in</Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}

