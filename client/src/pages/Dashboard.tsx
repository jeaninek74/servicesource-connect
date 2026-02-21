import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useLocation, Link } from "wouter";
import {
  Home,
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
  Edit,
  Phone,
  Globe,
  CheckCircle,
  AlertTriangle,
  Bookmark,
} from "lucide-react";
import { toast } from "sonner";

const categoryIcons: Record<string, React.ElementType> = {
  housing: Home,
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

const STATUS_LABELS: Record<string, string> = {
  active_duty: "Active Duty",
  guard_reserve: "National Guard / Reserve",
  transitioning: "Transitioning",
  veteran: "Veteran",
  spouse_caregiver: "Spouse / Caregiver",
};

export default function Dashboard() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  const profileQuery = trpc.profile.get.useQuery(undefined, { enabled: isAuthenticated });
  const categoriesQuery = trpc.resources.categories.useQuery();
  const savedQuery = trpc.saved.list.useQuery(undefined, { enabled: isAuthenticated });
  const addSaved = trpc.saved.add.useMutation({
    onSuccess: () => {
      toast.success("Saved to your list!");
      savedQuery.refetch();
    },
  });

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
        <Card className="max-w-md w-full mx-4 text-center">
          <CardContent className="p-8">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground mb-4">Please sign in to access your personalized dashboard.</p>
            <Button onClick={() => (window.location.href = getLoginUrl())}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profileQuery.data?.intakeCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4 text-center">
          <CardContent className="p-8">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Complete Your Profile</h2>
            <p className="text-muted-foreground mb-4">
              Tell us about your military status and needs to see personalized resources.
            </p>
            <Button onClick={() => navigate("/intake")}>Complete Intake</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const profile = profileQuery.data;
  const needsCategories = (profile?.needsCategories as string[]) ?? [];
  const savedIds = new Set((savedQuery.data ?? []).map((s) => `resource-${s.itemId}`));

  const selectedCategories = categoriesQuery.data?.filter((c) =>
    needsCategories.length === 0 || needsCategories.includes(c.slug)
  ) ?? [];

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <div
        className="py-10 px-4"
        style={{
          background: "linear-gradient(135deg, oklch(0.22 0.08 250) 0%, oklch(0.18 0.06 250) 100%)",
        }}
      >
        <div className="container">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: "Oswald, sans-serif" }}>
                Your Resource Dashboard
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {profile?.militaryStatus && (
                  <Badge className="bg-accent/20 text-accent border-accent/30">
                    {STATUS_LABELS[profile.militaryStatus]}
                  </Badge>
                )}
                {profile?.state && (
                  <Badge variant="outline" className="border-white/30 text-white/80">
                    {profile.state}
                  </Badge>
                )}
                {profile?.vaEligible === "yes" && (
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    VA Eligible
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-white/30 text-white hover:bg-white/10 bg-transparent gap-2"
                onClick={() => navigate("/intake")}
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
              <Button
                size="sm"
                className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
                onClick={() => navigate("/saved")}
              >
                <Bookmark className="h-4 w-4" />
                Saved Items
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Crisis Banner for mental health */}
      {needsCategories.includes("mental-health") && (
        <div className="bg-red-50 border-b border-red-200 py-3">
          <div className="container flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-red-800">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <span>
                <strong>Veterans Crisis Line:</strong> Call <strong>988, Press 1</strong> | Text <strong>838255</strong> | Chat at VeteransCrisisLine.net
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-amber-50 border-b border-amber-200 py-2">
        <div className="container">
          <p className="text-xs text-amber-800 flex items-center gap-2">
            <AlertTriangle className="h-3 w-3 flex-shrink-0" />
            This platform provides options, not professional advice. You may qualify for these resources — verify eligibility directly with each provider.
          </p>
        </div>
      </div>

      {/* Category Tiles */}
      <div className="container mt-8">
        {selectedCategories.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No categories selected. <Link href="/intake" className="text-primary underline">Update your profile</Link> to see resources.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {selectedCategories.map((cat) => (
              <CategorySection
                key={cat.id}
                category={cat}
                state={profile?.state ?? undefined}
                savedIds={savedIds}
                onSave={(itemId) => addSaved.mutate({ itemType: "resource", itemId })}
              />
            ))}
          </div>
        )}
      </div>

      {/* All Categories */}
      {needsCategories.length > 0 && (
        <div className="container mt-12">
          <h2 className="text-xl font-bold text-foreground mb-4" style={{ fontFamily: "Oswald, sans-serif" }}>
            Browse All Categories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {(categoriesQuery.data ?? []).map((cat) => {
              const Icon = categoryIcons[cat.slug] ?? Shield;
              return (
                <Link key={cat.id} href={`/resources/${cat.slug}`}>
                  <Card className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{cat.name}</span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function CategorySection({
  category,
  state,
  savedIds,
  onSave,
}: {
  category: { id: number; slug: string; name: string; description?: string | null };
  state?: string;
  savedIds: Set<string>;
  onSave: (id: number) => void;
}) {
  const Icon = categoryIcons[category.slug] ?? Shield;
  const isMentalHealth = category.slug === "mental-health";

  const topQuery = trpc.resources.topByCategory.useQuery(
    { categoryId: category.id, state, limit: 3 },
    { enabled: !!category.id }
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "Oswald, sans-serif" }}>
              {category.name}
            </h2>
            {category.description && (
              <p className="text-xs text-muted-foreground">{category.description}</p>
            )}
          </div>
        </div>
        <Link href={`/resources/${category.slug}`}>
          <Button variant="ghost" size="sm" className="gap-1 text-primary">
            View All <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Crisis mode for mental health */}
      {isMentalHealth && (
        <Card className="mb-4 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-bold text-red-800 text-sm">If you are in crisis right now</div>
                <p className="text-xs text-red-700 mt-1">
                  Call <strong>988 and Press 1</strong> for the Veterans Crisis Line, available 24/7. Text <strong>838255</strong>. If in immediate danger, call <strong>911</strong>.
                </p>
                <div className="flex gap-2 mt-2">
                  <a href="tel:988" className="text-xs bg-red-600 text-white px-3 py-1 rounded-full font-medium hover:bg-red-700">
                    Call 988, Press 1
                  </a>
                  <a href="https://www.veteranscrisisline.net/get-help-now/chat/" target="_blank" rel="noopener noreferrer" className="text-xs border border-red-600 text-red-700 px-3 py-1 rounded-full font-medium hover:bg-red-50">
                    Online Chat
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {topQuery.isLoading ? (
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : topQuery.data && topQuery.data.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-4">
          {topQuery.data.map((resource) => (
            <Card key={resource.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Link href={`/resource/${resource.id}`} className="font-semibold text-sm text-foreground hover:text-primary line-clamp-2 flex-1">
                    {resource.name}
                  </Link>
                  <VerifiedBadge level={resource.verifiedLevel} />
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                  {resource.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {resource.phone && (
                      <a href={`tel:${resource.phone}`} className="p-1.5 rounded bg-secondary hover:bg-secondary/80 transition-colors" title="Call">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      </a>
                    )}
                    {resource.url && (
                      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded bg-secondary hover:bg-secondary/80 transition-colors" title="Website">
                        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => onSave(resource.id)}
                    disabled={savedIds.has(`resource-${resource.id}`)}
                    className={`p-1.5 rounded transition-colors ${
                      savedIds.has(`resource-${resource.id}`)
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                    }`}
                    title={savedIds.has(`resource-${resource.id}`) ? "Saved" : "Save"}
                  >
                    <Bookmark className="h-3.5 w-3.5" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
          No resources found for your location yet.{" "}
          <Link href={`/resources/${category.slug}`} className="text-primary underline">
            Browse all options
          </Link>
        </div>
      )}
    </div>
  );
}

function VerifiedBadge({ level }: { level: string | null }) {
  if (!level || level === "unverified") return null;
  return (
    <span
      className={`flex-shrink-0 inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full font-medium ${
        level === "partner_verified"
          ? "bg-blue-100 text-blue-700"
          : "bg-green-100 text-green-700"
      }`}
    >
      <CheckCircle className="h-3 w-3" />
      {level === "partner_verified" ? "Partner" : "Verified"}
    </span>
  );
}
