import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Phone, Globe, MapPin, Bookmark, CheckCircle, ArrowLeft, Clock, AlertTriangle, ExternalLink,
} from "lucide-react";

export default function ResourceDetail() {
  const params = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const id = parseInt(params.id ?? "0");

  const resourceQuery = trpc.resources.getById.useQuery({ id }, { enabled: !!id });
  const savedQuery = trpc.saved.list.useQuery(undefined, { enabled: isAuthenticated });
  const addSaved = trpc.saved.add.useMutation({
    onSuccess: () => { toast.success("Saved!"); savedQuery.refetch(); },
  });

  const resource = resourceQuery.data;
  const isSaved = (savedQuery.data ?? []).some((s) => s.itemType === "resource" && s.itemId === id);

  if (resourceQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Resource not found.</p>
          <Link href="/dashboard"><Button variant="outline">Back to Dashboard</Button></Link>
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
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-white/70 hover:text-white text-sm mb-4">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: "Oswald, sans-serif" }}>
                {resource.name}
              </h1>
              <div className="flex flex-wrap gap-2 mt-2">
                {resource.verifiedLevel && resource.verifiedLevel !== "unverified" && (
                  <Badge className={resource.verifiedLevel === "partner_verified" ? "bg-blue-500/20 text-blue-200 border-blue-400/30" : "bg-green-500/20 text-green-200 border-green-400/30"}>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {resource.verifiedLevel === "partner_verified" ? "Partner Verified" : "Verified"}
                  </Badge>
                )}
                {resource.coverageArea && (
                  <Badge variant="outline" className="border-white/30 text-white/80 capitalize">
                    {resource.coverageArea}
                  </Badge>
                )}
              </div>
            </div>
            <Button
              onClick={() => {
                if (!isAuthenticated) { toast.error("Sign in to save resources."); return; }
                addSaved.mutate({ itemType: "resource", itemId: id });
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

      {/* Disclaimer */}
      <div className="bg-amber-50 border-b border-amber-200 py-2">
        <div className="container">
          <p className="text-xs text-amber-800 flex items-center gap-2">
            <AlertTriangle className="h-3 w-3 flex-shrink-0" />
            This platform provides options, not professional advice. Verify eligibility directly with this provider.
          </p>
        </div>
      </div>

      <div className="container mt-8 max-w-3xl">
        <div className="grid gap-6">
          {/* Main Info */}
          <Card>
            <CardContent className="p-6">
              {resource.description && (
                <p className="text-foreground leading-relaxed mb-6">{resource.description}</p>
              )}
              {resource.eligibilityNotes && (
                <div className="bg-secondary/50 rounded-lg p-4 mb-4">
                  <div className="text-sm font-semibold text-foreground mb-1">Eligibility Notes</div>
                  <p className="text-sm text-muted-foreground">{resource.eligibilityNotes}</p>
                </div>
              )}
              <div className="grid sm:grid-cols-2 gap-4">
                {resource.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <div className="text-xs text-muted-foreground">Phone</div>
                      <a href={`tel:${resource.phone}`} className="text-sm font-medium text-foreground hover:text-primary">
                        {resource.phone}
                      </a>
                    </div>
                  </div>
                )}
                {resource.url && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <div className="text-xs text-muted-foreground">Website</div>
                      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-foreground hover:text-primary flex items-center gap-1">
                        Visit Website <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}
                {(resource.city || resource.state) && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <div className="text-xs text-muted-foreground">Location</div>
                      <div className="text-sm font-medium text-foreground">
                        {[resource.address, resource.city, resource.state, resource.zip].filter(Boolean).join(", ")}
                      </div>
                    </div>
                  </div>
                )}
                {resource.hours && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <div className="text-xs text-muted-foreground">Hours</div>
                      <div className="text-sm font-medium text-foreground">{resource.hours}</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {resource.tags && (resource.tags as string[]).length > 0 && (
            <div>
              <div className="text-sm font-semibold text-foreground mb-2">Tags</div>
              <div className="flex flex-wrap gap-2">
                {(resource.tags as string[]).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3">
            {resource.url && (
              <Button asChild className="flex-1">
                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-4 w-4 mr-2" />
                  Visit Official Website
                </a>
              </Button>
            )}
            {resource.phone && (
              <Button variant="outline" asChild className="flex-1">
                <a href={`tel:${resource.phone}`}>
                  <Phone className="h-4 w-4 mr-2" />
                  Call {resource.phone}
                </a>
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground text-center">
            ServiceSource Connect provides options, not professional advice. Always verify eligibility and details directly with the provider.
          </p>
        </div>
      </div>
    </div>
  );
}
