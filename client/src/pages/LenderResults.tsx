import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Search, Phone, Globe, Bookmark, CheckCircle, Filter, X, Shield, AlertTriangle } from "lucide-react";
import { useHaptic } from "@/hooks/useHaptic";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY"
];

const LENDER_TYPE_LABELS: Record<string, string> = {
  bank: "Bank",
  credit_union: "Credit Union",
  broker: "Mortgage Broker",
  direct: "Direct Lender",
};

export default function LenderResults() {
  const { isAuthenticated } = useAuth();
  const haptic = useHaptic();
  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterType, setFilterType] = useState<"" | "bank" | "credit_union" | "broker" | "direct">("");
  const [filterVASpec, setFilterVASpec] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const lendersQuery = trpc.lenders.search.useQuery({
    state: filterState || undefined,
    lenderType: filterType || undefined,
    vaSpecialist: filterVASpec || undefined,
    search: search || undefined,
    limit: 30,
    offset: 0,
  });

  const savedQuery = trpc.saved.list.useQuery(undefined, { enabled: isAuthenticated });
  const addSaved = trpc.saved.add.useMutation({
    onSuccess: () => { haptic.success(); toast.success("Saved!"); savedQuery.refetch(); },
  });

  const savedIds = new Set((savedQuery.data ?? []).map((s) => `lender-${s.itemId}`));
  const hasFilters = search || filterState || filterType || filterVASpec;

  const clearFilters = () => {
    haptic.light();
    setSearch("");
    setFilterState("");
    setFilterType("");
    setFilterVASpec(false);
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <div
        className="py-8 sm:py-10"
        style={{ background: "linear-gradient(135deg, oklch(0.22 0.08 250) 0%, oklch(0.18 0.06 250) 100%)" }}
      >
        <div className="container">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2" style={{ fontFamily: "Oswald, sans-serif" }}>
            VA Loan Lender Directory
          </h1>
          <p className="text-white/70 text-sm sm:text-base max-w-xl">
            Find VA-approved lenders and mortgage specialists serving veterans and active service members across all 50 states.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border-b border-amber-200 py-2">
        <div className="container">
          <p className="text-xs text-amber-800 flex items-start gap-2">
            <AlertTriangle className="h-3 w-3 flex-shrink-0 mt-0.5" />
            Lender listings are for informational purposes only. Verify licensing and terms directly with each lender.
          </p>
        </div>
      </div>

      <div className="container mt-4 sm:mt-6">
        {/* Search + Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search lenders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-11 sm:h-9 text-base sm:text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => { haptic.light(); setShowFilters(!showFilters); }}
              className="gap-2 flex-1 sm:flex-none h-11 sm:h-9"
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasFilters && <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">!</Badge>}
            </Button>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground h-11 sm:h-9">
                <X className="h-4 w-4" /> Clear
              </Button>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="mb-6">
            <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs mb-1 block">State</Label>
                <select
                  value={filterState}
                  onChange={(e) => { haptic.light(); setFilterState(e.target.value); }}
                  className="w-full h-11 sm:h-9 rounded-md border border-input bg-background px-3 text-base sm:text-sm"
                >
                  <option value="">All States</option>
                  {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs mb-1 block">Lender Type</Label>
                <select
                  value={filterType}
                  onChange={(e) => { haptic.light(); setFilterType(e.target.value as any); }}
                  className="w-full h-11 sm:h-9 rounded-md border border-input bg-background px-3 text-base sm:text-sm"
                >
                  <option value="">All Types</option>
                  <option value="bank">Bank</option>
                  <option value="credit_union">Credit Union</option>
                  <option value="broker">Mortgage Broker</option>
                  <option value="direct">Direct Lender</option>
                </select>
              </div>
              <div className="flex items-center gap-3 sm:mt-5">
                <input
                  type="checkbox"
                  id="vaSpec"
                  checked={filterVASpec}
                  onChange={(e) => { haptic.light(); setFilterVASpec(e.target.checked); }}
                  className="h-5 w-5 sm:h-4 sm:w-4 rounded border-input"
                />
                <Label htmlFor="vaSpec" className="text-sm cursor-pointer">
                  VA Specialist Only
                </Label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {lendersQuery.isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : !lendersQuery.data?.items || lendersQuery.data.items.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Shield className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No lenders found</p>
            <p className="text-sm mt-1">Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Showing {lendersQuery.data.items.length} lender{lendersQuery.data.items.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {lendersQuery.data.items.map((lender: any) => (
                <Card key={lender.id} className="hover:shadow-md transition-shadow flex flex-col">
                  <CardContent className="p-4 sm:p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Link
                        href={`/lender/${lender.id}`}
                        onClick={() => haptic.light()}
                        className="font-semibold text-foreground hover:text-primary text-sm flex-1"
                      >
                        {lender.name}
                      </Link>
                      {lender.verifiedLevel && lender.verifiedLevel !== "unverified" && (
                        <span className={`flex-shrink-0 inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full font-medium ${
                          lender.verifiedLevel === "partner_verified" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                        }`}>
                          <CheckCircle className="h-3 w-3" />
                          {lender.verifiedLevel === "partner_verified" ? "Partner" : "Verified"}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {LENDER_TYPE_LABELS[lender.lenderType] ?? lender.lenderType}
                      </Badge>
                      {lender.vaSpecialist && (
                        <Badge className="text-xs bg-primary/10 text-primary border-primary/20">
                          <Shield className="h-2.5 w-2.5 mr-1" />
                          VA Specialist
                        </Badge>
                      )}
                    </div>

                    {lender.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">{lender.description}</p>
                    )}

                    {lender.statesServed && lender.statesServed.length > 0 && (
                      <p className="text-xs text-muted-foreground mb-3">
                        Serves: {lender.statesServed.length >= 50 ? "All 50 States" : lender.statesServed.slice(0, 5).join(", ") + (lender.statesServed.length > 5 ? ` +${lender.statesServed.length - 5} more` : "")}
                      </p>
                    )}

                    <a
                      href={lender.url || `https://www.google.com/search?q=${encodeURIComponent(lender.name + ' VA loan mortgage')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => haptic.medium()}
                      className="flex items-center justify-center gap-1.5 w-full mb-2 px-3 py-2.5 sm:py-1.5 rounded-md border border-primary/30 text-xs font-medium text-primary hover:bg-primary/10 transition-colors active:bg-primary/20"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      {lender.url ? "Visit Website" : "Search Online"}
                    </a>

                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
                      <div className="flex gap-1.5">
                        {lender.phone && (
                          <a
                            href={`tel:${lender.phone}`}
                            onClick={() => haptic.medium()}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">{lender.phone}</span>
                          </a>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          if (!isAuthenticated) { toast.error("Sign in to save lenders."); return; }
                          haptic.success();
                          addSaved.mutate({ itemType: "lender", itemId: lender.id });
                        }}
                        disabled={savedIds.has(`lender-${lender.id}`)}
                        className={`p-2 sm:p-1.5 rounded transition-colors ${
                          savedIds.has(`lender-${lender.id}`) ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                        }`}
                      >
                        <Bookmark className="h-4 w-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
