import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home, LayoutDashboard, TrendingUp, Target, PieChart } from "lucide-react";
import { cn, focusRingClasses } from "@/lib/utils";
import { useUserData } from "@/hooks/use-user-data";
import { useBadgeNotifications } from "@/hooks/use-badge-notifications";

interface LayoutProps {
  children: ReactNode;
}

const mobileNavItems = [
  { name: "Dash", path: "/dashboard", icon: LayoutDashboard },
  { name: "Progress", path: "/progress", icon: TrendingUp },
  { name: "Goals", path: "/goals", icon: Target },
  { name: "Spend", path: "/spending", icon: PieChart },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { data } = useUserData();
  useBadgeNotifications(data?.achievements);

  // Breadcrumb generator
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <div className="relative min-h-screen flex flex-col bg-background selection:bg-primary/10 selection:text-primary">
      <a
        href="#main-content"
        className="absolute -top-20 left-4 z-[100] rounded-md bg-primary px-4 py-2 text-primary-foreground shadow-lg transition-[top] duration-200 focus:top-4 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <Navbar />

      <main id="main-content" className="flex-1 pb-20 md:pb-0" tabIndex={-1}>
        {location.pathname !== "/" && (
          <div className="container py-4">
            <nav className="flex items-center space-x-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
              <Link
                to="/"
                className={cn("flex items-center rounded-sm hover:text-primary transition-colors", focusRingClasses)}
                aria-label="Home"
              >
                <Home className="h-4 w-4" aria-hidden />
              </Link>
              {pathnames.length > 0 && <ChevronRight className="h-4 w-4" aria-hidden />}
              {pathnames.map((value, index) => {
                const last = index === pathnames.length - 1;
                const to = `/${pathnames.slice(0, index + 1).join("/")}`;
                const label = value.charAt(0).toUpperCase() + value.slice(1);

                return last ? (
                  <span key={to} className="font-semibold text-foreground">
                    {label}
                  </span>
                ) : (
                  <div key={to} className="flex items-center space-x-2">
                    <Link to={to} className={cn("rounded-sm hover:text-primary transition-colors", focusRingClasses)}>
                      {label}
                    </Link>
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </div>
                );
              })}
            </nav>
          </div>
        )}
        {children}
      </main>

      {/* Mobile Quick-Access Bottom Bar */}
      <nav className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border bg-background/80 p-1.5 shadow-2xl backdrop-blur-md md:hidden" aria-label="Mobile navigation">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full transition-all",
                focusRingClasses,
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
              aria-label={`${item.name}${isActive ? " (current page)" : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-5 w-5" aria-hidden />
            </Link>
          );
        })}
      </nav>

      <footer className="border-t bg-card/50 py-12 hidden md:block">
        <div className="container grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Home className="h-5 w-5" />
              </div>
              <span className="font-bold text-lg">HomePath</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your personal guide to home ownership. Track your finances, set goals, and achieve the dream of owning your home.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground/80">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/dashboard" className={cn("rounded-sm hover:text-primary transition-colors", focusRingClasses)}>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/progress" className={cn("rounded-sm hover:text-primary transition-colors", focusRingClasses)}>
                  Progress Tracker
                </Link>
              </li>
              <li>
                <Link to="/goals" className={cn("rounded-sm hover:text-primary transition-colors", focusRingClasses)}>
                  Financial Goals
                </Link>
              </li>
              <li>
                <Link to="/spending" className={cn("rounded-sm hover:text-primary transition-colors", focusRingClasses)}>
                  Spending Analysis
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground/80">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/help-center" className={cn("rounded-sm hover:text-primary transition-colors", focusRingClasses)}>
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className={cn("rounded-sm hover:text-primary transition-colors", focusRingClasses)}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className={cn("rounded-sm hover:text-primary transition-colors", focusRingClasses)}>
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">Stay Motivated</h4>
            <p className="text-sm text-muted-foreground">Join 10,000+ prospective homeowners on their journey.</p>
            <div className="flex gap-2">
              <Link
                to="/dashboard"
                className={cn(
                  "inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
                  focusRingClasses
                )}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
        <div className="container mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} HomePath. All rights reserved. Built for future homeowners.
        </div>
      </footer>
    </div>
  );
}
