import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Crown, Zap, Star } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

const PLANS = [
  {
    id: "free_trial",
    name: "Free Trial",
    price: "Free",
    period: "7 days",
    description: "Explore the platform with no commitment",
    icon: Zap,
    badge: null,
    highlight: false,
    features: [
      "Access all 12 resource categories",
      "Search across all 50 states",
      "AI Navigator assistant",
      "Save up to 5 resources",
      "View VA lender directory",
      "Crisis safety resources",
    ],
    cta: "Start Free Trial",
  },
  {
    id: "monthly",
    name: "Monthly",
    price: "$25",
    period: "per month",
    description: "Full access with flexible monthly billing",
    icon: Star,
    badge: null,
    highlight: false,
    features: [
      "Everything in Free Trial",
      "Unlimited saved resources",
      "Weekly & monthly email digest",
      "Resource ratings & reviews",
      "Interactive resource map",
      "CSV export of saved items",
      "Priority support",
    ],
    cta: "Get Monthly Access",
  },
  {
    id: "yearly",
    name: "Yearly",
    price: "$150",
    period: "per year",
    description: "Best value — save $150 vs monthly",
    icon: Crown,
    badge: "Best Value",
    highlight: true,
    features: [
      "Everything in Monthly",
      "2 months free vs monthly billing",
      "Early access to new features",
      "Dedicated support channel",
      "Annual resource digest report",
    ],
    cta: "Get Yearly Access",
  },
];

export function PricingSection() {
  const { isAuthenticated } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const startTrial = trpc.subscription.startTrial.useMutation({
    onSuccess: () => {
      toast.success("Your 7-day free trial has started! Welcome to ServiceSource Connect.");
      window.location.href = "/dashboard";
    },
    onError: (err) => {
      toast.error(err.message || "Could not start trial. Please try again.");
      setLoadingPlan(null);
    },
  });

  const createCheckout = trpc.subscription.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
    onError: (err) => {
      toast.error(err.message || "Could not start checkout. Please try again.");
      setLoadingPlan(null);
    },
  });

  const handlePlanClick = async (planId: string) => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    setLoadingPlan(planId);

    if (planId === "free_trial") {
      startTrial.mutate();
    } else if (planId === "monthly" || planId === "yearly") {
      createCheckout.mutate({
        plan: planId as "monthly" | "yearly",
        origin: window.location.origin,
      });
    }
  };

  return (
    <section id="pricing" className="py-20 bg-secondary/30">
      <div className="container">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-accent/20 text-accent border-accent/30">
            Simple, Transparent Pricing
          </Badge>
          <h2
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            style={{ fontFamily: "Oswald, sans-serif" }}
          >
            Choose Your Plan
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Start with a 7-day free trial — no credit card required. Upgrade anytime to unlock unlimited access.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isLoading = loadingPlan === plan.id;

            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col ${
                  plan.highlight
                    ? "border-accent shadow-lg shadow-accent/20 scale-105"
                    : "border-border"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-accent text-accent-foreground px-3 py-1 text-xs font-bold">
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-4 pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        plan.highlight ? "bg-accent/20" : "bg-primary/10"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${
                          plan.highlight ? "text-accent" : "text-primary"
                        }`}
                      />
                    </div>
                    <div>
                      <div className="font-bold text-foreground text-lg">{plan.name}</div>
                      <div className="text-xs text-muted-foreground">{plan.description}</div>
                    </div>
                  </div>

                  <div className="mt-2">
                    <span
                      className="text-4xl font-bold text-foreground"
                      style={{ fontFamily: "Oswald, sans-serif" }}
                    >
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground text-sm ml-2">{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col flex-1 gap-4">
                  <ul className="space-y-2 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full font-semibold ${
                      plan.highlight
                        ? "bg-accent text-accent-foreground hover:bg-accent/90"
                        : ""
                    }`}
                    variant={plan.highlight ? "default" : "outline"}
                    disabled={isLoading}
                    onClick={() => handlePlanClick(plan.id)}
                  >
                    {isLoading ? "Loading..." : plan.cta}
                  </Button>

                  {plan.id === "free_trial" && (
                    <p className="text-xs text-center text-muted-foreground">
                      No credit card required
                    </p>
                  )}
                  {plan.id === "yearly" && (
                    <p className="text-xs text-center text-muted-foreground">
                      Equivalent to $12.50/month
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8 max-w-lg mx-auto">
          Subscriptions auto-renew. Cancel anytime from your account settings. Payments processed securely by Stripe.
        </p>
      </div>
    </section>
  );
}
