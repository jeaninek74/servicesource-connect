import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link } from "wouter";
import {
  Bookmark,
  Trash2,
  Download,
  Phone,
  Globe,
  Shield,
  Building,
  ExternalLink,
} from "lucide-react";

export default function SavedItems() {
  const { isAuthenticated, loading } = useAuth();
  const savedQuery = trpc.saved.list.useQuery(undefined, { enabled: isAuthenticated });
  const removeSaved = trpc.saved.remove.useMutation({
    onSuccess: () => { toast.success("Removed from saved."); savedQuery.refetch(); },
  });

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4 text-center">
          <CardContent className="p-8">
            <Bookmark className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground mb-4">Sign in to view your saved resources and lenders.</p>
            <Button onClick={() => (window.location.href = getLoginUrl())}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const items = savedQuery.data ?? [];
  const resources = items.filter((i) => i.itemType === "resource");
  const lenders = items.filter((i) => i.itemType === "lender");

  const exportCSV = () => {
    const rows: string[][] = [
      ["Type", "Name", "Phone", "Website", "Description", "Saved At"],
    ];

    for (const item of items) {
      if (item.itemType === "resource" && item.resource) {
        rows.push([
          "Resource",
          item.resource.name,
          item.resource.phone ?? "",
          item.resource.url ?? "",
          item.resource.description ?? "",
          new Date(item.createdAt).toLocaleDateString(),
        ]);
      } else if (item.itemType === "lender" && item.lender) {
        rows.push([
          "Lender",
          item.lender.name,
          item.lender.phone ?? "",
          item.lender.url ?? "",
          item.lender.description ?? "",
          new Date(item.createdAt).toLocaleDateString(),
        ]);
      }
    }

    const csv = rows
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "servicesource-saved-items.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported!");
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <div
        className="py-10"
        style={{ background: "linear-gradient(135deg, oklch(0.22 0.08 250) 0%, oklch(0.18 0.06 250) 100%)" }}
      >
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "Oswald, sans-serif" }}>
                Saved Items
              </h1>
              <p className="text-white/70 mt-1">
                {items.length} saved item{items.length !== 1 ? "s" : ""}
              </p>
            </div>
            {items.length > 0 && (
              <Button
                onClick={exportCSV}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 bg-transparent gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mt-8">
        {items.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium text-lg">No saved items yet</p>
            <p className="text-sm mt-2 mb-6">
              Browse resources and lenders and click the bookmark icon to save them here.
            </p>
            <div className="flex justify-center gap-3">
              <Button asChild variant="outline">
                <Link href="/dashboard">Browse Resources</Link>
              </Button>
              <Button asChild>
                <Link href="/lenders">Browse Lenders</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Resources */}
            {resources.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "Oswald, sans-serif" }}>
                    Saved Resources ({resources.length})
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resources.map((item) => {
                    const r = item.resource;
                    if (!r) return null;
                    return (
                      <Card key={item.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <Link href={`/resource/${r.id}`} className="font-semibold text-sm text-foreground hover:text-primary flex-1 line-clamp-2">
                              {r.name}
                            </Link>
                            <button
                              onClick={() => removeSaved.mutate({ savedItemId: item.id })}
                              className="p-1.5 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                              title="Remove"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          {r.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{r.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-auto">
                            {r.phone && (
                              <a href={`tel:${r.phone}`} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                                <Phone className="h-3.5 w-3.5" /> {r.phone}
                              </a>
                            )}
                            {r.url && (
                              <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 ml-auto">
                                <Globe className="h-3.5 w-3.5" /> Website
                              </a>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-2">
                            Saved {new Date(item.createdAt).toLocaleDateString()}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Lenders */}
            {lenders.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Building className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "Oswald, sans-serif" }}>
                    Saved Lenders ({lenders.length})
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lenders.map((item) => {
                    const l = item.lender;
                    if (!l) return null;
                    return (
                      <Card key={item.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <Link href={`/lender/${l.id}`} className="font-semibold text-sm text-foreground hover:text-primary flex-1">
                              {l.name}
                            </Link>
                            <button
                              onClick={() => removeSaved.mutate({ savedItemId: item.id })}
                              className="p-1.5 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                              title="Remove"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          {l.vaSpecialist && (
                            <Badge className="text-xs bg-primary/10 text-primary border-primary/20 mb-2">
                              <Shield className="h-2.5 w-2.5 mr-1" /> VA Specialist
                            </Badge>
                          )}
                          {l.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{l.description}</p>
                          )}
                          <div className="flex items-center gap-2">
                            {l.phone && (
                              <a href={`tel:${l.phone}`} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                                <Phone className="h-3.5 w-3.5" /> {l.phone}
                              </a>
                            )}
                            {l.url && (
                              <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 ml-auto">
                                <ExternalLink className="h-3.5 w-3.5" /> Website
                              </a>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-2">
                            Saved {new Date(item.createdAt).toLocaleDateString()}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
