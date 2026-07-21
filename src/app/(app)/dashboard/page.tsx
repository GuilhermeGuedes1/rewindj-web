"use client";

import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, Clock3, Pencil } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Event } from "@/types/event";

import { EventCard } from "@/components/orbit/event-card";
import { PageHeader } from "@/components/orbit/page-header";
import { StatCard } from "@/components/orbit/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { getMyArtistProfileService } from "@/services/artists.service";
import { listEventsService } from "@/services/events.service";
import { formatEventDate } from "@/utils/formatEventDate";
import {
  canCreateEvent,
  isAgencyArtist,
  isIndependentArtist,
} from "@/utils/auth-permissions";

function isFutureEvent(event: Event) {
  return new Date(event.eventDate).getTime() >= new Date().setHours(0, 0, 0, 0);
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isArtistFromAgency = isAgencyArtist(user);
  const isIndependentArtistUser = isIndependentArtist(user);
  const isArtistDashboard = isArtistFromAgency || isIndependentArtistUser;
  const dashboardEyebrow = isIndependentArtistUser
    ? undefined
    : (user?.organizationName ?? "RewindJ");

  const { data: artistProfile } = useQuery({
    queryKey: ["artists", "me"],
    queryFn: getMyArtistProfileService,
    enabled: isArtistDashboard,
  });

  const dashboardName = isArtistDashboard
    ? artistProfile?.stageName || artistProfile?.name || user?.name || "DJ"
    : user?.name;

  useEffect(() => {
    async function loadDashboard() {
      if (!user) return;

      try {
        setIsLoading(true);

        const eventData = await listEventsService();

        setEvents(eventData.data);
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, [user]);

  const upcomingEvents = useMemo(
    () => events.filter(isFutureEvent),
    [events],
  );

  const nextEvent = upcomingEvents[0];
  const confirmedEventsCount = useMemo(
    () => events.filter((event) => event.status === "CONFIRMED").length,
    [events],
  );
  const negotiatingEventsCount = useMemo(
    () => events.filter((event) => event.status === "NEGOTIATING").length,
    [events],
  );

  return (
    <div>
      <PageHeader
        eyebrow={dashboardEyebrow}
        title={`Olá, ${dashboardName}`}
        description={
          isArtistDashboard
            ? "Seus próximos shows, histórico e dados artísticos dentro da organização."
            : "Uma visão rápida da sua operação: agenda, artistas, convites e eventos criados com IA."
        }
        action={
          canCreateEvent(user) ? (
            <Button asChild>
              <Link href="/events/create">Criar evento</Link>
            </Button>
          ) : null
        }
      />

      <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          icon={Clock3}
          label={isArtistDashboard ? "Próximo show" : "Próximo evento"}
          value={
            isLoading
              ? "--"
              : nextEvent
                ? formatEventDate(nextEvent.eventDate)
                : isArtistDashboard
                  ? "Não há próximo show"
                  : "Não há próximo evento"
          }
          detail={nextEvent?.venueName ?? "Agenda livre"}
        />

        <StatCard
          icon={CalendarCheck}
          label="Eventos fechados"
          value={isLoading ? "--" : String(confirmedEventsCount)}
          detail="Eventos confirmados"
        />

        <StatCard
          icon={CalendarCheck}
          label="Eventos em negociação"
          value={isLoading ? "--" : String(negotiatingEventsCount)}
          detail="Aguardando confirmação"
        />
      </section>

      <section
        className={`grid gap-4 ${
          isArtistDashboard ? "xl:grid-cols-[1.2fr_0.8fr]" : ""
        }`}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-normal">
              {isArtistDashboard ? "Próximo show" : "Próximo evento"}
            </h2>

            <Button variant="ghost" asChild>
              <Link href="/events">Ver todos</Link>
            </Button>
          </div>

          {nextEvent ? (
            <EventCard event={nextEvent} featured />
          ) : (
            <div className="orbit-shell rounded-lg p-6 text-muted-foreground">
              {isArtistDashboard
                ? "Não há próximo show agendado."
                : "Não há próximo evento agendado."}
            </div>
          )}
        </div>

        {isArtistDashboard && (
          <Card className="orbit-shell overflow-hidden">
            <CardContent className="p-6">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <Badge variant="silver" className="mb-3">
                    Perfil artístico
                  </Badge>

                  <h2 className="text-xl font-semibold tracking-normal">
                    Meus dados
                  </h2>
                </div>

                {artistProfile?.id && (
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/artists/${artistProfile.id}/edit`}>
                      <Pencil className="size-4" />
                      Editar
                    </Link>
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <div className="rounded-md border border-border bg-muted/40 p-4">
                  <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                    Nome
                  </p>
                  <p>{artistProfile?.name ?? "Não informado"}</p>
                </div>

                <div className="rounded-md border border-border bg-muted/40 p-4">
                  <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                    Nome artístico
                  </p>
                  <p>{artistProfile?.stageName ?? "Não informado"}</p>
                </div>

                <div className="rounded-md border border-border bg-muted/40 p-4">
                  <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                    Email
                  </p>
                  <p>{artistProfile?.email ?? "Não informado"}</p>
                </div>

                <div className="rounded-md border border-border bg-muted/40 p-4">
                  <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                    Telefone
                  </p>
                  <p>{artistProfile?.phone ?? "Não informado"}</p>
                </div>

                <div className="rounded-md border border-border bg-muted/40 p-4">
                  <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                    Chave Pix
                  </p>
                  <p>{artistProfile?.pixKey ?? "Não informado"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
