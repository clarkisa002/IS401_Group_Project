import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Target, TrendingUp, PieChart, Home, Menu, Settings, LogOut, UserCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserData } from "@/hooks/use-user-data";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Progress", path: "/progress", icon: TrendingUp },
  { name: "Goals", path: "/goals", icon: Target },
  { name: "Spending", path: "/spending", icon: PieChart },
];

export function Navbar() {
  const location = useLocation();
  const { data } = useUserData();
  const { user, isAuthenticated, logout } = useAuth();

  const displayName = user?.name || data?.name || "Guest";
  const displayInitial = user?.name?.[0] || data?.name?.[0] || "U";
  const displayEmail = user?.email || "No email available";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80" aria-label="HomePath home">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20" aria-hidden>
              <Home className="h-6 w-6" />
            </div>
            <span className="hidden font-bold sm:inline-block text-xl tracking-tight">HomePath</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
                  isActive ? "bg-primary text-white shadow-sm" : "text-muted-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-muted-foreground")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 pr-2 md:border-r">
            <div className="hidden flex-col items-end text-right md:flex">
              <span className="text-sm font-semibold leading-none">{displayName}</span>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-1">
                Score: {data?.readinessScore || 0}
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-10 w-10 rounded-full p-0 border border-primary/20 ring-2 ring-background ring-offset-2 ring-offset-primary/10"
                    aria-label="Open user menu"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                        {displayInitial}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel className="space-y-1">
                    <p className="text-sm font-semibold leading-none">{displayName}</p>
                    <p className="text-xs font-normal text-muted-foreground">{displayEmail}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Readiness Score: {data?.readinessScore || 0}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/goals" className="cursor-pointer">
                      <Target className="mr-2 h-4 w-4" />
                      Goals
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      User Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm" className="text-xs">
                <Link to="/login">Sign in</Link>
              </Button>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 border border-border" aria-label="Open user menu">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs">
                        {displayInitial}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel className="space-y-1">
                    <p className="text-sm font-semibold leading-none">{displayName}</p>
                    <p className="text-xs font-normal text-muted-foreground">{displayEmail}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer">
                      <UserCircle2 className="mr-2 h-4 w-4" />
                      User Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 border border-border" asChild aria-label="Sign in">
                <Link to="/login">
                  <Menu className="h-5 w-5" aria-hidden />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

