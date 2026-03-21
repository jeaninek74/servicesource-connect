import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useHaptic } from "@/hooks/useHaptic";
import { Shield, BookOpen, Building, ClipboardList, FileText, AlertTriangle, Users, TrendingUp, Star, Clock } from "lucide-react";

export default function AdminDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const haptic = useHaptic();
  const statsQuery = trpc.admin.getStats.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4 text-center">
          <CardContent className="p-8">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">Admin access is required to view this page.</p>
            <Button asChild variant="outline"><Link href="/">Go Home</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = statsQuery.data;

  const statCards = [
    { label: "Total Users", value: stats?.userCount, icon: Users, color: "text-blue-500" },
    { label: "Active Resources", value: stats?.resourceCount, icon: BookOpen, color: "text-green-500" },
    { label: "VA Lenders", value: stats?.lenderCount, icon: Building, color: "text-amber-500" },
    { label: "Pending Reviews", value: stats?.pendingSubmissions, icon: Clock, color: "text-orange-500" },
    { label: "Resource Reviews", value: stats?.reviewCount, icon: Star, color: "text-purple-500" },
  ];

  const adminLinks = [
    { href: "/admin/users", label: "Manage Users", description: "View all users, promote/demote admin roles", icon: Users, badge: null as string | null },
    { href: "/admin/resources", label: "Manage Resources", description: "Create, edit, and verify resource listings", icon: BookOpen, badge: null as string | null },
    { href: "/admin/lenders", label: "Manage Lenders", description: "Create, edit, and verify VA lender listings", icon: Building, badge: null as string | null },
    { href: "/admin/submissions", label: "Partner Submissions", description: "Review and approve submitted resources", icon: FileText, badge: stats?.pendingSubmissions ? String(stats.pendingSubmissions) : null },
    { href: "/admin/audit-logs", label: "Audit Logs", description: "View all admin actions and security events", icon: ClipboardList, badge: null as string | null },
  ];

  return (
    <div className="min-h-screen bg-background pb-16">
      <div
        className="py-10"
        style={{ background: "linear-gradient(135deg, oklch(0.22 0.08 250) 0%, oklch(0.18 0.06 250) 100%)" }}
      >
        <div className="container">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-6 w-6 text-accent" />
            <span className="text-accent text-sm font-medium uppercase tracking-wider">Admin Console</span>
          </div>
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "Oswald, sans-serif" }}>
            Admin Dashboard
          </h1>
          <p className="text-white/70 mt-1">Signed in as {user?.name} ({user?.email})</p>
        </div>
      </div>

      <div className="container mt-8 space-y-8">
        {/* Stats Cards */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Platform Overview
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {statCards.map((stat) => (
              <Card key={stat.label} className="text-center">
                <CardContent className="p-4">
                  <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                  <div className="text-2xl font-bold text-foreground">
                    {statsQuery.isLoading ? (
                      <div className="h-7 w-12 bg-muted animate-pulse rounded mx-auto" />
                    ) : (
                      stat.value !== undefined ? Number(stat.value).toLocaleString() : "—"
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Admin Tools */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Admin Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminLinks.map(({ href, label, description, icon: Icon, badge }) => (
              <Link key={href} href={href}>
                <Card
                  className="hover:shadow-md transition-all cursor-pointer hover:border-primary/40 h-full"
                  onClick={() => haptic.light()}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-semibold text-foreground text-sm">{label}</span>
                      </div>
                      {badge && (
                        <Badge className="bg-orange-500 text-white text-xs">{badge}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
