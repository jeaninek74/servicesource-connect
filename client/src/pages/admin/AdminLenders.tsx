import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link } from "wouter";
import { Plus, CheckCircle, ArrowLeft, Shield, AlertTriangle } from "lucide-react";

const VERIFIED_LEVELS = ["unverified", "verified", "partner_verified"] as const;
const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

export default function AdminLenders() {
  const { user, isAuthenticated } = useAuth();
  const [showCreate, setShowCreate] = useState(false);

  const lendersQuery = trpc.admin.listLenders.useQuery({ limit: 100, offset: 0 });

  const verifyMutation = trpc.admin.verifyLender.useMutation({
    onSuccess: () => { toast.success("Verification updated!"); lendersQuery.refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const createMutation = trpc.admin.createLender.useMutation({
    onSuccess: () => { toast.success("Lender created!"); setShowCreate(false); lendersQuery.refetch(); },
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

  const lenders = (lendersQuery.data as any) ?? [];

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
              Manage Lenders
            </h1>
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
              <DialogTrigger asChild>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
                  <Plus className="h-4 w-4" /> Add Lender
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Lender</DialogTitle>
                </DialogHeader>
                <LenderForm
                  onSubmit={(data) => createMutation.mutate(data as any)}
                  isPending={createMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container mt-6">
        {lendersQuery.isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {lenders.map((lender: any) => (
              <Card key={lender.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-foreground">{lender.name}</span>
                      <VerifiedBadge level={lender.verifiedLevel} />
                      <Badge variant="outline" className="text-xs capitalize">{lender.lenderType?.replace("_", " ")}</Badge>
                      {lender.vaSpecialist && (
                        <Badge className="text-xs bg-primary/10 text-primary border-primary/20">
                          <Shield className="h-2.5 w-2.5 mr-1" /> VA Specialist
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{lender.description}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <select
                      value={lender.verifiedLevel ?? "unverified"}
                      onChange={(e) => verifyMutation.mutate({ id: lender.id, verifiedLevel: e.target.value as any })}
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

function LenderForm({ onSubmit, isPending }: { onSubmit: (data: any) => void; isPending: boolean }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    lenderType: "bank" as "bank" | "credit_union" | "broker" | "direct",
    url: "",
    phone: "",
    vaSpecialist: false,
    statesServed: [] as string[],
    verifiedLevel: "unverified" as "unverified" | "verified" | "partner_verified",
    licensingNotes: "",
    isActive: true,
  });

  const toggleState = (s: string) => {
    setForm((p) => ({
      ...p,
      statesServed: p.statesServed.includes(s) ? p.statesServed.filter((x) => x !== s) : [...p.statesServed, s],
    }));
  };

  const allStates = () => setForm((p) => ({ ...p, statesServed: US_STATES as string[] }));
  const clearStates = () => setForm((p) => ({ ...p, statesServed: [] }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
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
          <Label>Lender Type</Label>
          <select value={form.lenderType} onChange={(e) => setForm(p => ({ ...p, lenderType: e.target.value as any }))} className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
            <option value="bank">Bank</option>
            <option value="credit_union">Credit Union</option>
            <option value="broker">Mortgage Broker</option>
            <option value="direct">Direct Lender</option>
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
      <div className="flex items-center gap-2">
        <input type="checkbox" id="vaSpec" checked={form.vaSpecialist} onChange={(e) => setForm(p => ({ ...p, vaSpecialist: e.target.checked }))} className="h-4 w-4" />
        <Label htmlFor="vaSpec" className="cursor-pointer">VA Specialist</Label>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>States Served</Label>
          <div className="flex gap-2">
            <button type="button" onClick={allStates} className="text-xs text-primary hover:underline">All 50</button>
            <button type="button" onClick={clearStates} className="text-xs text-muted-foreground hover:underline">Clear</button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto border rounded-md p-2">
          {US_STATES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleState(s)}
              className={`px-2 py-0.5 text-xs rounded border transition-colors ${form.statesServed.includes(s) ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/40"}`}
            >
              {s}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{form.statesServed.length} state{form.statesServed.length !== 1 ? "s" : ""} selected</p>
      </div>
      <div>
        <Label>Licensing Notes</Label>
        <Textarea value={form.licensingNotes} onChange={(e) => setForm(p => ({ ...p, licensingNotes: e.target.value }))} className="mt-1" rows={2} />
      </div>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Creating..." : "Create Lender"}
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
