import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { ArrowLeft, AlertTriangle, ClipboardList } from "lucide-react";

export default function AdminAuditLogs() {
  const { user, isAuthenticated } = useAuth();
  const logsQuery = trpc.admin.auditLogs.useQuery({ limit: 100, offset: 0 });

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

  const logs = (logsQuery.data as any) ?? [];

  const actionColor = (action: string) => {
    if (action.includes("create")) return "bg-green-100 text-green-700";
    if (action.includes("delete")) return "bg-red-100 text-red-700";
    if (action.includes("verify") || action.includes("approve")) return "bg-blue-100 text-blue-700";
    if (action.includes("reject")) return "bg-orange-100 text-orange-700";
    return "bg-secondary text-secondary-foreground";
  };

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
            Audit Logs
          </h1>
          <p className="text-white/70 mt-1">All admin actions and security events</p>
        </div>
      </div>

      <div className="container mt-6">
        {logsQuery.isLoading ? (
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />)}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No audit logs yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log: any) => (
              <Card key={log.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${actionColor(log.action)}`}>
                        {log.action}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {log.entityType} #{log.entityId}
                      </span>
                    </div>
                    {log.details && (
                      <p className="text-xs text-muted-foreground truncate">{JSON.stringify(log.details)}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                    {log.adminId && (
                      <div className="text-xs text-muted-foreground mt-0.5">Admin #{log.adminId}</div>
                    )}
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
