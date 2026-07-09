"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Banknote,
  CalendarDays,
  CircleDollarSign,
  ReceiptText,
  Search,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { PageHeader } from "@/components/orbit/page-header";
import { StatCard } from "@/components/orbit/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { listArtistsService } from "@/services/artists.service";
import { listEventsService } from "@/services/events.service";
import { getFinancialSummaryService } from "@/services/financial.service";
import type { Artist } from "@/types/artist";
import type { Event } from "@/types/event";
import { canManageArtists, canViewFinancial } from "@/utils/auth-permissions";
import { formatEventDate } from "@/utils/formatEventDate";
import { cn } from "@/utils/utils";

const months = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" },
];

function formatCurrency(value?: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value ?? 0);
}

function getEventFee(event: Event) {
  return Number(event.fee ?? 0);
}

function sortFinancialEvents(first: Event, second: Event) {
  const firstPaymentDate = first.paymentDate
    ? new Date(first.paymentDate).getTime()
    : 0;
  const secondPaymentDate = second.paymentDate
    ? new Date(second.paymentDate).getTime()
    : 0;

  if (firstPaymentDate !== secondPaymentDate) {
    return secondPaymentDate - firstPaymentDate;
  }

  return (
    new Date(second.eventDate).getTime() - new Date(first.eventDate).getTime()
  );
}

function getFinancialPerson(event: Event) {
  return (
    event.artist?.stageName ||
    event.artist?.name ||
    event.client?.companyName ||
    event.client?.name ||
    "Não informado"
  );
}

function isInSelectedPeriod(event: Event, month: number, year: number) {
  const referenceDate = event.paymentDate ?? event.eventDate;
  const date = new Date(referenceDate);

  return date.getMonth() + 1 === month && date.getFullYear() === year;
}

export default function FinancialPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [appliedMonth, setAppliedMonth] = useState<number | undefined>();
  const [appliedYear, setAppliedYear] = useState<number | undefined>();
  const [artistId, setArtistId] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isEventsLoading, setIsEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState(false);
  const [query, setQuery] = useState("");
  const canAccessFinancial = canViewFinancial(user);
  const canFilterByArtist = canManageArtists(user);
  const hasDateFilter = appliedMonth !== undefined && appliedYear !== undefined;
  const appliedArtistId = canFilterByArtist ? artistId || undefined : undefined;
  const summaryParams =
    hasDateFilter || appliedArtistId
      ? {
          month: appliedMonth,
          year: appliedYear,
          artistId: appliedArtistId,
        }
      : undefined;

  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ["financial-summary", appliedMonth, appliedYear, appliedArtistId],
    queryFn: () => getFinancialSummaryService(summaryParams),
    enabled: !isAuthLoading && canAccessFinancial,
  });

  function handleApplyDateFilter() {
    setAppliedMonth(month);
    setAppliedYear(year);
  }

  function handleShowAllEvents() {
    setAppliedMonth(undefined);
    setAppliedYear(undefined);
  }

  useEffect(() => {
    async function loadFinancialEvents() {
      if (!canAccessFinancial) {
        setIsEventsLoading(false);
        return;
      }

      try {
        setIsEventsLoading(true);
        setEventsError(false);
        const data = await listEventsService();
        setEvents(data);
      } catch (error) {
        console.error("Erro ao buscar dados financeiros:", error);
        setEventsError(true);
      } finally {
        setIsEventsLoading(false);
      }
    }

    if (!isAuthLoading) {
      loadFinancialEvents();
    }
  }, [canAccessFinancial, isAuthLoading]);

  useEffect(() => {
    async function loadArtists() {
      if (!canFilterByArtist) {
        setArtists([]);
        return;
      }

      try {
        const data = await listArtistsService();
        setArtists(data);
      } catch (error) {
        console.error("Erro ao buscar artistas para o financeiro:", error);
      }
    }

    if (!isAuthLoading) {
      loadArtists();
    }
  }, [canFilterByArtist, isAuthLoading]);

  const financialEvents = useMemo(
    () =>
      events
        .filter((event) => getEventFee(event) > 0)
        .filter((event) =>
          appliedArtistId ? event.artist?.id === appliedArtistId : true,
        )
        .filter((event) =>
          hasDateFilter
            ? isInSelectedPeriod(event, appliedMonth, appliedYear)
            : true,
        )
        .sort(sortFinancialEvents),
    [appliedArtistId, appliedMonth, appliedYear, events, hasDateFilter],
  );

  const localSummary = useMemo(() => {
    const totalRevenue = financialEvents.reduce(
      (sum, event) => sum + getEventFee(event),
      0,
    );

    return {
      totalEvents: financialEvents.length,
      totalRevenue,
      averageFee:
        financialEvents.length > 0 ? totalRevenue / financialEvents.length : 0,
    };
  }, [financialEvents]);

  const displaySummary = useMemo(() => {
    if (appliedArtistId) {
      return localSummary;
    }

    if (
      summary &&
      (summary.totalEvents > 0 ||
        summary.totalRevenue > 0 ||
        summary.averageFee > 0)
    ) {
      return summary;
    }

    return localSummary;
  }, [appliedArtistId, localSummary, summary]);

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return financialEvents.filter((event) => {
      if (!normalizedQuery) return true;

      return [
        event.title,
        event.venueName,
        event.city,
        event.state,
        event.paymentMethod ?? "",
        event.client?.name ?? "",
        event.client?.companyName ?? "",
        event.artist?.name ?? "",
        event.artist?.stageName ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [financialEvents, query]);

  return (
    <div>
      <PageHeader
        eyebrow="Financeiro"
        title="Financeiro"
        description="Valores dos eventos disponíveis para o seu acesso."
      />

      <Card className="orbit-shell mb-6">
        <CardContent className="grid gap-4 p-4 sm:grid-cols-2 lg:flex lg:items-end">
          {canFilterByArtist ? (
            <label className="grid gap-2 sm:col-span-2 lg:min-w-64">
              <span className="text-xs font-semibold uppercase text-muted-foreground">
                Artista
              </span>
              <select
                value={artistId}
                onChange={(event) => setArtistId(event.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring">
                <option value="">Todos os artistas</option>
                {artists.map((artist) => (
                  <option key={artist.id} value={artist.id}>
                    {artist.stageName || artist.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label className="grid gap-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              Mês
            </span>
            <select
              value={month}
              onChange={(event) => setMonth(Number(event.target.value))}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring">
              {months.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              Ano
            </span>
            <Input
              type="number"
              min={2000}
              max={2100}
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
              className="h-10"
            />
          </label>

          <div className="grid grid-cols-2 gap-2 sm:col-span-2 lg:flex lg:pb-0">
            <button
              type="button"
              onClick={handleApplyDateFilter}
              className="h-10 rounded-md border border-transparent bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-glow transition-colors hover:bg-primary/90">
              Filtrar
            </button>

            <button
              type="button"
              onClick={handleShowAllEvents}
              className={cn(
                "h-10 rounded-md border border-border px-4 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                !hasDateFilter && "bg-accent text-foreground",
              )}>
              Mostrar todos
            </button>
          </div>
        </CardContent>
      </Card>

      {isSummaryError ? (
        <Card className="orbit-shell mb-6">
          <CardContent className="p-6">
            <p className="mb-4 text-sm text-muted-foreground">
              Não foi possível carregar o resumo financeiro.
            </p>
            <button
              type="button"
              onClick={() => refetchSummary()}
              className="h-10 rounded-md border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-accent">
              Tentar novamente
            </button>
          </CardContent>
        </Card>
      ) : (
        <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={CalendarDays}
            label={hasDateFilter ? "Eventos no mês" : "Eventos"}
            value={
              isSummaryLoading && isEventsLoading
                ? "--"
                : String(displaySummary.totalEvents)
            }
            detail={
              hasDateFilter
                ? "Eventos considerados no período"
                : "Eventos com cachê no total"
            }
          />

          <StatCard
            icon={CircleDollarSign}
            label={hasDateFilter ? "Receita do mês" : "Receita total"}
            value={
              isSummaryLoading && isEventsLoading
                ? "--"
                : formatCurrency(displaySummary.totalRevenue)
            }
            detail={hasDateFilter ? "Total recebido no período" : "Total geral"}
          />

          <StatCard
            icon={Banknote}
            label="Cachê médio"
            value={
              isSummaryLoading && isEventsLoading
                ? "--"
                : formatCurrency(displaySummary.averageFee)
            }
            detail="Média por evento com cachê"
          />
        </section>
      )}

      <div className="mb-5 flex items-center gap-3 rounded-lg border border-border bg-card/70 px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />

          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por evento, local, cliente, artista ou método"
            className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
        </div>
      </div>

      <Card className="orbit-shell overflow-hidden">
        <CardContent className="p-0">
          {isEventsLoading ? (
            <div className="p-6 text-muted-foreground">
              Carregando financeiro...
            </div>
          ) : eventsError ? (
            <div className="p-6 text-muted-foreground">
              Não foi possível carregar os lançamentos financeiros.
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-6 text-muted-foreground">
              Nenhum lançamento financeiro encontrado.
            </div>
          ) : (
            <>
              <div className="divide-y divide-border/70 md:hidden">
                {filteredEvents.map((event) => (
                  <article key={event.id} className="space-y-4 p-4">
                    <div className="min-w-0">
                      <Link
                        href={`/events/${event.id}`}
                        className="font-semibold text-foreground transition-colors hover:text-primary">
                        {event.title}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatEventDate(event.eventDate)} · {event.venueName}
                      </p>
                    </div>

                    <div className="grid gap-3 text-sm">
                      <div>
                        <p className="text-xs uppercase text-muted-foreground">
                          Pessoa
                        </p>
                        <p className="mt-1 font-medium">
                          {getFinancialPerson(event)}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {event.city}, {event.state}
                        </p>
                      </div>

                      <div className="flex items-start gap-2">
                        <WalletCards className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0">
                          <p>{event.paymentMethod ?? "Não informado"}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {event.paymentDate
                              ? formatEventDate(event.paymentDate, {
                                  year: "numeric",
                                })
                              : "Sem data"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs uppercase text-muted-foreground">
                          Valor
                        </p>
                        <p className="mt-1 text-lg font-semibold">
                          {formatCurrency(getEventFee(event))}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead className="border-b border-border bg-muted/30 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Evento</th>
                      <th className="px-5 py-4 font-semibold">Pessoa</th>
                      <th className="px-5 py-4 font-semibold">Pagamento</th>
                      <th className="px-5 py-4 text-right font-semibold">
                        Valor
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredEvents.map((event) => {
                      const person = getFinancialPerson(event);

                      return (
                        <tr
                          key={event.id}
                          className="border-b border-border/70 last:border-b-0">
                          <td className="px-5 py-4">
                            <Link
                              href={`/events/${event.id}`}
                              className="font-semibold text-foreground transition-colors hover:text-primary">
                              {event.title}
                            </Link>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {formatEventDate(event.eventDate)} ·{" "}
                              {event.venueName}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <p className="font-medium">{person}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {event.city}, {event.state}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-start gap-2">
                              <WalletCards className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                              <div>
                                <p>{event.paymentMethod ?? "Não informado"}</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {event.paymentDate
                                    ? formatEventDate(event.paymentDate, {
                                        year: "numeric",
                                      })
                                    : "Sem data"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-right font-semibold">
                            {formatCurrency(getEventFee(event))}
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
