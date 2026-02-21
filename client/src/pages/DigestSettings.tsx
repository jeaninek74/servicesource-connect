import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Mail,
  Bell,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Eye,
  MapPin,
} from "lucide-react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

const CATEGORY_OPTIONS = [
  { slug: "housing", label: "Housing" },
  { slug: "healthcare", label: "Healthcare" },
  { slug: "mental-health", label: "Mental Health" },
  { slug: "childcare", label: "Childcare" },
  { slug: "education", label: "Education" },
  { slug: "employment", label: "Employment" },
  { slug: "benefits", label: "Benefits" },
  { slug: "va-loans", label: "VA Loans" },
  { slug: "legal", label: "Legal" },
  { slug: "financial", label: "Financial" },
  { slug: "food", label: "Food" },
  { slug: "community", label: "Community" },
];

export default function DigestSettings() {
  const { isAuthenticated, loading } = useAuth();
  const utils = trpc.useUtils();

  const prefQuery = trpc.digest.get.useQuery(undefined, { enabled: isAuthenticated });
  const previewQuery = trpc.digest.preview.useQuery(undefined, {
    enabled: false, // only fetch on demand
  });

  const updateMutation = trpc.digest.update.useMutation({
    onSuccess: () => {
      toast.success("Digest preferences saved!");
      utils.digest.get.invalidate();
    },
    onError: () => toast.error("Failed to save preferences. Please try again."),
  });

  const [enabled, setEnabled] = useState(false);
  const [frequency, setFrequency] = useState<"weekly" | "monthly">("weekly");
  const [state, setState] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Sync form state from loaded preferences
  useEffect(() => {
    if (prefQuery.data) {
      setEnabled(prefQuery.data.enabled);
      setFrequency(prefQuery.data.frequency);
      setState(prefQuery.data.state ?? "");
      setCategories(prefQuery.data.categories ?? []);
    }
  }, [prefQuery.data]);

  const toggleCategory = (slug: string) => {
    setCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    );
  };

  const handleSave = () => {
    updateMutation.mutate({
      enabled,
      frequency,
      state: state || undefined,
      categories: categories.length > 0 ? categories : undefined,
    });
  };

  const handlePreview = () => {
    setShowPreview(true);
    previewQuery.refetch();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B2A4A]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-sm w-full mx-4">
          <CardContent className="pt-8 pb-8 text-center">
            <Mail className="w-12 h-12 text-[#1B2A4A] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#1B2A4A] mb-2">Sign In Required</h2>
            <p className="text-gray-500 text-sm mb-4">
              Sign in to manage your personalized resource digest preferences.
            </p>
            <Button asChild className="bg-[#1B2A4A] hover:bg-[#2a3f6f]">
              <a href={getLoginUrl()}>Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1B2A4A] text-white py-6">
        <div className="max-w-2xl mx-auto px-4">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-blue-200 hover:text-white text-sm mb-3 w-fit">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C8A84B] flex items-center justify-center">
              <Mail className="w-5 h-5 text-[#1B2A4A]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: "Oswald, sans-serif" }}>
                Resource Digest
              </h1>
              <p className="text-blue-200 text-sm">
                Get notified when new resources matching your needs are added
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Enable Toggle */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1B2A4A]/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-[#1B2A4A]" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Enable Digest</p>
                  <p className="text-sm text-gray-500">
                    Receive a curated list of new resources by email
                  </p>
                </div>
              </div>
              <Switch
                checked={enabled}
                onCheckedChange={setEnabled}
                className="data-[state=checked]:bg-[#1B2A4A]"
              />
            </div>
          </CardContent>
        </Card>

        {enabled && (
          <>
            {/* Frequency */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Frequency</CardTitle>
                <CardDescription>How often would you like to receive your digest?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  {(["weekly", "monthly"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFrequency(f)}
                      className={`flex-1 py-3 rounded-lg border-2 text-sm font-medium transition-colors capitalize ${
                        frequency === f
                          ? "border-[#1B2A4A] bg-[#1B2A4A]/5 text-[#1B2A4A]"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      {f === "weekly" ? "Weekly" : "Monthly"}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* State Filter */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  State Filter
                </CardTitle>
                <CardDescription>
                  Only show resources from a specific state (leave blank for national)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={state || "all"} onValueChange={(v) => setState(v === "all" ? "" : v)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All States" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States (National)</SelectItem>
                    {US_STATES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Category Filter */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Categories</CardTitle>
                <CardDescription>
                  Select which resource types to include (leave all unselected for all categories)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_OPTIONS.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => toggleCategory(cat.slug)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        categories.includes(cat.slug)
                          ? "bg-[#1B2A4A] text-white border-[#1B2A4A]"
                          : "bg-white text-gray-600 border-gray-200 hover:border-[#1B2A4A]/40"
                      }`}
                    >
                      {categories.includes(cat.slug) && (
                        <CheckCircle className="w-3 h-3 inline mr-1" />
                      )}
                      {cat.label}
                    </button>
                  ))}
                </div>
                {categories.length > 0 && (
                  <p className="text-xs text-gray-400 mt-2">
                    {categories.length} categor{categories.length !== 1 ? "ies" : "y"} selected
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Save Button */}
        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="bg-[#1B2A4A] hover:bg-[#2a3f6f] flex-1"
          >
            {updateMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            Save Preferences
          </Button>

          {enabled && (
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={previewQuery.isFetching}
              className="border-[#1B2A4A] text-[#1B2A4A]"
            >
              {previewQuery.isFetching ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Eye className="w-4 h-4 mr-2" />
              )}
              Preview Digest
            </Button>
          )}
        </div>

        {/* Digest Preview */}
        {showPreview && previewQuery.data && (
          <Card className="border-[#C8A84B]/40 bg-amber-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C8A84B]" />
                Digest Preview
              </CardTitle>
              <CardDescription>{previewQuery.data.message}</CardDescription>
            </CardHeader>
            <CardContent>
              {previewQuery.data.resources.length > 0 ? (
                <div className="space-y-3">
                  {previewQuery.data.resources.map((r) => (
                    <div key={r.id} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100">
                      <div className="w-2 h-2 rounded-full bg-[#C8A84B] mt-1.5 flex-shrink-0" />
                      <div>
                        <Link
                          href={`/resource/${r.id}`}
                          className="text-sm font-medium text-[#1B2A4A] hover:underline"
                        >
                          {r.name}
                        </Link>
                        {r.city && (
                          <p className="text-xs text-gray-500">
                            {r.city}, {r.state}
                          </p>
                        )}
                        {r.description && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{r.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No resources found matching your current preferences. Try broadening your filters.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Info note */}
        <p className="text-xs text-gray-400 text-center">
          Digest emails are sent to your registered email address. We never share your information with third parties.
          You can unsubscribe at any time by disabling the digest above.
        </p>
      </div>
    </div>
  );
}
