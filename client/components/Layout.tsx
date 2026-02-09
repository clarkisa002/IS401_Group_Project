import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  
  // Breadcrumb generator
  const pathnames = location.pathname.split("/").filter((x) => x);
  
  return (
    <div className="relative min-h-screen flex flex-col bg-background selection:bg-primary/10 selection:text-primary">
      <Navbar />
      
      <main className="flex-1">
        {location.pathname !== "/" && (
          <div className="container py-4">
            <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Link to="/" className="flex items-center hover:text-primary transition-colors">
                <Home className="h-4 w-4" />
              </Link>
              {pathnames.length > 0 && <ChevronRight className="h-4 w-4" />}
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
                    <Link to={to} className="hover:text-primary transition-colors">
                      {label}
                    </Link>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                );
              })}
            </nav>
          </div>
        )}
        {children}
      </main>

      <footer className="border-t bg-card/50 py-12">
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
              <li><Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
              <li><Link to="/progress" className="hover:text-primary transition-colors">Progress Tracker</Link></li>
              <li><Link to="/goals" className="hover:text-primary transition-colors">Financial Goals</Link></li>
              <li><Link to="/spending" className="hover:text-primary transition-colors">Spending Analysis</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground/80">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/education" className="hover:text-primary transition-colors">Financial Literacy</Link></li>
              <li><button className="hover:text-primary transition-colors">Help Center</button></li>
              <li><button className="hover:text-primary transition-colors">Privacy Policy</button></li>
              <li><button className="hover:text-primary transition-colors">Terms of Service</button></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">Stay Motivated</h4>
            <p className="text-sm text-muted-foreground">Join 10,000+ prospective homeowners on their journey.</p>
            <div className="flex gap-2">
              <Link to="/dashboard" className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
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
