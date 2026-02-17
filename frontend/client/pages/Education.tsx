import { Layout } from "@/components/Layout";
import { 
  GraduationCap, 
  BookOpen, 
  Video, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  ChevronRight,
  Lightbulb,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

export default function EducationPage() {
  const articles = [
    { title: "Mortgage Basics: Fixed vs. Variable Rates", type: "Guide", readTime: "5 min", url: "#" },
    { title: "How Much Down Payment Do You Really Need?", type: "Analysis", readTime: "8 min", url: "#" },
    { title: "Understanding Closing Costs in 2024", type: "Explainer", readTime: "6 min", url: "#" },
    { title: "First-Time Home Buyer Tax Credits", type: "Resource", readTime: "4 min", url: "#" },
  ];

  const glossaryTerms = [
    { term: "DTI (Debt-to-Income)", definition: "A personal finance measure that compares an individual's monthly debt payment to their monthly gross income." },
    { term: "Escrow", definition: "A legal arrangement in which a third party temporarily holds money or property until a particular condition has been met." },
    { term: "PMI (Private Mortgage Insurance)", definition: "An insurance policy that protects lenders against loss if a borrower defaults on a conventional mortgage." },
    { term: "Amortization", definition: "The process of spreading out a loan into a series of fixed payments over time." },
  ];

  return (
    <Layout>
      <div className="container py-8 space-y-12">
        <header className="max-w-2xl">
          <Badge className="mb-4 bg-primary/10 text-primary border-none font-bold">Knowledge Center</Badge>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">Financial Literacy for Future Homeowners</h1>
          <p className="text-xl text-muted-foreground">Master the home-buying process with our curated guides, video tutorials, and financial tools.</p>
        </header>

        {/* Featured Video Section */}
        <section className="grid gap-8 lg:grid-cols-3">
          <Card className="lg:col-span-2 overflow-hidden border-none shadow-2xl">
            <div className="aspect-video relative bg-slate-900 flex items-center justify-center group cursor-pointer">
              <img 
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1073" 
                alt="Home buying tutorial" 
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center transition-transform group-hover:scale-110">
                  <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-white shadow-xl">
                    <Video className="h-8 w-8 fill-current ml-1" />
                  </div>
                </div>
                <span className="text-white font-bold text-lg drop-shadow-md">Master Class: Your First Home</span>
              </div>
            </div>
          </Card>
          
          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Quick Literacy Tips
            </h3>
            <div className="space-y-4">
              {[
                "Save at least 3-6 months of expenses for an emergency fund before buying.",
                "Check your credit report 12 months before applying for a mortgage.",
                "Get pre-approved, not just pre-qualified, to strengthen your offer.",
                "Factor in property taxes and insurance into your monthly budget."
              ].map((tip, i) => (
                <div key={i} className="flex gap-3 p-4 rounded-xl bg-card border shadow-sm transition-all hover:border-primary/50">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Articles & Guides */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              Recommended Reading
            </h2>
            <Button variant="ghost" className="gap-2">
              Browse all articles <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {articles.map((article, i) => (
              <Card key={i} className="group hover:shadow-lg transition-all cursor-pointer">
                <CardHeader className="p-4 pb-2">
                  <Badge variant="secondary" className="w-fit mb-2">{article.type}</Badge>
                  <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                    <span>{article.readTime} read</span>
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Glossary of Terms */}
        <section className="bg-slate-50 rounded-[2rem] p-8 md:p-12">
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Mortgage Glossary</h2>
              <p className="text-muted-foreground leading-relaxed">
                The home-buying world is full of jargon. We've simplified the most common terms to help you navigate your conversations with lenders and agents.
              </p>
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search definitions..." className="pl-10 bg-white" />
              </div>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              {glossaryTerms.map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-b-slate-200">
                  <AccordionTrigger className="text-left font-bold hover:no-underline hover:text-primary">
                    {item.term}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {item.definition}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA Section */}
        <Card className="bg-primary text-primary-foreground overflow-hidden relative border-none shadow-xl">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <GraduationCap className="h-32 w-32 rotate-12" />
          </div>
          <CardContent className="p-12 flex flex-col items-center text-center space-y-6 relative z-10">
            <h2 className="text-3xl font-bold">Ready to take the next step?</h2>
            <p className="max-w-xl text-primary-foreground/80 text-lg">
              Join our weekly webinar on "Winning the Home-Buying Game in 2024" and get your questions answered by experts.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary" className="h-12 px-8 font-bold">Register for Webinar</Button>
              <Button size="lg" variant="outline" className="h-12 px-8 font-bold border-white/20 hover:bg-white/10">Download Buyer's Checklist</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
