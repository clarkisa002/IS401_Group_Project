import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Target, TrendingUp, PieChart, GraduationCap, Home, Menu, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserData } from "@/hooks/use-user-data";
import { useAuth } from "@/hooks/use-auth";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Progress", path: "/progress", icon: TrendingUp },
  { name: "Goals", path: "/goals", icon: Target },
  { name: "Spending", path: "/spending", icon: PieChart },
  { name: "Education", path: "/education", icon: GraduationCap },
];

export function Navbar() {
  const location = useLocation();
  const { data } = useUserData();
  const { user, isAuthenticated, logout } = useAuth();

  const displayName = user?.name || data?.name || "Guest";
  const displayInitial = user?.name?.[0] || data?.name?.[0] || "U";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Home className="h-6 w-6" />
            </div>
            <span className="hidden font-bold sm:inline-block text-xl tracking-tight">HomePath</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
                  isActive ? "bg-accent text-primary shadow-sm" : "text-muted-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 pr-2 md:border-r">
            <div className="hidden flex-col items-end text-right md:flex">
              <span className="text-sm font-semibold leading-none">{displayName}</span>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-1">
                Score: {data?.readinessScore || 0}
              </span>
            </div>
            <Avatar className="h-10 w-10 border-2 border-primary/20 ring-2 ring-background ring-offset-2 ring-offset-primary/10">
              <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                {displayInitial}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={logout}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <Button asChild size="sm" className="text-xs">
                <Link to="/login">Sign in</Link>
              </Button>
            )}
          </div>

          <Button variant="ghost" size="icon" className="md:hidden rounded-full h-10 w-10 border border-border">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}

