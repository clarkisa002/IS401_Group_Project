import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, AlertTriangle, Scale } from "lucide-react";

export default function TermsOfService() {
  const sections = [
    {
      icon: CheckCircle,
      title: "Acceptance",
      content: "By accessing or using HomePath, you agree to these Terms of Service. If you do not agree, please do not use the service.",
    },
    {
      icon: FileText,
      title: "Use of Service",
      content: "HomePath provides tools to help you track finances and plan for home ownership. You agree to use the service only for lawful purposes and in accordance with these terms. You must be at least 18 years old to use the service.",
    },
    {
      icon: AlertTriangle,
      title: "User Responsibilities",
      content: "You are responsible for the accuracy of the data you enter. You must keep your account credentials secure. Do not share your account or use the service to violate any laws or infringe on others' rights.",
    },
    {
      icon: Scale,
      title: "Limitation of Liability",
      content: "HomePath is provided as-is for informational purposes. We do not provide financial, legal, or tax advice. You should consult qualified professionals for such advice. We are not liable for any decisions you make based on the service.",
    },
  ];

  return (
    <Layout>
      <div className="container py-8 space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}. The rules and guidelines for using HomePath.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              Please read these Terms of Service carefully before using HomePath. Your use of the service constitutes acceptance of these terms.
            </CardDescription>
          </CardHeader>
        </Card>

        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.title}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
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
