import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Shield, BookOpen, Building, ClipboardList, FileText, AlertTriangle } from "lucide-react";

export default function AdminDashboard() {
  const { user, isAuthenticated, loading } = useAuth();

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

  const adminLinks = [
    { href: "/admin/resources", label: "Manage Resources", description: "Create, edit, and verify resource listings", icon: BookOpen },
    { href: "/admin/lenders", label: "Manage Lenders", description: "Create, edit, and verify VA lender listings", icon: Building },
    { href: "/admin/submissions", label: "Partner Submissions", description: "Review and approve submitted resources", icon: FileText },
    { href: "/admin/audit-logs", label: "Audit Logs", description: "View all admin actions and security events", icon: ClipboardList },
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

      <div className="container mt-8">
        <div className="grid md:grid-cols-2 gap-6">
          {adminLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group h-full">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                    <link.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg">{link.label}</h3>
                    <p className="text-muted-foreground text-sm mt-1">{link.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
