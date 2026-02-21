import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Phone, Globe, MapPin, Bookmark, CheckCircle, ArrowLeft, Shield, AlertTriangle, ExternalLink } from "lucide-react";

const LENDER_TYPE_LABELS: Record<string, string> = {
  bank: "Bank",
  credit_union: "Credit Union",
  broker: "Mortgage Broker",
  direct: "Direct Lender",
};

export default function LenderDetail() {
  const params = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const id = parseInt(params.id ?? "0");

  const lenderQuery = trpc.lenders.getById.useQuery({ id }, { enabled: !!id });
  const savedQuery = trpc.saved.list.useQuery(undefined, { enabled: isAuthenticated });
  const addSaved = trpc.saved.add.useMutation({
    onSuccess: () => { toast.success("Saved!"); savedQuery.refetch(); },
  });

  const lender = lenderQuery.data?.lender;
  const branches = lenderQuery.data?.branches ?? [];
  const isSaved = (savedQuery.data ?? []).some((s) => s.itemType === "lender" && s.itemId === id);

  if (lenderQuery.isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  if (!lender) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Lender not found.</p>
          <Link href="/lenders"><Button variant="outline">Back to Lenders</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <div
        className="py-8"
        style={{ background: "linear-gradient(135deg, oklch(0.22 0.08 250) 0%, oklch(0.18 0.06 250) 100%)" }}
      >
        <div className="container">
          <Link href="/lenders" className="inline-flex items-center gap-1 text-white/70 hover:text-white text-sm mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Lenders
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: "Oswald, sans-serif" }}>
                {lender.name}
              </h1>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="border-white/30 text-white/80">
                  {LENDER_TYPE_LABELS[lender.lenderType] ?? lender.lenderType}
                </Badge>
                {lender.vaSpecialist && (
                  <Badge className="bg-accent/20 text-accent border-accent/30">
                    <Shield className="h-3 w-3 mr-1" /> VA Specialist
                  </Badge>
                )}
                {lender.verifiedLevel && lender.verifiedLevel !== "unverified" && (
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {lender.verifiedLevel === "partner_verified" ? "Partner Verified" : "Verified"}
                  </Badge>
                )}
              </div>
            </div>
            <Button
              onClick={() => {
                if (!isAuthenticated) { toast.error("Sign in to save lenders."); return; }
                addSaved.mutate({ itemType: "lender", itemId: id });
              }}
              disabled={isSaved}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 bg-transparent gap-2 flex-shrink-0"
            >
              <Bookmark className="h-4 w-4" />
              {isSaved ? "Saved" : "Save"}
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border-b border-amber-200 py-2">
        <div className="container">
          <p className="text-xs text-amber-800 flex items-center gap-2">
            <AlertTriangle className="h-3 w-3 flex-shrink-0" />
            Lender listings are for informational purposes only. Verify licensing, rates, and terms directly with the lender.
          </p>
        </div>
      </div>

      <div className="container mt-8 max-w-3xl">
        <div className="grid gap-6">
          <Card>
            <CardContent className="p-6">
              {lender.description && (
                <p className="text-foreground leading-relaxed mb-6">{lender.description}</p>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                {lender.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <div className="text-xs text-muted-foreground">Phone</div>
                      <a href={`tel:${lender.phone}`} className="text-sm font-medium text-foreground hover:text-primary">{lender.phone}</a>
                    </div>
                  </div>
                )}
                {lender.url && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <div className="text-xs text-muted-foreground">Website</div>
                      <a href={lender.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-foreground hover:text-primary flex items-center gap-1">
                        Visit Website <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {lender.statesServed && (lender.statesServed as string[]).length > 0 && (
                <div className="mt-4">
                  <div className="text-xs text-muted-foreground mb-2">States Served</div>
                  <div className="flex flex-wrap gap-1">
                    {(lender.statesServed as string[]).length >= 50 ? (
                      <Badge variant="secondary">All 50 States</Badge>
                    ) : (
                      (lender.statesServed as string[]).map((s) => (
                        <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                      ))
                    )}
                  </div>
                </div>
              )}

              {lender.licensingNotes && (
                <div className="mt-4 bg-secondary/50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-foreground mb-1">Licensing Notes</div>
                  <p className="text-sm text-muted-foreground">{lender.licensingNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Branch Locations */}
          {branches.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-foreground mb-3" style={{ fontFamily: "Oswald, sans-serif" }}>
                Branch Locations
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {branches.map((branch) => (
                  <Card key={branch.id}>
                    <CardContent className="p-4 flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-sm text-foreground">
                          {branch.city}, {branch.state} {branch.zip}
                        </div>
                        {branch.phone && (
                          <a href={`tel:${branch.phone}`} className="text-xs text-muted-foreground hover:text-primary mt-0.5 block">
                            {branch.phone}
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3">
            {lender.url && (
              <Button asChild className="flex-1">
                <a href={lender.url} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-4 w-4 mr-2" />
                  Visit Official Website
                </a>
              </Button>
            )}
            {lender.phone && (
              <Button variant="outline" asChild className="flex-1">
                <a href={`tel:${lender.phone}`}>
                  <Phone className="h-4 w-4 mr-2" />
                  Call {lender.phone}
                </a>
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground text-center">
            ServiceSource Connect provides options, not professional advice. Always verify rates, licensing, and terms directly with the lender.
          </p>
        </div>
      </div>
    </div>
  );
}
