"use client";

import {
  ArrowLeft,
  CalendarDays,
  Clock,
  FileText,
  MapPin,
  Music,
  User,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/orbit/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getEventByIdService } from "@/services/events.service";
import type { EventDetails } from "@/types/event";
import { formatEventDate } from "@/utils/formatEventDate";

function formatCurrency(value?: number | string | null) {
  if (value === null || value === undefined) {
    return "Não informado";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
}

function fallback(value?: string | null) {
  return value && value.trim() ? value : "Não informado";
}

function getArtistName(event: EventDetails) {
  const stageName = event.artist?.stageName;

  if (stageName && stageName !== "string") {
    return stageName;
  }

  return fallback(event.artist?.name);
}

function contractStatus(value?: boolean | null) {
  if (value === true) return "Com contrato";
  if (value === false) return "Sem contrato";
  return "Não informado";
}

function eventStatusLabel(status?: string | null) {
  switch (status) {
    case "NEGOTIATING":
      return "Em negociação";

    case "CONFIRMED":
      return "Fechado";

    case "LOST":
      return "Perdido";

    default:
      return "Não informado";
  }
}

export default function EventDetailsPage() {
  const params = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEvent() {
      if (!params.id) return;

      try {
        setIsLoading(true);
        setError(null);

        const data = await getEventByIdService(params.id);
        setEvent(data);
      } catch (error) {
        console.error("Erro ao buscar evento:", error);
        setError("Não foi possível carregar os detalhes deste evento.");
      } finally {
        setIsLoading(false);
      }
    }

    loadEvent();
  }, [params.id]);

  return (
    <div>
      <PageHeader
        eyebrow="Detalhes do evento"
        title={event?.title ?? "Evento"}
        description="Informações completas de agenda, local, artista e cliente."
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/events">
                <ArrowLeft />
                Voltar
              </Link>
            </Button>

            <Button asChild>
              <Link href={`/events/${event?.id}/edit`}>Editar</Link>
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="orbit-shell rounded-lg p-6 text-muted-foreground">
          Carregando evento...
        </div>
      ) : error ? (
        <div className="orbit-shell rounded-lg p-6 text-muted-foreground">
          {error}
        </div>
      ) : event ? (
        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="orbit-shell overflow-hidden">
            <CardContent className="p-5 sm:p-6">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold tracking-normal">
                    {fallback(event.title)}
                  </h2>

                  <Badge variant="silver" className="w-fit">
                    {fallback(event.venueName)}
                  </Badge>
                </div>

                <Badge>{eventStatusLabel(event.status)}</Badge>
              </div>

              <div className="grid gap-4 text-sm text-muted-foreground sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-primary" />
                  {formatEventDate(event.eventDate, {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-primary" />
                  {fallback(event.startTime)} - {fallback(event.endTime)}
                </div>

                <div className="flex items-center gap-2">
                  <Music className="size-4 text-primary" />
                  Duração: {fallback(event.setDuration)}
                </div>

                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-primary" />
                  Cachê: {formatCurrency(event.fee)}
                </div>

                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-primary" />
                  {contractStatus(event.hasContract)}
                </div>
              </div>

              <div className="mt-6 rounded-md border border-border bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
                {fallback(event.notes)}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <Card className="orbit-shell overflow-hidden">
              <CardContent className="p-5">
                <div className="mb-4 flex items-center gap-2">
                  <MapPin className="size-4 text-primary" />
                  <h2 className="text-xl font-semibold tracking-normal">
                    Local
                  </h2>
                </div>

                <div className="grid gap-3 text-sm text-muted-foreground">
                  <p>{fallback(event.venueName)}</p>
                  <p>{fallback(event.address)}</p>
                  <p>
                    {fallback(event.city)}, {fallback(event.state)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="orbit-shell overflow-hidden">
              <CardContent className="p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Music className="size-4 text-primary" />
                  <h2 className="text-xl font-semibold tracking-normal">
                    Artista
                  </h2>
                </div>

                <div className="grid gap-3 text-sm text-muted-foreground">
                  <p>{getArtistName(event)}</p>
                  <p>{fallback(event.artist?.email)}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="orbit-shell overflow-hidden">
              <CardContent className="p-5">
                <div className="mb-4 flex items-center gap-2">
                  <User className="size-4 text-primary" />
                  <h2 className="text-xl font-semibold tracking-normal">
                    Cliente
                  </h2>
                </div>

                <div className="grid gap-3 text-sm text-muted-foreground">
                  <p>{fallback(event.client?.name)}</p>
                  <p>{fallback(event.client?.phone)}</p>
                  <p>{fallback(event.client?.email)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="orbit-shell rounded-lg p-6 text-muted-foreground">
          Evento não encontrado.
        </div>
      )}
    </div>
  );
}
