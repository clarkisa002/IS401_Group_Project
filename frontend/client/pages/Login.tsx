import { FormEvent, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Home, Lock } from "lucide-react";

interface LocationState {
  from?: {
    pathname: string;
  };
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      const redirectTo = state.from?.pathname || "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <section className="flex min-h-[70vh] items-center justify-center py-12">
        <div className="container max-w-md">
          <Card className="border border-border/60 shadow-xl shadow-primary/5">
            <CardHeader className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Lock className="h-3.5 w-3.5" />
                Secure access to your home journey
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Sign in to HomePath</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Sign in with your account. See README for test credentials.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {error && (
                  <p className="text-sm font-medium text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
                    {error}
                  </p>
                )}
                <Button type="submit" className="w-full h-11" disabled={submitting}>
                  {submitting ? "Signing you in..." : "Continue to dashboard"}
                </Button>
              </form>

              <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Home className="h-3.5 w-3.5" />
                  <span>Use seeded test accounts (see README) or create your own.</span>
                </div>
                <Link to="/" className="font-medium text-primary hover:underline">
                  Back home
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}

