import { CalendarDays, Clock, MapPin, Music } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Event } from "@/types/event";

interface EventCardProps {
  event: Event;
  featured?: boolean;
}

function formatEventDate(value: string) {
  if (!value) return "--";

  const dateOnly = value.split("T")[0];
  const [year, month, day] = dateOnly.split("-");

  if (!year || !month || !day) return "--";

  const monthName = new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))));

  return `${day} ${monthName}`;
}

function getStatusLabel(status?: string | null) {
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

export function EventCard({ event, featured = false }: EventCardProps) {
  console.log(event);
  const artistName =
    event.artist?.stageName && event.artist.stageName !== "string"
      ? event.artist.stageName
      : (event.artist?.name ?? "Artista não definido");

  const formattedDate = formatEventDate(event.eventDate);
  const dateParts = formattedDate.split(" ");

  return (
    <Link
      href={`/events/${event.id}`}
      aria-label={`Ver detalhes de ${event.title}`}
      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <Card className="orbit-shell overflow-hidden transition-colors hover:border-primary/40">
        <CardContent className={featured ? "p-5 sm:p-6" : "p-5"}>
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex gap-4">
              <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-md bg-primary text-primary-foreground shadow-glow">
                <span className="text-lg font-black leading-none">
                  {dateParts[0]}
                </span>

                <span className="text-[10px] font-bold uppercase">
                  {dateParts[2] ?? dateParts[1]}
                </span>
              </div>

              <div className="min-w-0 space-y-2">
                <h2 className="line-clamp-2 text-xl font-semibold tracking-normal">
                  {event.title}
                </h2>

                <Badge className="w-fit">{getStatusLabel(event.status)}</Badge>
              </div>
            </div>

            {featured ? <Badge variant="silver">Destaque</Badge> : null}
          </div>

          <div className="grid gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-primary" />
              {event.startTime} - {event.endTime}
            </div>

            <div className="flex items-center gap-2">
              <Music className="size-4 text-primary" />
              {artistName}
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              {event.venueName}
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              {event.city}, {event.state}
            </div>

            {event.notes ? (
              <div className="flex items-start gap-2">
                <CalendarDays className="mt-0.5 size-4 text-primary" />
                <p className="line-clamp-2 leading-6">{event.notes}</p>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
