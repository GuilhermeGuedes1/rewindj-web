"use client";

import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Mail,
  MapPin,
  Music,
  Phone,
  User,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/orbit/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getClientByIdService } from "@/services/clients.service";
import type { ClientDetails, ClientEvent } from "@/types/client";

function fallback(value?: string | null) {
  return value && value.trim() ? value : "Não informado";
}

function formatDate(value?: string | null) {
  if (!value) return "Não informado";

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return "Não informado";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function ClientEventCard({ event }: { event: ClientEvent }) {
  return (
    <Card className="orbit-shell overflow-hidden">
      <CardContent className="p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <h2 className="line-clamp-2 text-xl font-semibold tracking-normal">
              {fallback(event.title)}
            </h2>

            <Badge variant="silver" className="w-fit">
              {fallback(event.venueName)}
            </Badge>
          </div>

          <div className="flex shrink-0 flex-col items-center justify-center rounded-md bg-primary px-3 py-2 text-center text-primary-foreground shadow-glow">
            <span className="text-sm font-black leading-none">
              {formatDate(event.eventDate)}
            </span>
          </div>
        </div>

        <div className="grid gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Music className="size-4 text-primary" />
            {fallback(event.artistName)}
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-primary" />
            {fallback(event.venueName)}
          </div>

          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-primary" />
            {fallback(event.city)} - {fallback(event.state)}
          </div>
        </div>

        <Button className="mt-5 w-full" variant="outline" asChild>
          <Link href={`/events/${event.id}`}>Ver evento</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function ClientDetailsPage() {
  const params = useParams<{ id: string }>();
  const [client, setClient] = useState<ClientDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadClient() {
      if (!params.id) return;

      try {
        setIsLoading(true);
        setError(null);

        const data = await getClientByIdService(params.id);
        setClient(data);
      } catch (error) {
        console.error("Erro ao buscar cliente:", error);
        setError("Não foi possível carregar os detalhes deste cliente.");
      } finally {
        setIsLoading(false);
      }
    }

    loadClient();
  }, [params.id]);

  return (
    <div>
      <PageHeader
        eyebrow="Detalhes do cliente"
        title={client?.name ?? "Cliente"}
        description={client?.companyName ?? "Cliente Orbit"}
        action={
          <Button variant="outline" asChild>
            <Link href="/clients">
              <ArrowLeft />
              Voltar
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="orbit-shell rounded-lg p-6 text-muted-foreground">
          Carregando cliente...
        </div>
      ) : error ? (
        <div className="orbit-shell rounded-lg p-6 text-muted-foreground">
          {error}
        </div>
      ) : client ? (
        <div className="grid gap-4">
          <Card className="orbit-shell overflow-hidden">
            <CardContent className="p-5 sm:p-6">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold tracking-normal">
                    {fallback(client.name)}
                  </h2>

                  <Badge variant="silver" className="w-fit">
                    {fallback(client.companyName)}
                  </Badge>
                </div>

                <Badge>Cliente</Badge>
              </div>

              <div className="grid gap-4 text-sm text-muted-foreground sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <User className="size-4 text-primary" />
                  {fallback(client.name)}
                </div>

                <div className="flex items-center gap-2">
                  <Building2 className="size-4 text-primary" />
                  {fallback(client.companyName)}
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="size-4 text-primary" />
                  {fallback(client.phone)}
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="size-4 text-primary" />
                  {fallback(client.email)}
                </div>

                <div className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-primary" />
                  Cadastro: {formatDate(client.createdAt)}
                </div>
              </div>
            </CardContent>
          </Card>

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold tracking-normal">
                Histórico de Eventos
              </h2>

              <Badge variant="silver">{client.events.length}</Badge>
            </div>

            {client.events.length === 0 ? (
              <div className="orbit-shell rounded-lg p-6 text-muted-foreground">
                Nenhum evento encontrado para este cliente.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {client.events.map((event) => (
                  <ClientEventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </section>
        </div>
      ) : (
        <div className="orbit-shell rounded-lg p-6 text-muted-foreground">
          Cliente não encontrado.
        </div>
      )}
    </div>
  );
}
