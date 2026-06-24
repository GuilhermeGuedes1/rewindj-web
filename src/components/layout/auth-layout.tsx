import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between">
          <Link href="/login" className="flex items-center gap-3">
            <Image
              src="/images/Logo.png"
              alt="Rewindj"
              width={40}
              height={40}
              className="size-10 rounded-md object-contain shadow-glow"
              priority
            />
            <span className="text-lg font-semibold tracking-normal">
              rewindj
            </span>
          </Link>

          <Badge variant="silver">Private beta</Badge>
        </header>

        <section className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="order-2 space-y-8 lg:order-1">
            <div className="max-w-xl space-y-4">
              <Badge className="w-fit" variant="outline">
                DJs, agência, eventos
              </Badge>

              <h1 className="text-4xl font-semibold leading-tight tracking-normal text-orbit-silver sm:text-5xl">
                A base operacional para noites que precisam parecer simples.
              </h1>

              <p className="text-base leading-7 text-muted-foreground">
                Organize eventos, artistas e clientes, em uma interface com alma
                de musica.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
              {["Eventos", "Artistas", "Inteligência Artificial"].map(
                (item) => (
                  <div key={item} className="orbit-shell rounded-lg p-4">
                    <div className="mb-3 h-1 w-10 rounded-full bg-primary" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ),
              )}
            </div>
          </div>

          <div className="order-1 w-full justify-self-center lg:order-2 lg:max-w-md">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
