import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Crown, CheckCircle, AlertCircle, Clock, CreditCard, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Link } from "wouter";

const STATUS_LABELS: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  trialing: { label: "Free Trial Active", color: "bg-blue-100 text-blue-800", icon: Clock },
  active: { label: "Active", color: "bg-green-100 text-green-800", icon: CheckCircle },
  canceled: { label: "Canceled", color: "bg-gray-100 text-gray-700", icon: AlertCircle },
  past_due: { label: "Payment Past Due", color: "bg-red-100 text-red-800", icon: AlertCircle },
  none: { label: "No Subscription", color: "bg-gray-100 text-gray-700", icon: AlertCircle },
};

const PLAN_LABELS: Record<string, string> = {
  free_trial: "Free Trial",
  monthly: "Monthly ($25/mo)",
  yearly: "Yearly ($150/yr)",
};

export default function SubscriptionManage() {
  const { isAuthenticated } = useAuth();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const statusQuery = trpc.subscription.getStatus.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createCheckout = trpc.subscription.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
    onError: (err) => {
      toast.error(err.message || "Could not start checkout.");
      setLoadingAction(null);
    },
  });

  const createPortal = trpc.subscription.billingPortal.useMutation({
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
    onError: (err) => {
      toast.error(err.message || "Could not open billing portal.");
      setLoadingAction(null);
    },
  });

  const startTrial = trpc.subscription.startTrial.useMutation({
    onSuccess: () => {
      toast.success("Your 7-day free trial has started!");
      statusQuery.refetch();
      setLoadingAction(null);
    },
    onError: (err) => {
      toast.error(err.message || "Could not start trial.");
      setLoadingAction(null);
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Crown className="h-12 w-12 text-accent mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground mb-6">
              Please sign in to manage your subscription.
            </p>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sub = statusQuery.data;
  const statusInfo = STATUS_LABELS[sub?.status ?? "none"];
  const StatusIcon = statusInfo?.icon ?? AlertCircle;

  const handleUpgrade = (plan: "monthly" | "yearly") => {
    setLoadingAction(`upgrade_${plan}`);
    createCheckout.mutate({ plan, origin: window.location.origin });
  };

  const handleBillingPortal = () => {
    setLoadingAction("portal");
    createPortal.mutate({ origin: window.location.origin });
  };

  const handleStartTrial = () => {
    setLoadingAction("trial");
    startTrial.mutate();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div
        className="py-12"
        style={{
          background: "linear-gradient(135deg, oklch(0.22 0.08 250) 0%, oklch(0.18 0.06 250) 100%)",
        }}
      >
        <div className="container">
          <Link href="/dashboard" className="text-white/60 hover:text-white text-sm mb-4 inline-flex items-center gap-1">
            ← Back to Dashboard
          </Link>
          <h1
            className="text-3xl md:text-4xl font-bold text-white mt-2"
            style={{ fontFamily: "Oswald, sans-serif" }}
          >
            Subscription & Billing
          </h1>
          <p className="text-white/70 mt-2">Manage your ServiceSource Connect plan</p>
        </div>
      </div>

      <div className="container py-10 max-w-3xl">
        {/* Current Status Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-accent" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statusQuery.isLoading ? (
              <div className="h-16 bg-muted animate-pulse rounded" />
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={statusInfo?.color}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusInfo?.label}
                    </Badge>
                  </div>
                  <div className="text-lg font-semibold text-foreground">
                    {PLAN_LABELS[sub?.plan ?? ""] ?? "No active plan"}
                  </div>
                  {sub?.trialEndsAt && sub.status === "trialing" && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Trial ends: {new Date(sub.trialEndsAt).toLocaleDateString()}
                    </div>
                  )}
                  {sub?.subscriptionEndsAt && sub.status === "active" && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Renews: {new Date(sub.subscriptionEndsAt).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  {sub?.hasStripe && (
                    <Button
                      variant="outline"
                      onClick={handleBillingPortal}
                      disabled={loadingAction === "portal"}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      {loadingAction === "portal" ? "Loading..." : "Manage Billing"}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upgrade Options */}
        {(!sub || sub.status === "none" || sub.status === "canceled" || sub.status === "trialing") && (
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4">
              {sub?.status === "trialing" ? "Upgrade Before Your Trial Ends" : "Choose a Plan"}
            </h2>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {/* Monthly */}
              <Card className="border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  <div className="font-bold text-foreground text-lg mb-1">Monthly</div>
                  <div className="text-3xl font-bold text-foreground mb-1" style={{ fontFamily: "Oswald, sans-serif" }}>
                    $25 <span className="text-sm font-normal text-muted-foreground">/month</span>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                    <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-green-500" /> Unlimited saved resources</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-green-500" /> Email digest</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-green-500" /> Interactive map</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-green-500" /> Priority support</li>
                  </ul>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => handleUpgrade("monthly")}
                    disabled={loadingAction === "upgrade_monthly"}
                  >
                    {loadingAction === "upgrade_monthly" ? "Loading..." : "Subscribe Monthly"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              {/* Yearly */}
              <Card className="border-accent shadow-md shadow-accent/10">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-bold text-foreground text-lg">Yearly</div>
                    <Badge className="bg-accent/20 text-accent border-accent/30 text-xs">Best Value</Badge>
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-1" style={{ fontFamily: "Oswald, sans-serif" }}>
                    $150 <span className="text-sm font-normal text-muted-foreground">/year</span>
                  </div>
                  <div className="text-xs text-accent font-medium mb-3">Save $150 vs monthly billing</div>
                  <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                    <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-green-500" /> Everything in Monthly</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-green-500" /> 2 months free</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-green-500" /> Early feature access</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-green-500" /> Dedicated support</li>
                  </ul>
                  <Button
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                    onClick={() => handleUpgrade("yearly")}
                    disabled={loadingAction === "upgrade_yearly"}
                  >
                    {loadingAction === "upgrade_yearly" ? "Loading..." : "Subscribe Yearly"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {sub?.status === "none" && (
              <div className="text-center">
                <p className="text-muted-foreground text-sm mb-3">Not ready to commit? Start with a free trial.</p>
                <Button
                  variant="outline"
                  onClick={handleStartTrial}
                  disabled={loadingAction === "trial"}
                >
                  {loadingAction === "trial" ? "Starting..." : "Start 7-Day Free Trial"}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Active subscription message */}
        {sub?.status === "active" && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6 flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-green-800 mb-1">Your subscription is active</div>
                <p className="text-sm text-green-700">
                  You have full access to all ServiceSource Connect features. Use the "Manage Billing" button above to update payment methods, download invoices, or cancel your subscription.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <p className="text-xs text-center text-muted-foreground mt-8">
          Payments are processed securely by Stripe. Cancel anytime — no penalties.
        </p>
      </div>
    </div>
  );
}
