import { CalendarDays, Clock, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Event } from "@/types/event";

interface EventCardProps {
  event: Event;
  featured?: boolean;
}

function formatEventDate(value: string) {
  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return "--";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

export function EventCard({ event, featured = false }: EventCardProps) {
  return (
    <Card className="orbit-shell overflow-hidden">
      <CardContent className={featured ? "p-5 sm:p-6" : "p-5"}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-md bg-primary text-primary-foreground shadow-glow">
              <span className="text-lg font-black leading-none">
                {formatEventDate(event.eventDate).split(" ")[0]}
              </span>
              <span className="text-[10px] font-bold uppercase">
                {formatEventDate(event.eventDate).split(" ")[2] ??
                  formatEventDate(event.eventDate).split(" ")[1]}
              </span>
            </div>
            <div className="min-w-0 space-y-2">
              <h2 className="line-clamp-2 text-xl font-semibold tracking-normal">
                {event.title}
              </h2>
              <Badge variant="silver" className="w-fit">
                {event.venueName}
              </Badge>
            </div>
          </div>
          {featured ? <Badge>Ao vivo</Badge> : null}
        </div>

        <div className="grid gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-primary" />
            {event.startTime} - {event.endTime}
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
  );
}
