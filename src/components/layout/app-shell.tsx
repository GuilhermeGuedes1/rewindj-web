"use client";

import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Mic2,
  Plus,
  Sparkles,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/utils/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/events", label: "Eventos", icon: CalendarDays },
  { href: "/artists", label: "Artistas", icon: Mic2 },
  { href: "/clients", label: "Clientes", icon: UsersRound },
  { href: "/events/create", label: "Novo", icon: Plus },
];

const artistNavItems = [
  { href: "/dashboard", label: "Perfil", icon: LayoutDashboard },
  { href: "/events", label: "Eventos", icon: CalendarDays },
];

function isNavItemActive(pathname: string, href: string) {
  if (href === "/artists" || href === "/clients") {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return pathname === href;
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const visibleNavItems = user?.role === "ARTIST" ? artistNavItems : navItems;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

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
                <span className="flex size-10 items-center justify-center rounded-md bg-primary text-lg font-black text-primary-foreground shadow-glow">
                  O
                </span>
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
                    {user ? `${user.name} ` : "rewindj user"}
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
            gridTemplateColumns: `repeat(${visibleNavItems.length}, minmax(0, 1fr))`,
          }}>
          {visibleNavItems.map((item) => {
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
        </div>
      </nav>
    </main>
  );
}
