"use client";

import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { EventCard } from "@/components/orbit/event-card";
import { PageHeader } from "@/components/orbit/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEvents } from "@/hooks/use-events";
import { useAuth } from "@/hooks/useAuth";
import {
  canCreateEvent,
  isAgencyArtist,
  isIndependentArtist,
} from "@/utils/auth-permissions";

export default function EventsPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const hasArtistAgenda = isAgencyArtist(user) || isIndependentArtist(user);
  const { data: response, isLoading, error } = useEvents(page);

  useEffect(() => {
    if (error) {
      console.error("Erro ao buscar eventos:", error);
    }
  }, [error]);

  const filteredEvents = useMemo(() => {
    const events = response?.data ?? [];
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return events;
    }

    return events.filter((event) =>
      [
        event.title,
        event.venueName,
        event.city,
        event.state,
        event.client?.name ?? "",
        event.client?.companyName ?? "",
        event.artist?.name ?? "",
        event.artist?.stageName ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query, response]);

  return (
    <div>
      <PageHeader
        title={hasArtistAgenda ? "Minha agenda" : "Eventos"}
        description={
          hasArtistAgenda
            ? "Seus próximos eventos e histórico em uma lista visual para acompanhar datas, locais e horários."
            : "Uma lista visual para acompanhar datas, locais, horários e contexto antes da noite começar."
        }
        action={
          canCreateEvent(user) ? (
            <Button asChild>
              <Link href="/events/create">
                <Plus className="size-4" />
                Novo evento
              </Link>
            </Button>
          ) : null
        }
      />

      <div className="mb-5 flex items-center gap-3 rounded-lg border border-border bg-card/70 px-4 py-3">
        <Search className="size-4 shrink-0 text-muted-foreground" />

        <Input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
          placeholder="Buscar por evento, local, cliente ou artista"
          className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
        />
      </div>

      {isLoading ? (
        <div className="orbit-shell rounded-lg p-6 text-muted-foreground">
          Carregando eventos...
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="orbit-shell rounded-lg p-6 text-muted-foreground">
          Nenhum evento encontrado.
        </div>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </section>
      )}

      {!isLoading && response ? (
        <div className="mt-5 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => setPage((page) => page - 1)}
            disabled={page === 1}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page} de {response.meta.pageTotal}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((page) => page + 1)}
            disabled={page === response.meta.pageTotal}
          >
            Próxima
          </Button>
        </div>
      ) : null}
    </div>
  );
}
