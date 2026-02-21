import { useState, useMemo } from "react";
import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Search,
  Phone,
  Globe,
  MapPin,
  Bookmark,
  CheckCircle,
  Filter,
  AlertTriangle,
  X,
} from "lucide-react";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY"
];

export default function CategoryResults() {
  const params = useParams<{ categorySlug: string }>();
  const { isAuthenticated } = useAuth();

  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterCoverage, setFilterCoverage] = useState<"" | "local" | "state" | "national">("");
  const [filterVerified, setFilterVerified] = useState<"" | "verified" | "partner_verified">("");
  const [showFilters, setShowFilters] = useState(false);

  const categoriesQuery = trpc.resources.categories.useQuery();
  const category = useMemo(
    () => categoriesQuery.data?.find((c) => c.slug === params.categorySlug),
    [categoriesQuery.data, params.categorySlug]
  );

  const searchQuery = trpc.resources.search.useQuery(
    {
      categoryId: category?.id,
      state: filterState || undefined,
      coverageArea: filterCoverage || undefined,
      verifiedLevel: filterVerified || undefined,
      search: search || undefined,
      limit: 30,
      offset: 0,
    },
    { enabled: !!category }
  );

  const savedQuery = trpc.saved.list.useQuery(undefined, { enabled: isAuthenticated });
  const addSaved = trpc.saved.add.useMutation({
    onSuccess: () => { toast.success("Saved!"); savedQuery.refetch(); },
  });

  const savedIds = new Set((savedQuery.data ?? []).map((s) => `resource-${s.itemId}`));
  const isCrisis = params.categorySlug === "mental-health";

  const clearFilters = () => {
    setSearch("");
    setFilterState("");
    setFilterCoverage("");
    setFilterVerified("");
  };

  const hasFilters = search || filterState || filterCoverage || filterVerified;

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <div
        className="py-10"
        style={{ background: "linear-gradient(135deg, oklch(0.22 0.08 250) 0%, oklch(0.18 0.06 250) 100%)" }}
      >
        <div className="container">
          <div className="text-sm text-white/60 mb-2">
            <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
            <span className="mx-2">/</span>
            <span className="text-white">{category?.name ?? params.categorySlug}</span>
          </div>
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "Oswald, sans-serif" }}>
            {category?.name ?? "Resources"}
          </h1>
          {category?.description && (
            <p className="text-white/70 mt-2 max-w-xl">{category.description}</p>
          )}
        </div>
      </div>

      {/* Crisis banner */}
      {isCrisis && (
        <div className="bg-red-600 text-white py-3">
          <div className="container flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <span><strong>Veterans Crisis Line:</strong> Call 988, Press 1 | Text 838255 | Available 24/7</span>
            </div>
            <div className="flex gap-2">
              <a href="tel:988" className="px-3 py-1 bg-white text-red-700 rounded font-bold text-sm hover:bg-red-50">Call 988</a>
              <a href="sms:838255" className="px-3 py-1 border border-white text-white rounded text-sm hover:bg-white/10">Text 838255</a>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-amber-50 border-b border-amber-200 py-2">
        <div className="container">
          <p className="text-xs text-amber-800 flex items-center gap-2">
            <AlertTriangle className="h-3 w-3 flex-shrink-0" />
            These are options, not professional advice. You may qualify — verify eligibility directly with each provider.
          </p>
        </div>
      </div>

      <div className="container mt-6">
        {/* Search + Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasFilters && <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">!</Badge>}
          </Button>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
              <X className="h-4 w-4" /> Clear
            </Button>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="mb-6">
            <CardContent className="p-4 grid sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs mb-1 block">State</Label>
                <select
                  value={filterState}
                  onChange={(e) => setFilterState(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">All States</option>
                  {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs mb-1 block">Coverage Area</Label>
                <select
                  value={filterCoverage}
                  onChange={(e) => setFilterCoverage(e.target.value as any)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">All Areas</option>
                  <option value="local">Local</option>
                  <option value="state">State-wide</option>
                  <option value="national">National</option>
                </select>
              </div>
              <div>
                <Label className="text-xs mb-1 block">Verification</Label>
                <select
                  value={filterVerified}
                  onChange={(e) => setFilterVerified(e.target.value as any)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">All</option>
                  <option value="verified">Verified</option>
                  <option value="partner_verified">Partner Verified</option>
                </select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {searchQuery.isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : !searchQuery.data || searchQuery.data.items.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No resources found</p>
            <p className="text-sm mt-1">Try adjusting your filters or search terms.</p>
            {hasFilters && (
              <Button variant="outline" className="mt-4" onClick={clearFilters}>Clear Filters</Button>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Showing {searchQuery.data.items.length} resource{searchQuery.data.items.length !== 1 ? "s" : ""}
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchQuery.data.items.map((resource: any) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  isSaved={savedIds.has(`resource-${resource.id}`)}
                  onSave={() => {
                    if (!isAuthenticated) { toast.error("Sign in to save resources."); return; }
                    addSaved.mutate({ itemType: "resource", itemId: resource.id });
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ResourceCard({
  resource,
  isSaved,
  onSave,
}: {
  resource: any;
  isSaved: boolean;
  onSave: () => void;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow flex flex-col">
      <CardContent className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link href={`/resource/${resource.id}`} className="font-semibold text-foreground hover:text-primary line-clamp-2 flex-1 text-sm">
            {resource.name}
          </Link>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <VerifiedBadge level={resource.verifiedLevel} />
          </div>
        </div>

        {resource.description && (
          <p className="text-xs text-muted-foreground line-clamp-3 mb-3 flex-1">{resource.description}</p>
        )}

        <div className="flex flex-wrap gap-1 mb-3">
          {resource.coverageArea && (
            <Badge variant="outline" className="text-xs capitalize">{resource.coverageArea}</Badge>
          )}
          {resource.state && (
            <Badge variant="outline" className="text-xs">
              <MapPin className="h-2.5 w-2.5 mr-1" />{resource.state}
            </Badge>
          )}
          {resource.city && (
            <Badge variant="outline" className="text-xs">{resource.city}</Badge>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
          <div className="flex gap-1.5">
            {resource.phone && (
              <a
                href={`tel:${resource.phone}`}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{resource.phone}</span>
              </a>
            )}
            {resource.url && (
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors ml-2"
              >
                <Globe className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Website</span>
              </a>
            )}
          </div>
          <button
            onClick={onSave}
            disabled={isSaved}
            className={`p-1.5 rounded transition-colors ${
              isSaved ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-primary/10"
            }`}
            title={isSaved ? "Saved" : "Save"}
          >
            <Bookmark className="h-4 w-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function VerifiedBadge({ level }: { level: string | null }) {
  if (!level || level === "unverified") return null;
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full font-medium ${
      level === "partner_verified" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
    }`}>
      <CheckCircle className="h-3 w-3" />
      {level === "partner_verified" ? "Partner" : "Verified"}
    </span>
  );
}
