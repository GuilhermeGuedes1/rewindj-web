"use client";

import { CalendarCheck, Clock3, Music2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Event } from "@/types/event";
import type { Artist } from "@/types/artist";

import { EventCard } from "@/components/orbit/event-card";
import { PageHeader } from "@/components/orbit/page-header";
import { StatCard } from "@/components/orbit/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import {
  getMyArtistProfileService,
  listArtistsService,
  listMyArtistEventsService,
} from "@/services/artists.service";
import { listEventsService } from "@/services/events.service";

function isFutureEvent(event: Event) {
  return new Date(event.eventDate).getTime() >= new Date().setHours(0, 0, 0, 0);
}

function sortByEventDate(first: Event, second: Event) {
  return (
    new Date(first.eventDate).getTime() - new Date(second.eventDate).getTime()
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [artistProfile, setArtistProfile] = useState<Artist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isArtist = user?.role === "ARTIST";

  useEffect(() => {
    async function loadDashboard() {
      try {
        if (isArtist) {
          const [profileData, eventData] = await Promise.all([
            getMyArtistProfileService(),
            listMyArtistEventsService(),
          ]);

          setArtistProfile(profileData);
          setEvents(eventData);
          return;
        }

        const [eventData, artistData] = await Promise.all([
          listEventsService(),
          listArtistsService(),
        ]);

        setEvents(eventData);
        setArtists(artistData);
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, [isArtist]);

  const upcomingEvents = useMemo(
    () => events.filter(isFutureEvent).sort(sortByEventDate),
    [events],
  );

  const pastEvents = useMemo(
    () =>
      events
        .filter((event) => !isFutureEvent(event))
        .sort((first, second) => sortByEventDate(second, first)),
    [events],
  );

  const nextEvent = upcomingEvents[0];

  return (
    <div>
      <PageHeader
        eyebrow="Orbit command"
        title={`Boa noite${user ? `, ${user.name}` : ""}.`}
        description={
          isArtist
            ? "Seu perfil artístico, próximos eventos e histórico dentro da organização."
            : "Uma visão rápida da sua operação: agenda, artistas, convites e eventos criados com IA."
        }
        action={
          isArtist ? null : (
            <Button asChild>
              <Link href="/events/create">Criar evento</Link>
            </Button>
          )
        }
      />

      <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={CalendarCheck}
          label={isArtist ? "Próximos eventos" : "Eventos ativos"}
          value={isLoading ? "--" : String(upcomingEvents.length)}
          detail={
            nextEvent
              ? `${nextEvent.city}, ${nextEvent.state}`
              : "Nenhum evento futuro"
          }
        />

        <StatCard
          icon={Music2}
          label={isArtist ? "Perfil" : "Artistas"}
          value={
            isArtist
              ? artistProfile?.stageName || artistProfile?.fullName
                ? "1"
                : "--"
              : String(artists.length)
          }
          detail={
            isArtist
              ? artistProfile?.stageName ||
                artistProfile?.fullName ||
                "Carregando perfil"
              : "Na organização"
          }
        />

        <StatCard
          icon={Clock3}
          label="Próximo evento"
          value={
            nextEvent
              ? new Intl.DateTimeFormat("pt-BR", {
                  day: "2-digit",
                  month: "short",
                }).format(new Date(nextEvent.eventDate))
              : "--"
          }
          detail={nextEvent?.venueName ?? "Agenda livre"}
        />

        <StatCard
          icon={Sparkles}
          label={isArtist ? "Histórico" : "Eventos via IA"}
          value={isArtist ? String(pastEvents.length) : String(events.length)}
          detail={isArtist ? "Eventos realizados" : "Eventos cadastrados"}
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

          {nextEvent ? (
            <EventCard event={nextEvent} featured />
          ) : (
            <div className="orbit-shell rounded-lg p-6 text-muted-foreground">
              Nenhum evento futuro encontrado.
            </div>
          )}
        </div>

        <Card className="orbit-shell overflow-hidden">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <Badge variant="silver" className="mb-3">
                  {isArtist ? "Perfil artístico" : "AI stage"}
                </Badge>

                <h2 className="text-xl font-semibold tracking-normal">
                  {isArtist ? "Meus dados" : "Brief inteligente"}
                </h2>
              </div>

              <Sparkles className="size-5 text-primary" />
            </div>

            <div className="space-y-4">
              {(isArtist
                ? [
                    artistProfile?.fullName ?? "Nome não informado",
                    artistProfile?.email ?? "Email não informado",
                    artistProfile?.phone ?? "Telefone não informado",
                    artistProfile?.pixKey ?? "Pix não informado",
                  ]
                : [
                    "WhatsApp -> Evento preenchido automaticamente.",
                    "Identificação automática de cliente, artista e local.",
                    "Detecção de informações ausentes antes da confirmação.",
                    "Sugestão de horários, observações e briefing operacional.",
                  ]
              ).map((item) => (
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
