"use client";

import { CalendarCheck, Clock3, Music2, Sparkles } from "lucide-react";
import Link from "next/link";
import type { Event } from "@/types/event";

import { EventCard } from "@/components/orbit/event-card";
import { PageHeader } from "@/components/orbit/page-header";
import { StatCard } from "@/components/orbit/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

const mockNextEvent: Event = {
  id: "1",
  title: "Casamento Mariana & João",
  eventDate: "2026-08-15",
  startTime: "20:00",
  endTime: "02:00",
  venueName: "Copacabana Palace",
  address: "Av. Atlântica, 1702",
  city: "Rio de Janeiro",
  state: "RJ",
  notes: "Montagem às 16h. Cliente pediu open format até meia-noite.",
  artistId: "artist-1",
  clientId: "client-1",
  clientName: "Mariana Souza",
  clientPhone: "+5521999999999",
  clientEmail: "mariana@email.com",
  organizationId: "org-1",
};

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader
        eyebrow="Orbit command"
        title={`Boa noite${user ? `, ${user.name}` : ""}.`}
        description="Uma visão rápida da sua operação: agenda, artistas, convites e eventos criados com IA."
        action={
          <Button asChild>
            <Link href="/events/create">Criar evento</Link>
          </Button>
        }
      />

      <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={CalendarCheck}
          label="Eventos ativos"
          value="24"
          detail="6 acontecendo este mês"
        />

        <StatCard
          icon={Music2}
          label="Artistas"
          value="12"
          detail="8 disponíveis"
        />

        <StatCard
          icon={Clock3}
          label="Próximo evento"
          value="15 AGO"
          detail="Copacabana Palace"
        />

        <StatCard
          icon={Sparkles}
          label="Eventos via IA"
          value="31"
          detail="92% preenchidos automaticamente"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-normal">
              Próximo evento
            </h2>

            <Button variant="ghost" asChild>
              <Link href="/events">Ver todos</Link>
            </Button>
          </div>

          <EventCard event={mockNextEvent} featured />
        </div>

        <Card className="orbit-shell overflow-hidden">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <Badge variant="silver" className="mb-3">
                  AI stage
                </Badge>

                <h2 className="text-xl font-semibold tracking-normal">
                  Brief inteligente
                </h2>
              </div>

              <Sparkles className="size-5 text-primary" />
            </div>

            <div className="space-y-4">
              {[
                "WhatsApp → Evento preenchido automaticamente.",
                "Identificação automática de cliente, artista e local.",
                "Detecção de informações ausentes antes da confirmação.",
                "Sugestão de horários, observações e briefing operacional.",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-md border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
