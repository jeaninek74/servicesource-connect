import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { CheckCircle, Send } from "lucide-react";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY"
];

export default function SubmitResource() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    submitterName: "",
    submitterEmail: "",
    submitterOrg: "",
    resourceName: "",
    description: "",
    url: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    coverageArea: "national" as "local" | "state" | "national",
    eligibilityNotes: "",
  });

  const submitMutation = trpc.partner.submit.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (err) => toast.error(err.message),
  });

  const update = (field: string, value: string) =>
    setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.submitterName || !form.submitterEmail || !form.resourceName) {
      toast.error("Please fill in all required fields.");
      return;
    }
    submitMutation.mutate(form as any);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 text-center">
          <CardContent className="p-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Submission Received!</h2>
            <p className="text-muted-foreground">
              Thank you for submitting this resource. Our team will review it and may reach out to you for additional information. Approved resources will be listed on the platform.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <div
        className="py-10"
        style={{ background: "linear-gradient(135deg, oklch(0.22 0.08 250) 0%, oklch(0.18 0.06 250) 100%)" }}
      >
        <div className="container">
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "Oswald, sans-serif" }}>
            Submit a Resource
          </h1>
          <p className="text-white/70 mt-2 max-w-xl">
            Know of a resource that should be listed on ServiceSource Connect? Submit it for admin review. Approved resources will be available to veterans and military families across the country.
          </p>
        </div>
      </div>

      <div className="container mt-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Resource Submission Form</CardTitle>
            <CardDescription>
              All submissions are reviewed by our team before publishing. Fields marked * are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Submitter Info */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">Your Information</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="submitterName">Your Name *</Label>
                    <Input id="submitterName" value={form.submitterName} onChange={(e) => update("submitterName", e.target.value)} className="mt-1" required />
                  </div>
                  <div>
                    <Label htmlFor="submitterEmail">Email Address *</Label>
                    <Input id="submitterEmail" type="email" value={form.submitterEmail} onChange={(e) => update("submitterEmail", e.target.value)} className="mt-1" required />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="submitterOrg">Organization (if applicable)</Label>
                    <Input id="submitterOrg" value={form.submitterOrg} onChange={(e) => update("submitterOrg", e.target.value)} className="mt-1" />
                  </div>
                </div>
              </div>

              {/* Resource Info */}
              <div className="border-t border-border pt-6">
                <h3 className="font-semibold text-foreground mb-3">Resource Information</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="resourceName">Resource Name *</Label>
                    <Input id="resourceName" value={form.resourceName} onChange={(e) => update("resourceName", e.target.value)} className="mt-1" required />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" value={form.description} onChange={(e) => update("description", e.target.value)} className="mt-1" rows={3} placeholder="What does this resource offer? Who does it serve?" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="url">Website URL</Label>
                      <Input id="url" type="url" value={form.url} onChange={(e) => update("url", e.target.value)} className="mt-1" placeholder="https://" />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Input id="address" value={form.address} onChange={(e) => update("address", e.target.value)} className="mt-1" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" value={form.city} onChange={(e) => update("city", e.target.value)} className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <select
                        id="state"
                        value={form.state}
                        onChange={(e) => update("state", e.target.value)}
                        className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="">Select</option>
                        {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="zip">ZIP</Label>
                      <Input id="zip" value={form.zip} onChange={(e) => update("zip", e.target.value)} className="mt-1" maxLength={10} />
                    </div>
                  </div>
                  <div>
                    <Label>Coverage Area</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {(["local", "state", "national"] as const).map((area) => (
                        <button
                          key={area}
                          type="button"
                          onClick={() => update("coverageArea", area)}
                          className={`p-2 rounded-lg border text-sm capitalize transition-all ${
                            form.coverageArea === area ? "border-primary bg-primary/5 font-medium" : "border-border hover:border-primary/40"
                          }`}
                        >
                          {area}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="eligibilityNotes">Eligibility Notes</Label>
                    <Textarea id="eligibilityNotes" value={form.eligibilityNotes} onChange={(e) => update("eligibilityNotes", e.target.value)} className="mt-1" rows={2} placeholder="Who qualifies? Any service requirements?" />
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={submitMutation.isPending} className="w-full gap-2">
                <Send className="h-4 w-4" />
                {submitMutation.isPending ? "Submitting..." : "Submit for Review"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
