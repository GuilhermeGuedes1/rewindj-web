import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col justify-between gap-10">
        <header className="flex items-center justify-between">
          <Link href="/login" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-md bg-primary text-lg font-black text-primary-foreground shadow-glow">
              O
            </span>
            <span className="text-lg font-semibold tracking-normal">Orbit</span>
          </Link>
          <Badge variant="silver">Private beta</Badge>
        </header>

        <section className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="order-2 space-y-8 lg:order-1">
            <div className="max-w-xl space-y-4">
              <Badge className="w-fit" variant="outline">
                DJs, agencies, invites, events
              </Badge>
              <h1 className="text-4xl font-semibold leading-tight tracking-normal text-orbit-silver sm:text-5xl">
                A base operacional para noites que precisam parecer simples.
              </h1>
              <p className="text-base leading-7 text-muted-foreground">
                Organize eventos, artistas, clientes e convites em uma interface
                com alma de app de musica e ritmo de produto premium.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
              {["Line-up", "Convites", "IA pronta"].map((item) => (
                <div key={item} className="orbit-shell rounded-lg p-4">
                  <div className="mb-3 h-1 w-10 rounded-full bg-primary" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2">{children}</div>
        </section>
      </div>
    </main>
  );
}
