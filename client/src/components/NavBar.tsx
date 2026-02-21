import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import {
  Menu,
  Shield,
  BookOpen,
  Heart,
  Bookmark,
  LogOut,
  User,
  ChevronDown,
  Home,
  Sparkles,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";

export default function NavBar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const profileQuery = trpc.profile.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const isAdmin = user?.role === "admin";
  const hasProfile = profileQuery.data?.intakeCompleted;

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/assistant", label: "AI Navigator", icon: Sparkles },
    { href: "/lenders", label: "VA Lenders", icon: Shield },
    { href: "/about", label: "About & FAQ", icon: BookOpen },
    { href: "/submit-resource", label: "Submit Resource", icon: Heart },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-primary text-primary-foreground shadow-md">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-wide">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-accent text-accent-foreground font-black text-sm">
            SSC
          </div>
          <span className="hidden sm:block" style={{ fontFamily: "Oswald, sans-serif", letterSpacing: "0.05em" }}>
            ServiceSource Connect
          </span>
          <span className="sm:hidden" style={{ fontFamily: "Oswald, sans-serif" }}>
            SSC
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-white/10 ${
                location === link.href ? "bg-white/15" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {hasProfile && (
                <Link href="/saved">
                  <Button variant="ghost" size="sm" className="hidden sm:flex text-primary-foreground hover:bg-white/10 gap-1">
                    <Bookmark className="h-4 w-4" />
                    Saved
                  </Button>
                </Link>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-white/10 gap-1">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:block max-w-24 truncate">{user?.name ?? "Account"}</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {hasProfile && (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/intake">
                      {hasProfile ? "Edit Profile" : "Complete Intake"}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/saved">Saved Items</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin">Admin Console</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button
              size="sm"
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
              onClick={() => (window.location.href = getLoginUrl())}
            >
              Sign In
            </Button>
          )}

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden text-primary-foreground hover:bg-white/10">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-primary text-primary-foreground border-l border-white/10">
              <div className="flex flex-col gap-2 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                ))}
                {isAuthenticated && (
                  <>
                    <div className="border-t border-white/10 my-2" />
                    <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10">
                      Dashboard
                    </Link>
                    <Link href="/saved" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10">
                      <Bookmark className="h-5 w-5" />
                      Saved Items
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10">
                        Admin Console
                      </Link>
                    )}
                    <button
                      onClick={() => { logout(); setMobileOpen(false); }}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 text-left text-red-300"
                    >
                      <LogOut className="h-5 w-5" />
                      Sign Out
                    </button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
