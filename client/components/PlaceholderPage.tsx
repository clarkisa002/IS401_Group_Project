import { Layout } from "./Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Hammer } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <Layout>
      <div className="container py-24 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Hammer className="h-10 w-10" />
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="mx-auto mb-8 max-w-lg text-lg text-muted-foreground leading-relaxed">
          This feature is currently under development. Our team is working hard to bring you the best home-buying experience.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg">
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
}
