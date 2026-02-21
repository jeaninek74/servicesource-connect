import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link } from "wouter";
import { Plus, Edit, CheckCircle, ArrowLeft, Shield, AlertTriangle } from "lucide-react";

const VERIFIED_LEVELS = ["unverified", "verified", "partner_verified"] as const;

export default function AdminResources() {
  const { user, isAuthenticated } = useAuth();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const resourcesQuery = trpc.admin.listResources.useQuery({ limit: 100, offset: 0 });
  const categoriesQuery = trpc.resources.categories.useQuery();

  const verifyMutation = trpc.admin.verifyResource.useMutation({
    onSuccess: () => { toast.success("Verification updated!"); resourcesQuery.refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const createMutation = trpc.admin.createResource.useMutation({
    onSuccess: () => { toast.success("Resource created!"); setShowCreate(false); resourcesQuery.refetch(); },
    onError: (e) => toast.error(e.message),
  });

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 text-center">
          <CardContent className="p-8">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <Button asChild variant="outline"><Link href="/">Go Home</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const resources = (resourcesQuery.data as any) ?? [];

  return (
    <div className="min-h-screen bg-background pb-16">
      <div
        className="py-8"
        style={{ background: "linear-gradient(135deg, oklch(0.22 0.08 250) 0%, oklch(0.18 0.06 250) 100%)" }}
      >
        <div className="container">
          <Link href="/admin" className="inline-flex items-center gap-1 text-white/70 hover:text-white text-sm mb-4">
            <ArrowLeft className="h-4 w-4" /> Admin Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "Oswald, sans-serif" }}>
              Manage Resources
            </h1>
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
              <DialogTrigger asChild>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
                  <Plus className="h-4 w-4" /> Add Resource
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Resource</DialogTitle>
                </DialogHeader>
                <ResourceForm
                  categories={categoriesQuery.data ?? []}
                  onSubmit={(data) => createMutation.mutate(data as any)}
                  isPending={createMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container mt-6">
        {resourcesQuery.isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {resources.map((resource: any) => (
              <Card key={resource.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-foreground">{resource.name}</span>
                      <VerifiedBadge level={resource.verifiedLevel} />
                      {resource.state && <Badge variant="outline" className="text-xs">{resource.state}</Badge>}
                      {resource.coverageArea && <Badge variant="outline" className="text-xs capitalize">{resource.coverageArea}</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{resource.description}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <select
                      value={resource.verifiedLevel ?? "unverified"}
                      onChange={(e) => verifyMutation.mutate({ id: resource.id, verifiedLevel: e.target.value as any })}
                      className="h-8 text-xs rounded border border-input bg-background px-2"
                    >
                      {VERIFIED_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ResourceForm({ categories, onSubmit, isPending }: { categories: any[]; onSubmit: (data: any) => void; isPending: boolean }) {
  const [form, setForm] = useState({
    categoryId: categories[0]?.id ?? 1,
    name: "",
    description: "",
    url: "",
    phone: "",
    city: "",
    state: "",
    zip: "",
    coverageArea: "national" as const,
    eligibilityNotes: "",
    verifiedLevel: "unverified" as const,
    isActive: true,
  });

  const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div>
        <Label>Category</Label>
        <select value={form.categoryId} onChange={(e) => setForm(p => ({ ...p, categoryId: parseInt(e.target.value) }))} className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <Label>Name *</Label>
        <Input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} className="mt-1" required />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} className="mt-1" rows={2} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>URL</Label>
          <Input type="url" value={form.url} onChange={(e) => setForm(p => ({ ...p, url: e.target.value }))} className="mt-1" placeholder="https://" />
        </div>
        <div>
          <Label>Phone</Label>
          <Input value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} className="mt-1" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label>City</Label>
          <Input value={form.city} onChange={(e) => setForm(p => ({ ...p, city: e.target.value }))} className="mt-1" />
        </div>
        <div>
          <Label>State</Label>
          <select value={form.state} onChange={(e) => setForm(p => ({ ...p, state: e.target.value }))} className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
            <option value="">Select</option>
            {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <Label>ZIP</Label>
          <Input value={form.zip} onChange={(e) => setForm(p => ({ ...p, zip: e.target.value }))} className="mt-1" maxLength={10} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Coverage Area</Label>
          <select value={form.coverageArea} onChange={(e) => setForm(p => ({ ...p, coverageArea: e.target.value as any }))} className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
            <option value="local">Local</option>
            <option value="state">State</option>
            <option value="national">National</option>
          </select>
        </div>
        <div>
          <Label>Verification Level</Label>
          <select value={form.verifiedLevel} onChange={(e) => setForm(p => ({ ...p, verifiedLevel: e.target.value as any }))} className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
            <option value="unverified">Unverified</option>
            <option value="verified">Verified</option>
            <option value="partner_verified">Partner Verified</option>
          </select>
        </div>
      </div>
      <div>
        <Label>Eligibility Notes</Label>
        <Textarea value={form.eligibilityNotes} onChange={(e) => setForm(p => ({ ...p, eligibilityNotes: e.target.value }))} className="mt-1" rows={2} />
      </div>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Creating..." : "Create Resource"}
      </Button>
    </form>
  );
}

function VerifiedBadge({ level }: { level: string | null }) {
  if (!level || level === "unverified") return <Badge variant="outline" className="text-xs">Unverified</Badge>;
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full font-medium ${level === "partner_verified" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
      <CheckCircle className="h-3 w-3" />
      {level === "partner_verified" ? "Partner" : "Verified"}
    </span>
  );
}
