import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { HelpCircle, Target, TrendingUp, Shield } from "lucide-react";

const sectionHeadingClass = "text-2xl font-semibold leading-none tracking-tight";

export default function HelpCenter() {
  const faqSections = [
    {
      icon: HelpCircle,
      id: "getting-started",
      title: "Getting Started",
      description: "Learn the basics of HomePath",
      questions: [
        { q: "How do I create an account?", a: "Click Sign Up in the navigation and follow the prompts. You can register with email or use Google sign-in." },
        { q: "What is the readiness score?", a: "Your readiness score (0–100) reflects your financial readiness for home ownership based on savings, goals, and spending habits." },
      ],
    },
    {
      icon: Target,
      id: "managing-goals",
      title: "Managing Goals",
      description: "Set and track your financial goals",
      questions: [
        { q: "How do I add a savings goal?", a: "Go to the Goals page and click Add Goal. Enter your target amount and timeline." },
        { q: "Can I edit or delete a goal?", a: "Yes. From the Goals page, you can edit or remove any goal you've created." },
      ],
    },
    {
      icon: TrendingUp,
      id: "understanding-score",
      title: "Understanding Your Score",
      description: "How we calculate your progress",
      questions: [
        { q: "What factors affect my readiness score?", a: "Savings progress, consistent saving behavior, spending patterns, and goal completion all contribute to your score." },
        { q: "How often does the score update?", a: "Your score updates when you add income, expenses, or modify your goals." },
      ],
    },
    {
      icon: Shield,
      id: "account-security",
      title: "Account & Security",
      description: "Keep your data safe",
      questions: [
        { q: "Is my financial data secure?", a: "Yes. We use industry-standard encryption and security practices to protect your information." },
        { q: "How do I reset my password?", a: "Use the password reset option on the login page or contact support for assistance." },
      ],
    },
  ];

  return (
    <Layout>
      <div className="container py-8 space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Help Center</h1>
          <p className="text-muted-foreground">
            Find answers to common questions about using HomePath.
          </p>
        </header>

        {faqSections.map((section) => {
          const Icon = section.icon;
          const headingId = `help-section-${section.id}`;
          return (
            <section key={section.id} aria-labelledby={headingId}>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                    <h2 id={headingId} className={sectionHeadingClass}>
                      {section.title}
                    </h2>
                  </div>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-4">
                    {section.questions.map((item) => (
                      <div key={item.q} className="space-y-1">
                        <dt className="font-medium text-sm">{item.q}</dt>
                        <dd className="m-0 border-l-2 border-muted pl-4 text-sm text-muted-foreground">{item.a}</dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
            </section>
          );
        })}
      </div>
    </Layout>
  );
}
