import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Shield, Database, Lock, Mail } from "lucide-react";

const sectionHeadingClass = "text-2xl font-semibold leading-none tracking-tight";

export default function PrivacyPolicy() {
  const sections = [
    {
      icon: Database,
      id: "information-we-collect",
      title: "Information We Collect",
      content: "We collect information you provide when creating an account (name, email, password) and when using the app (income, expenses, savings goals, and related financial data). We also collect usage data to improve the service.",
    },
    {
      icon: Shield,
      id: "how-we-use-it",
      title: "How We Use It",
      content: "Your data is used to calculate your home readiness score, display your progress, and provide personalized insights. We do not sell your personal information to third parties.",
    },
    {
      icon: Lock,
      id: "data-security",
      title: "Data Security",
      content: "We implement industry-standard security measures to protect your data, including encryption in transit and at rest. Access to your information is restricted to authorized personnel and systems.",
    },
    {
      icon: Mail,
      id: "contact",
      title: "Contact",
      content:
        "For questions about this Privacy Policy or your personal data, contact whoever operates this deployment of the app (for example your instructor, team lead, or support channel). Response times depend on that operator.",
    },
  ];

  return (
    <Layout>
      <div className="container py-8 space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}. How we collect, use, and protect your information.
          </p>
        </header>

        <Card>
          <CardHeader>
            <h2 className={sectionHeadingClass}>Overview</h2>
            <CardDescription>
              HomePath is committed to protecting your privacy. This policy describes the information we collect and how we use it.
            </CardDescription>
          </CardHeader>
        </Card>

        {sections.map((section) => {
          const Icon = section.icon;
          const headingId = `privacy-${section.id}`;
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
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
                </CardContent>
              </Card>
            </section>
          );
        })}
      </div>
    </Layout>
  );
}
