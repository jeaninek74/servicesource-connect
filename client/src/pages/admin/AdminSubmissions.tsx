import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link } from "wouter";
import { ArrowLeft, AlertTriangle, FileText, CheckCircle, XCircle, Clock } from "lucide-react";

export default function AdminSubmissions() {
  const { user, isAuthenticated } = useAuth();
  const submissionsQuery = trpc.admin.listSubmissions.useQuery({});

  const reviewMutation = trpc.admin.reviewSubmission.useMutation({
    onSuccess: () => { toast.success("Submission updated!"); submissionsQuery.refetch(); },
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

  const submissions = (submissionsQuery.data as any) ?? [];
  const pending = submissions.filter((s: any) => s.status === "pending");
  const reviewed = submissions.filter((s: any) => s.status !== "pending");

  const statusBadge = (status: string) => {
    if (status === "approved") return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
    if (status === "rejected") return <Badge className="bg-red-100 text-red-700 border-red-200"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
    return <Badge className="bg-amber-100 text-amber-700 border-amber-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
  };

  const SubmissionCard = ({ sub }: { sub: any }) => (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="font-semibold text-foreground">{sub.resourceName}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Submitted by {sub.submitterName} ({sub.submitterEmail})
              {sub.submitterOrg && ` — ${sub.submitterOrg}`}
            </div>
          </div>
          {statusBadge(sub.status)}
        </div>

        {sub.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{sub.description}</p>
        )}

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3">
          {sub.url && <a href={sub.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{sub.url}</a>}
          {sub.phone && <span>{sub.phone}</span>}
          {sub.city && <span>{sub.city}, {sub.state}</span>}
          {sub.coverageArea && <Badge variant="outline" className="text-xs capitalize">{sub.coverageArea}</Badge>}
        </div>

        {sub.eligibilityNotes && (
          <p className="text-xs text-muted-foreground mb-3 italic">Eligibility: {sub.eligibilityNotes}</p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {new Date(sub.createdAt).toLocaleDateString()}
          </span>
          {sub.status === "pending" && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50 gap-1"
                onClick={() => reviewMutation.mutate({ id: sub.id, status: "rejected" })}
                disabled={reviewMutation.isPending}
              >
                <XCircle className="h-3.5 w-3.5" /> Reject
              </Button>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 gap-1"
                onClick={() => reviewMutation.mutate({ id: sub.id, status: "approved" })}
                disabled={reviewMutation.isPending}
              >
                <CheckCircle className="h-3.5 w-3.5" /> Approve
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

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
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "Oswald, sans-serif" }}>
            Partner Submissions
          </h1>
          <p className="text-white/70 mt-1">
            {pending.length} pending review
          </p>
        </div>
      </div>

      <div className="container mt-6">
        {submissionsQuery.isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />)}
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No submissions yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {pending.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-foreground mb-4" style={{ fontFamily: "Oswald, sans-serif" }}>
                  Pending Review ({pending.length})
                </h2>
                <div className="space-y-3">
                  {pending.map((sub: any) => <SubmissionCard key={sub.id} sub={sub} />)}
                </div>
              </section>
            )}
            {reviewed.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-foreground mb-4" style={{ fontFamily: "Oswald, sans-serif" }}>
                  Reviewed ({reviewed.length})
                </h2>
                <div className="space-y-3">
                  {reviewed.map((sub: any) => <SubmissionCard key={sub.id} sub={sub} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
