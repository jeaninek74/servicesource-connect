import { useAuth } from "@/_core/hooks/useAuth";
import { PricingSection } from "@/components/PricingSection";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import {
  Home as HomeIcon,
  Heart,
  Brain,
  Baby,
  GraduationCap,
  Briefcase,
  Shield,
  Building,
  Scale,
  DollarSign,
  Utensils,
  Users,
  ArrowRight,
  CheckCircle,
  Star,
  Phone,
  Zap,
  Crown,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

const categoryIcons: Record<string, React.ElementType> = {
  housing: HomeIcon,
  healthcare: Heart,
  "mental-health": Brain,
  childcare: Baby,
  education: GraduationCap,
  employment: Briefcase,
  benefits: Shield,
  "va-loans": Building,
  legal: Scale,
  financial: DollarSign,
  food: Utensils,
  community: Users,
};

const stats = [
  { value: "340+", label: "Verified Resources" },
  { value: "50", label: "States Covered" },
  { value: "30+", label: "VA Lenders" },
  { value: "12", label: "Life Categories" },
];

const testimonials = [
  {
    quote: "ServiceSource Connect helped me find housing assistance within days of transitioning out. The resources were exactly what I needed.",
    name: "Sgt. Marcus T.",
    status: "Army Veteran",
  },
  {
    quote: "As a military spouse, finding childcare and employment resources in one place saved me hours of searching. This platform truly understands our community.",
    name: "Jennifer R.",
    status: "Military Spouse",
  },
  {
    quote: "The VA loan lender directory made comparing options easy. I found a VA specialist who walked me through the entire process.",
    name: "Petty Officer Dana K.",
    status: "Navy Veteran",
  },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const categoriesQuery = trpc.resources.categories.useQuery();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      window.location.href = "/intake";
    } else {
      window.location.href = getLoginUrl();
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden py-20 md:py-32"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.22 0.08 250) 0%, oklch(0.18 0.06 250) 50%, oklch(0.14 0.04 250) 100%)",
        }}
      >
        {/* Decorative stars pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="container relative">
          <div className="max-w-3xl">
            <Badge className="mb-6 bg-accent/20 text-accent border-accent/30 text-sm px-3 py-1">
              Serving Those Who Served
            </Badge>
            <h1
              className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
              style={{ fontFamily: "Oswald, sans-serif" }}
            >
              Find the Support
              <span className="block text-accent"> You've Earned</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed max-w-2xl">
              ServiceSource Connect is a personalized options engine for active service members,
              veterans, National Guard, Reserve, and military families. Enter your profile once —
              discover resources across housing, healthcare, education, employment, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-base px-8 py-6"
                onClick={handleGetStarted}
              >
                Get Started — It's Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 font-medium text-base px-8 py-6 bg-transparent"
                asChild
              >
                <Link href="/assistant">✦ Try AI Navigator</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-white/50">
              This platform provides options, not professional advice. Always verify eligibility directly with providers.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-accent py-8">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div
                  className="text-3xl font-bold text-accent-foreground"
                  style={{ fontFamily: "Oswald, sans-serif" }}
                >
                  {stat.value}
                </div>
                <div className="text-sm text-accent-foreground/70 font-medium mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-4xl font-bold text-foreground mb-4"
              style={{ fontFamily: "Oswald, sans-serif" }}
            >
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to connect with the resources and benefits you may qualify for.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Complete Your Profile",
                description:
                  "Tell us about your military status, location, household, and what areas you need support in. Takes about 3 minutes.",
                icon: User,
              },
              {
                step: "02",
                title: "Get Personalized Results",
                description:
                  "Your dashboard shows matched resources across 12 life categories, filtered to your state and eligibility profile.",
                icon: Shield,
              },
              {
                step: "03",
                title: "Connect and Save",
                description:
                  "Contact providers directly, save resources to your list, and export to CSV for easy reference.",
                icon: CheckCircle,
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="flex items-start gap-4">
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg"
                    style={{ fontFamily: "Oswald, sans-serif" }}
                  >
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resource Categories */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-4xl font-bold text-foreground mb-4"
              style={{ fontFamily: "Oswald, sans-serif" }}
            >
              Resources Across Every Area of Life
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From housing and healthcare to education and employment — we connect you to options in 12 essential categories.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {(categoriesQuery.data ?? []).map((cat) => {
              const Icon = categoryIcons[cat.slug] ?? Shield;
              return (
                <Link key={cat.id} href={`/resources/${cat.slug}`}>
                  <Card className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group">
                    <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <span className="text-sm font-semibold text-foreground">{cat.name}</span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-4xl font-bold text-foreground mb-4"
              style={{ fontFamily: "Oswald, sans-serif" }}
            >
              Voices from Our Community
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <Card key={i} className="border-l-4 border-l-accent">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic leading-relaxed mb-4">
                    "{t.quote}"
                  </p>
                  <div>
                    <div className="font-semibold text-foreground">{t.name}</div>
                    <div className="text-sm text-muted-foreground">{t.status}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Crisis Banner */}
      <section className="py-8 bg-red-50 border-y border-red-200">
        <div className="container">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Phone className="h-6 w-6 text-red-600 flex-shrink-0" />
              <div>
                <div className="font-bold text-red-800">Veterans Crisis Line</div>
                <div className="text-sm text-red-700">
                  If you are in crisis or know someone who is, free, confidential support is available 24/7.
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 text-center">
              <a
                href="tel:988"
                className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
              >
                Call 988, Press 1
              </a>
              <a
                href="sms:838255"
                className="inline-flex items-center justify-center px-4 py-2 border border-red-600 text-red-700 rounded-lg font-medium hover:bg-red-50 transition-colors"
              >
                Text 838255
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-20"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.22 0.08 250) 0%, oklch(0.18 0.06 250) 100%)",
        }}
      >
        <div className="container text-center">
          <h2
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: "Oswald, sans-serif" }}
          >
            Ready to Find Your Options?
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            Create a free account and complete your profile to see personalized resources matched to your service history and needs.
          </p>
          <Button
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-base px-10 py-6"
            onClick={handleGetStarted}
          >
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div
                className="text-xl font-bold mb-3"
                style={{ fontFamily: "Oswald, sans-serif" }}
              >
                ServiceSource Connect
              </div>
              <p className="text-primary-foreground/60 text-sm leading-relaxed max-w-sm">
                An options engine for active service members, veterans, National Guard, Reserve, and military families. Covering all 50 states.
              </p>
              <p className="text-primary-foreground/40 text-xs mt-4">
                This platform provides options, not professional advice. Always verify eligibility directly with providers.
              </p>
            </div>
            <div>
              <div className="font-semibold mb-3 text-accent">Resources</div>
              <div className="flex flex-col gap-2 text-sm text-primary-foreground/70">
                <Link href="/resources/housing" className="hover:text-accent transition-colors">Housing</Link>
                <Link href="/resources/healthcare" className="hover:text-accent transition-colors">Healthcare</Link>
                <Link href="/resources/mental-health" className="hover:text-accent transition-colors">Mental Health</Link>
                <Link href="/resources/education" className="hover:text-accent transition-colors">Education</Link>
                <Link href="/lenders" className="hover:text-accent transition-colors">VA Lenders</Link>
              </div>
            </div>
            <div>
              <div className="font-semibold mb-3 text-accent">Platform</div>
              <div className="flex flex-col gap-2 text-sm text-primary-foreground/70">
                <Link href="/about" className="hover:text-accent transition-colors">About & FAQ</Link>
                <Link href="/privacy" className="hover:text-accent transition-colors">Privacy & Terms</Link>
                <Link href="/submit-resource" className="hover:text-accent transition-colors">Submit a Resource</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-xs text-primary-foreground/40">
            © {new Date().getFullYear()} ServiceSource Connect. In a crisis, call 988 (Press 1) or contact local emergency services.
          </div>
        </div>
      </footer>
    </div>
  );
}

function User(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
