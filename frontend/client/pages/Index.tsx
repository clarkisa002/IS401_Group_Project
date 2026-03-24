import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useUserData } from "@/hooks/use-user-data";
import { ArrowRight, Users, Lightbulb, Home, TrendingUp, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from "recharts";
import { motion, useReducedMotion } from "framer-motion";
import { cn, focusRingClasses, chartTheme } from "@/lib/utils";

export default function Index() {
  const { data } = useUserData();
  const reduceMotion = useReducedMotion();

  const chartData = data?.history.map(h => ({
    name: h.date,
    score: h.score,
  })) || [];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="container relative z-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.5 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                <span className="relative flex h-2 w-2">
                  <span
                    className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75 motion-reduce:animate-none"
                    aria-hidden
                  />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" aria-hidden />
                </span>
                Your Journey to Home Ownership
              </div>
              
              <div className="space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                  Welcome, <span className="text-primary">{data?.name || "Future Homeowner"}!</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                  Turning the dream of owning a home into a clear, actionable roadmap. Track your readiness, optimize your savings, and secure your future.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="h-14 px-8 text-lg shadow-xl shadow-primary/20">
                  <Link to="/dashboard" className="gap-2">
                    Explore Roadmap to Own <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4 sm:grid-cols-4">
                <Link
                  to="/dashboard"
                  className={cn(
                    "group flex flex-col items-center gap-3 rounded-xl p-1 text-center",
                    focusRingClasses
                  )}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-md transition-all group-hover:scale-110 group-hover:shadow-lg motion-reduce:transition-none motion-reduce:group-hover:scale-100">
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                  <span className="text-sm font-medium">Join Our Home</span>
                </Link>
                <Link
                  to="/dashboard"
                  className={cn("group flex flex-col items-center gap-3 rounded-xl p-1 text-center", focusRingClasses)}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-md transition-all group-hover:scale-110 group-hover:shadow-lg motion-reduce:transition-none motion-reduce:group-hover:scale-100">
                    <Lightbulb className="h-6 w-6 text-amber-500" />
                  </div>
                  <span className="text-sm font-medium">Why Saving Leads</span>
                </Link>
                <Link
                  to="/dashboard"
                  className={cn("group flex flex-col items-center gap-3 rounded-xl p-1 text-center", focusRingClasses)}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-md transition-all group-hover:scale-110 group-hover:shadow-lg motion-reduce:transition-none motion-reduce:group-hover:scale-100">
                    <Home className="h-6 w-6 text-emerald-500" />
                  </div>
                  <span className="text-sm font-medium">Why You Own</span>
                </Link>
                <Link
                  to="/progress"
                  className={cn("group flex flex-col items-center gap-3 rounded-xl p-1 text-center", focusRingClasses)}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-md transition-all group-hover:scale-110 group-hover:shadow-lg motion-reduce:transition-none motion-reduce:group-hover:scale-100">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium">View Progress</span>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-tr from-primary/20 via-primary/5 to-transparent blur-2xl" />
              <div className="relative rounded-3xl border bg-card/50 p-6 shadow-2xl backdrop-blur-sm sm:p-8" role="img" aria-label="Readiness trajectory chart showing your progress towards a home readiness score of 100 over time">
                <div className="mb-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-bold">Readiness Trajectory</h3>
                    <p className="text-sm text-muted-foreground">Progress towards 100 score</p>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-secondary/20 px-3 py-1 text-sm font-bold text-secondary">
                    <TrendingUp className="h-4 w-4" />
                    +12%
                  </div>
                </div>
                
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.gridStroke} />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: chartTheme.tickFill, fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis 
                        hide 
                        domain={[0, 100]}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="score" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorScore)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Stats / Info Cards */}
      <section className="py-12 bg-muted/30">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { 
                title: "Personal Readiness", 
                value: `${data?.readinessScore}/100`, 
                desc: "Your overall home-buying health",
                icon: TrendingUp,
                color: "text-blue-500",
                bg: "bg-blue-50"
              },
              { 
                title: "Savings Target", 
                value: `$${(data?.savings.total || 0).toLocaleString()}`, 
                desc: `Of $${(data?.savings.target || 0).toLocaleString()} target reached`,
                icon: Home,
                color: "text-emerald-500",
                bg: "bg-emerald-50"
              },
              { 
                title: "Active Streak", 
                value: `${data?.streak} Months`, 
                desc: "Consistent saving behavior",
                icon: Users,
                color: "text-orange-500",
                bg: "bg-orange-50"
              }
            ].map((stat, i) => (
              <Link
                key={i}
                to="/dashboard"
                className={cn(
                  "group relative rounded-2xl border bg-card p-6 transition-all hover:shadow-xl hover:-translate-y-1 motion-reduce:hover:translate-y-0 motion-reduce:transition-shadow",
                  focusRingClasses
                )}
              >
                <div className="flex items-start justify-between">
                  <div className={cn("rounded-xl p-3", stat.bg)}>
                    <stat.icon className={cn("h-6 w-6", stat.color)} />
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
                <div className="mt-4 space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
