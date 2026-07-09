"use client";

import {
  CalendarDays,
  CircleDollarSign,
  LayoutDashboard,
  LogOut,
  Menu,
  Mic2,
  Plus,
  UserCircle,
  UsersRound,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import type { AuthUser } from "@/services/auth.service";
import { cn } from "@/utils/utils";
import type { Artist } from "@/types/artist";
import { getMyArtistProfileService } from "@/services/artists.service";
import {
  canCreateEvent,
  isIndependentArtist,
  canManageArtists,
  canManageClients,
  canViewFinancial,
} from "@/utils/auth-permissions";

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/events", label: "Eventos", icon: CalendarDays },
  { href: "/financial", label: "Financeiro", icon: CircleDollarSign },
  { href: "/artists", label: "Artistas", icon: Mic2 },
  { href: "/clients", label: "Clientes", icon: UsersRound },
  { href: "/events/create", label: "Novo Evento", icon: Plus },
  { href: "/profile", label: "Meu Perfil", icon: UserCircle },
];

const adminMobileNavItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/events", label: "Eventos", icon: CalendarDays },
  { href: "/events/create", label: "Novo", icon: Plus },
];

const adminMobileMenuItems = [
  { href: "/financial", label: "Financeiro", icon: CircleDollarSign },
  { href: "/artists", label: "Artistas", icon: Mic2 },
  { href: "/clients", label: "Clientes", icon: UsersRound },
  { href: "/profile", label: "Meu Perfil", icon: UserCircle },
];

function canShowNavItem(href: string, user: AuthUser | null) {
  if (href === "/events/create") return canCreateEvent(user);
  if (href === "/financial") return canViewFinancial(user);
  if (href === "/clients") return canManageClients(user);
  if (href === "/artists") return canManageArtists(user);

  return true;
}

function isNavItemActive(pathname: string, href: string) {
  if (href === "/artists" || href === "/clients" || href === "/financial") {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return pathname === href;
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [artistProfile, setArtistProfile] = useState<Artist | null>(null);
  const hasArtistProfile = user?.role === "ARTIST" || isIndependentArtist(user);
  const shellDisplayName = hasArtistProfile
    ? artistProfile?.stageName || artistProfile?.name || user?.name
    : user?.name;
  const visibleNavItems = navItems.filter((item) =>
    canShowNavItem(item.href, user),
  );
  const mobileNavItems = adminMobileNavItems.filter((item) =>
    canShowNavItem(item.href, user),
  );
  const mobileMenuItems = adminMobileMenuItems.filter((item) =>
    canShowNavItem(item.href, user),
  );
  const mobileMenuActive = mobileMenuItems.some((item) =>
    isNavItemActive(pathname, item.href),
  );

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    async function loadArtistProfile() {
      if (!user || !hasArtistProfile) {
        setArtistProfile(null);
        return;
      }

      try {
        const data = await getMyArtistProfileService();
        setArtistProfile(data);
      } catch (error) {
        console.error("Erro ao carregar perfil artístico no shell:", error);
      }
    }

    loadArtistProfile();
  }, [hasArtistProfile, user]);

  function handleLogout() {
    setMobileMenuOpen(false);
    logout();
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="orbit-shell rounded-lg p-6 text-sm text-muted-foreground">
          Preparando o rewindj...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-24 lg:pb-0">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl lg:grid-cols-[17rem_1fr]">
        <aside className="sticky top-0 hidden h-screen border-r border-border/70 bg-black/20 px-5 py-6 backdrop-blur lg:block">
          <div className="flex h-full flex-col justify-between">
            <div className="space-y-8">
              <Link href="/dashboard" className="flex items-center gap-3">
                <Image
                  src="/images/Logo.png"
                  alt="Rewindj"
                  width={40}
                  height={40}
                  className="size-10 rounded-md object-contain shadow-glow"
                  priority
                />
                <span className="text-lg font-semibold">Rewindj</span>
              </Link>

              <nav className="space-y-2">
                {visibleNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isNavItemActive(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                        active && "bg-accent text-foreground",
                      )}>
                      <Icon className="size-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {shellDisplayName ?? "rewindj user"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user?.email ?? "demo@rewindj.local"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  aria-label="Sair">
                  <LogOut />
                </Button>
              </div>
            </div>
          </div>
        </aside>

        <section className="px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </section>
      </div>

      <nav className="fixed inset-x-3 bottom-3 z-50 rounded-lg border border-border bg-card/95 p-2 shadow-panel backdrop-blur lg:hidden">
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${mobileNavItems.length + 1}, minmax(0, 1fr))`,
          }}>
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const active = isNavItemActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-12 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-semibold text-muted-foreground transition-colors",
                  active && "bg-accent text-foreground",
                )}>
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className={cn(
              "flex h-12 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
              (mobileMenuOpen || mobileMenuActive) &&
                "bg-accent text-foreground",
            )}
            aria-haspopup="dialog"
            aria-expanded={mobileMenuOpen}>
            <Menu className="size-4" />
            Menu
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm lg:hidden"
          role="presentation"
          onClick={() => setMobileMenuOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Menu mobile"
            className="fixed inset-x-3 bottom-20 rounded-lg border border-border bg-card/95 p-4 shadow-panel"
            onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {shellDisplayName ?? "Rewindj user"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user?.email ?? "demo@rewindj.local"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Fechar menu">
                <X />
              </Button>
            </div>

            {mobileMenuItems.length > 0 && (
              <nav className="space-y-2">
                {mobileMenuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isNavItemActive(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex h-12 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                        active && "bg-accent text-foreground",
                      )}>
                      <Icon className="size-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            )}

            <div className="mt-3 border-t border-border/70 pt-3">
              <button
                type="button"
                onClick={handleLogout}
                className="flex h-12 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                <LogOut className="size-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
