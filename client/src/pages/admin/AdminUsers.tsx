import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useHaptic } from "@/hooks/useHaptic";
import { toast } from "sonner";
import { useState } from "react";
import {
  AlertTriangle,
  Users,
  Shield,
  ShieldOff,
  Search,
  ChevronLeft,
  ChevronRight,
  Crown,
} from "lucide-react";

export default function AdminUsers() {
  const { user, isAuthenticated, loading } = useAuth();
  const haptic = useHaptic();
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const limit = 50;

  const usersQuery = trpc.admin.listUsers.useQuery(
    { limit, offset },
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  const setRoleMutation = trpc.admin.setUserRole.useMutation({
    onSuccess: (_, vars) => {
      toast.success(`User role updated to ${vars.role}`);
      usersQuery.refetch();
    },
    onError: () => toast.error("Failed to update role"),
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4 text-center">
          <CardContent className="p-8">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">Admin access is required.</p>
            <Button asChild variant="outline"><Link href="/">Go Home</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const allUsers = usersQuery.data ?? [];
  const filteredUsers = search
    ? allUsers.filter(
        (u) =>
          u.name?.toLowerCase().includes(search.toLowerCase()) ||
          u.email?.toLowerCase().includes(search.toLowerCase())
      )
    : allUsers;

  const subscriptionBadge = (status: string | null, plan: string | null) => {
    if (!status || status === "none") return <Badge variant="outline" className="text-xs">Free</Badge>;
    if (status === "active" || status === "trialing") {
      return <Badge className="bg-green-500/20 text-green-700 border-green-500/30 text-xs">{plan ?? status}</Badge>;
    }
    if (status === "canceled" || status === "past_due") {
      return <Badge className="bg-red-500/20 text-red-700 border-red-500/30 text-xs">{status}</Badge>;
    }
    return <Badge variant="outline" className="text-xs">{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <div
        className="py-8 sm:py-10"
        style={{ background: "linear-gradient(135deg, oklch(0.22 0.08 250) 0%, oklch(0.18 0.06 250) 100%)" }}
      >
        <div className="container">
          <div className="flex items-center gap-2 mb-2">
            <Link href="/admin" className="text-white/60 hover:text-white text-sm">Admin</Link>
            <span className="text-white/40">/</span>
            <span className="text-white text-sm">Users</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: "Oswald, sans-serif" }}>
            User Management
          </h1>
          <p className="text-white/70 mt-1 text-sm">{allUsers.length} users registered</p>
        </div>
      </div>

      <div className="container mt-6">
        {/* Search */}
        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              All Users ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {usersQuery.isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No users found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left p-3 font-medium text-muted-foreground">User</th>
                      <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">Role</th>
                      <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Subscription</th>
                      <th className="text-left p-3 font-medium text-muted-foreground hidden lg:table-cell">Joined</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="p-3">
                          <div className="font-medium text-foreground">{u.name ?? "—"}</div>
                          <div className="text-xs text-muted-foreground">{u.email ?? "—"}</div>
                          {/* Mobile: show role and subscription inline */}
                          <div className="flex gap-1 mt-1 sm:hidden">
                            {u.role === "admin" ? (
                              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                                <Crown className="h-2.5 w-2.5 mr-1" /> Admin
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">User</Badge>
                            )}
                            {subscriptionBadge(u.subscriptionStatus, u.subscriptionPlan)}
                          </div>
                        </td>
                        <td className="p-3 hidden sm:table-cell">
                          {u.role === "admin" ? (
                            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                              <Crown className="h-2.5 w-2.5 mr-1" /> Admin
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">User</Badge>
                          )}
                        </td>
                        <td className="p-3 hidden md:table-cell">
                          {subscriptionBadge(u.subscriptionStatus, u.subscriptionPlan)}
                        </td>
                        <td className="p-3 hidden lg:table-cell text-muted-foreground text-xs">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="p-3 text-right">
                          {u.id !== user?.id && (
                            u.role === "admin" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs gap-1 h-7"
                                onClick={() => {
                                  haptic.medium();
                                  setRoleMutation.mutate({ userId: u.id, role: "user" });
                                }}
                                disabled={setRoleMutation.isPending}
                              >
                                <ShieldOff className="h-3 w-3" />
                                <span className="hidden sm:inline">Demote</span>
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                className="text-xs gap-1 h-7"
                                onClick={() => {
                                  haptic.medium();
                                  setRoleMutation.mutate({ userId: u.id, role: "admin" });
                                }}
                                disabled={setRoleMutation.isPending}
                              >
                                <Shield className="h-3 w-3" />
                                <span className="hidden sm:inline">Promote</span>
                              </Button>
                            )
                          )}
                          {u.id === user?.id && (
                            <span className="text-xs text-muted-foreground">You</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {!search && (
          <div className="flex items-center justify-between mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { haptic.light(); setOffset(Math.max(0, offset - limit)); }}
              disabled={offset === 0}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Showing {offset + 1}–{Math.min(offset + limit, offset + allUsers.length)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { haptic.light(); setOffset(offset + limit); }}
              disabled={allUsers.length < limit}
              className="gap-1"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
