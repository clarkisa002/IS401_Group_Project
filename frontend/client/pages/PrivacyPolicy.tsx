import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Database, Lock, Mail } from "lucide-react";

export default function PrivacyPolicy() {
  const sections = [
    {
      icon: Database,
      title: "Information We Collect",
      content: "We collect information you provide when creating an account (name, email, password) and when using the app (income, expenses, savings goals, and related financial data). We also collect usage data to improve the service.",
    },
    {
      icon: Shield,
      title: "How We Use It",
      content: "Your data is used to calculate your home readiness score, display your progress, and provide personalized insights. We do not sell your personal information to third parties.",
    },
    {
      icon: Lock,
      title: "Data Security",
      content: "We implement industry-standard security measures to protect your data, including encryption in transit and at rest. Access to your information is restricted to authorized personnel and systems.",
    },
    {
      icon: Mail,
      title: "Contact",
      content: "For questions about this Privacy Policy or your personal data, please contact us at support@homepath.example.com. We will respond within a reasonable timeframe.",
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
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              HomePath is committed to protecting your privacy. This policy describes the information we collect and how we use it.
            </CardDescription>
          </CardHeader>
        </Card>

        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.title}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" aria-hidden />
                  <CardTitle>{section.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {section.content}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </Layout>
  );
}
