import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import {
  Shield,
  Home,
  Heart,
  Brain,
  Baby,
  GraduationCap,
  Briefcase,
  Building,
  Scale,
  DollarSign,
  Utensils,
  Users,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
} from "lucide-react";

const MILITARY_STATUSES = [
  { value: "active_duty", label: "Active Duty", description: "Currently serving in the U.S. Armed Forces" },
  { value: "guard_reserve", label: "National Guard / Reserve", description: "Serving in Guard or Reserve component" },
  { value: "transitioning", label: "Transitioning", description: "Currently separating or recently separated" },
  { value: "veteran", label: "Veteran", description: "Honorably discharged from military service" },
  { value: "spouse_caregiver", label: "Spouse / Caregiver", description: "Military spouse or family caregiver" },
];

const INCOME_BANDS = [
  { value: "under_25k", label: "Under $25,000" },
  { value: "25k_50k", label: "$25,000 – $50,000" },
  { value: "50k_75k", label: "$50,000 – $75,000" },
  { value: "75k_100k", label: "$75,000 – $100,000" },
  { value: "over_100k", label: "Over $100,000" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

const DISABILITY_BANDS = [
  { value: "none", label: "No disability rating" },
  { value: "10_30", label: "10% – 30%" },
  { value: "40_60", label: "40% – 60%" },
  { value: "70_90", label: "70% – 90%" },
  { value: "100", label: "100% (P&T)" },
  { value: "unknown", label: "Unknown / Pending" },
];

const CATEGORIES = [
  { slug: "housing", label: "Housing", icon: Home },
  { slug: "healthcare", label: "Healthcare", icon: Heart },
  { slug: "mental-health", label: "Mental Health", icon: Brain },
  { slug: "childcare", label: "Childcare", icon: Baby },
  { slug: "education", label: "Education", icon: GraduationCap },
  { slug: "employment", label: "Employment", icon: Briefcase },
  { slug: "benefits", label: "Benefits", icon: Shield },
  { slug: "va-loans", label: "VA Home Loans", icon: Building },
  { slug: "legal", label: "Legal", icon: Scale },
  { slug: "financial", label: "Financial", icon: DollarSign },
  { slug: "food", label: "Food & Nutrition", icon: Utensils },
  { slug: "community", label: "Community", icon: Users },
];

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY"
];

const STATE_NAMES: Record<string, string> = {
  AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",CO:"Colorado",
  CT:"Connecticut",DE:"Delaware",FL:"Florida",GA:"Georgia",HI:"Hawaii",ID:"Idaho",
  IL:"Illinois",IN:"Indiana",IA:"Iowa",KS:"Kansas",KY:"Kentucky",LA:"Louisiana",
  ME:"Maine",MD:"Maryland",MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",MS:"Mississippi",
  MO:"Missouri",MT:"Montana",NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",NJ:"New Jersey",
  NM:"New Mexico",NY:"New York",NC:"North Carolina",ND:"North Dakota",OH:"Ohio",
  OK:"Oklahoma",OR:"Oregon",PA:"Pennsylvania",RI:"Rhode Island",SC:"South Carolina",
  SD:"South Dakota",TN:"Tennessee",TX:"Texas",UT:"Utah",VT:"Vermont",VA:"Virginia",
  WA:"Washington",WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming"
};

export default function Intake() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const [form, setForm] = useState({
    militaryStatus: "" as any,
    zip: "",
    state: "" as any,
    householdSize: 1,
    dependentsCount: 0,
    incomeBand: "" as any,
    vaEligible: "" as any,
    disabilityRatingBand: "" as any,
    preferredContact: "email" as any,
    needsCategories: [] as string[],
  });

  const profileQuery = trpc.profile.get.useQuery(undefined, { enabled: isAuthenticated });
  const updateProfile = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success("Profile saved! Loading your dashboard...");
      navigate("/dashboard");
    },
    onError: (err) => toast.error(err.message),
  });

  // Pre-fill from existing profile
  useEffect(() => {
    if (profileQuery.data) {
      const p = profileQuery.data;
      setForm({
        militaryStatus: p.militaryStatus ?? "",
        zip: p.zip ?? "",
        state: p.state ?? "",
        householdSize: p.householdSize ?? 1,
        dependentsCount: p.dependentsCount ?? 0,
        incomeBand: p.incomeBand ?? "",
        vaEligible: p.vaEligible ?? "",
        disabilityRatingBand: p.disabilityRatingBand ?? "",
        preferredContact: p.preferredContact ?? "email",
        needsCategories: (p.needsCategories as string[]) ?? [],
      });
    }
  }, [profileQuery.data]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to complete your profile and access personalized resources.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => (window.location.href = getLoginUrl())}>
              Sign In to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const toggleCategory = (slug: string) => {
    setForm((prev) => ({
      ...prev,
      needsCategories: prev.needsCategories.includes(slug)
        ? prev.needsCategories.filter((c) => c !== slug)
        : [...prev.needsCategories, slug],
    }));
  };

  const handleSubmit = () => {
    if (!form.militaryStatus) {
      toast.error("Please select your military status.");
      setStep(1);
      return;
    }
    if (form.needsCategories.length === 0) {
      toast.error("Please select at least one area you need support in.");
      return;
    }
    updateProfile.mutate({
      ...form,
      intakeCompleted: true,
    });
  };

  const progressPct = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="container max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "Oswald, sans-serif" }}>
            {profileQuery.data?.intakeCompleted ? "Update Your Profile" : "Complete Your Profile"}
          </h1>
          <p className="text-muted-foreground">
            Step {step} of {totalSteps} — This information helps us find resources matched to your situation.
          </p>
          {/* Progress bar */}
          <div className="mt-4 h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-6 md:p-8">
            {/* Step 1: Military Status */}
            {step === 1 && (
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-6">What best describes your military connection?</h2>
                <div className="grid gap-3">
                  {MILITARY_STATUSES.map((status) => (
                    <button
                      key={status.value}
                      onClick={() => setForm((p) => ({ ...p, militaryStatus: status.value }))}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        form.militaryStatus === status.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div className="font-semibold text-foreground">{status.label}</div>
                      <div className="text-sm text-muted-foreground mt-0.5">{status.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Location & Household */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground">Location & Household</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      placeholder="e.g. 78201"
                      maxLength={10}
                      value={form.zip}
                      onChange={(e) => setForm((p) => ({ ...p, zip: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <select
                      id="state"
                      value={form.state}
                      onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
                      className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Select state</option>
                      {US_STATES.map((s) => (
                        <option key={s} value={s}>{STATE_NAMES[s]} ({s})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="household">Household Size</Label>
                    <Input
                      id="household"
                      type="number"
                      min={1}
                      max={20}
                      value={form.householdSize}
                      onChange={(e) => setForm((p) => ({ ...p, householdSize: parseInt(e.target.value) || 1 }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dependents">Number of Dependents</Label>
                    <Input
                      id="dependents"
                      type="number"
                      min={0}
                      max={20}
                      value={form.dependentsCount}
                      onChange={(e) => setForm((p) => ({ ...p, dependentsCount: parseInt(e.target.value) || 0 }))}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Annual Household Income</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {INCOME_BANDS.map((band) => (
                      <button
                        key={band.value}
                        onClick={() => setForm((p) => ({ ...p, incomeBand: band.value }))}
                        className={`p-3 rounded-lg border text-sm text-left transition-all ${
                          form.incomeBand === band.value
                            ? "border-primary bg-primary/5 font-medium"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        {band.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>VA Eligibility</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {[
                      { value: "yes", label: "Yes" },
                      { value: "no", label: "No" },
                      { value: "unsure", label: "Unsure" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setForm((p) => ({ ...p, vaEligible: opt.value }))}
                        className={`p-3 rounded-lg border text-sm transition-all ${
                          form.vaEligible === opt.value
                            ? "border-primary bg-primary/5 font-medium"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Disability Rating (if applicable)</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {DISABILITY_BANDS.map((band) => (
                      <button
                        key={band.value}
                        onClick={() => setForm((p) => ({ ...p, disabilityRatingBand: band.value }))}
                        className={`p-3 rounded-lg border text-sm text-left transition-all ${
                          form.disabilityRatingBand === band.value
                            ? "border-primary bg-primary/5 font-medium"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        {band.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    This information helps us surface relevant disability-related benefits. We do not store medical records.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Needs Selection */}
            {step === 3 && (
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  What areas do you need support in?
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Select all that apply. You can update this at any time from your profile.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {CATEGORIES.map((cat) => {
                    const selected = form.needsCategories.includes(cat.slug);
                    return (
                      <button
                        key={cat.slug}
                        onClick={() => toggleCategory(cat.slug)}
                        className={`relative p-4 rounded-lg border-2 flex flex-col items-center gap-2 text-center transition-all ${
                          selected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        {selected && (
                          <CheckCircle className="absolute top-2 right-2 h-4 w-4 text-primary" />
                        )}
                        <cat.icon className={`h-6 w-6 ${selected ? "text-primary" : "text-muted-foreground"}`} />
                        <span className={`text-xs font-medium ${selected ? "text-primary" : "text-foreground"}`}>
                          {cat.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {form.needsCategories.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {form.needsCategories.map((slug) => {
                      const cat = CATEGORIES.find((c) => c.slug === slug);
                      return cat ? (
                        <Badge key={slug} variant="secondary" className="text-xs">
                          {cat.label}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setStep((s) => s - 1)}
                disabled={step === 1}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              {step < totalSteps ? (
                <Button
                  onClick={() => {
                    if (step === 1 && !form.militaryStatus) {
                      toast.error("Please select your military status.");
                      return;
                    }
                    setStep((s) => s + 1);
                  }}
                  className="gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={updateProfile.isPending}
                  className="gap-2 bg-primary"
                >
                  {updateProfile.isPending ? "Saving..." : "Save & View Dashboard"}
                  <CheckCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          We do not collect Social Security numbers, medical records, or detailed trauma history.
          Your information is used only to match you with relevant resources.
        </p>
      </div>
    </div>
  );
}
