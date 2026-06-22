"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import {
  ArrowLeft,
  CalendarPlus,
  Loader2,
  Sparkles,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { useParams } from "next/navigation";

import { PageHeader } from "@/components/orbit/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { eventSchema, type EventFormValues } from "@/schemas/event.schema";
import { aiService } from "@/services/ai.service";
import { listArtistsService } from "@/services/artists.service";
import type { Artist } from "@/types/artist";

import {
  getEventByIdService,
  updateEventService,
} from "@/services/events.service";

function normalizeDate(value?: string | null) {
  if (!value) return "";

  if (value.includes("/")) {
    const [day, month, year] = value.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  return value.slice(0, 10);
}

function normalizeTime(value?: string | null) {
  if (!value) return "";

  const cleanValue = value.trim().toLowerCase();

  if (cleanValue.includes(":")) {
    return cleanValue.slice(0, 5);
  }

  if (cleanValue.includes("h")) {
    const [hour, minutes] = cleanValue.split("h");
    return `${hour.padStart(2, "0")}:${(minutes || "00").padStart(2, "0")}`;
  }

  if (/^\d{1,2}$/.test(cleanValue)) {
    return `${cleanValue.padStart(2, "0")}:00`;
  }

  return "";
}

function normalizeName(value?: string | null) {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function formatCurrencyInput(value?: number | string | null) {
  if (value === null || value === undefined || value === "") return "";

  const numberValue =
    typeof value === "number" ? value : Number(String(value).replace(",", "."));

  if (Number.isNaN(numberValue)) return "";

  return String(numberValue);
}

export default function EditEventPage() {
  const { user } = useAuth();

  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [artists, setArtists] = useState<Artist[]>([]);
  const [artistsLoading, setArtistsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiMessage, setAiMessage] = useState("");
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [suggestedArtistName, setSuggestedArtistName] = useState<string | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      eventDate: "",
      startTime: "",
      endTime: "",
      setDuration: "",
      venueName: "",
      address: "",
      city: "",
      state: "",
      fee: "",
      paymentDate: "",
      paymentMethod: "",
      status: "NEGOTIATING",
      hasContract: false,
      artistId: "",
      clientName: "",
      clientPhone: "",
      clientEmail: "",
      clientCompanyName: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (user?.role === "ARTIST") {
      router.replace("/dashboard");
      return;
    }

    async function loadArtists() {
      try {
        const data = await listArtistsService();
        setArtists(data);
      } catch (error) {
        console.error("Erro ao buscar artistas:", error);
      } finally {
        setArtistsLoading(false);
      }
    }

    loadArtists();
  }, [router, user?.role]);

  useEffect(() => {
    async function loadEvent() {
      try {
        const event = await getEventByIdService(id);

        reset({
          title: event.title,
          eventDate: event.eventDate?.slice(0, 10) ?? "",
          startTime: event.startTime ?? "",
          endTime: event.endTime ?? "",
          setDuration: event.setDuration ?? "",
          venueName: event.venueName ?? "",
          address: event.address ?? "",
          city: event.city ?? "",
          state: event.state ?? "",
          fee: event.fee?.toString() ?? "",
          paymentDate: event.paymentDate?.slice(0, 10) ?? "",
          paymentMethod: event.paymentMethod ?? "",
          status: event.status ?? "NEGOTIATING",
          hasContract: event.hasContract ?? false,
          artistId: event.artist?.id ?? "",
          clientName: event.client?.name ?? "",
          clientPhone: event.client?.phone ?? "",
          clientEmail: event.client?.email ?? "",
          clientCompanyName: event.client?.companyName ?? "",
          notes: event.notes ?? "",
        });
      } catch (error) {
        console.error("Erro ao carregar evento:", error);
      }
    }

    if (id) {
      loadEvent();
    }
  }, [id, reset]);

  async function handleGenerateDraft() {
    setAiError(null);
    setSuggestedArtistName(null);

    if (!aiMessage.trim()) {
      setAiError("Cole uma mensagem do WhatsApp antes de gerar o rascunho.");
      return;
    }

    try {
      setAiLoading(true);

      const draft = await aiService.generateEventDraft(aiMessage);

      setValue("title", draft.title ?? "", { shouldValidate: true });
      setValue("eventDate", normalizeDate(draft.eventDate), {
        shouldValidate: true,
      });
      setValue("startTime", normalizeTime(draft.startTime), {
        shouldValidate: true,
      });
      setValue("endTime", normalizeTime(draft.endTime), {
        shouldValidate: true,
      });
      setValue("setDuration", draft.setDuration ?? "", {
        shouldValidate: true,
      });
      setValue("venueName", draft.venueName ?? "", { shouldValidate: true });
      setValue("address", draft.address ?? "", { shouldValidate: true });
      setValue("city", draft.city ?? "", { shouldValidate: true });
      setValue("state", draft.state ?? "", { shouldValidate: true });
      setValue("paymentDate", normalizeDate(draft.paymentDate), {
        shouldValidate: true,
      });

      setValue("fee", formatCurrencyInput(draft.fee), {
        shouldValidate: true,
      });

      setValue("paymentMethod", draft.paymentMethod ?? "", {
        shouldValidate: true,
      });

      setValue("status", draft.status ?? "NEGOTIATING", {
        shouldValidate: true,
      });

      setValue("hasContract", draft.hasContract ?? false, {
        shouldValidate: true,
      });
      setValue("clientName", draft.clientName ?? "", { shouldValidate: true });
      setValue("clientPhone", draft.clientPhone ?? "", {
        shouldValidate: true,
      });
      setValue("clientEmail", draft.clientEmail ?? "", {
        shouldValidate: true,
      });
      setValue("clientCompanyName", draft.clientCompanyName ?? "", {
        shouldValidate: true,
      });
      setValue("notes", draft.notes ?? "", { shouldValidate: true });

      const normalizedDraftArtist = normalizeName(draft.artistName);

      const matchedArtist = artists.find((artist) => {
        const normalizedArtist = normalizeName(
          `${artist.name} ${artist.stageName ?? ""}`,
        );

        return (
          normalizedArtist.includes(normalizedDraftArtist) ||
          normalizedDraftArtist.includes(normalizedArtist)
        );
      });

      if (matchedArtist) {
        setValue("artistId", matchedArtist.id, { shouldValidate: true });
      } else if (draft.artistName) {
        setSuggestedArtistName(draft.artistName);
      }
    } catch (error) {
      console.error("Erro ao gerar rascunho com IA:", error);
      setAiError("Não foi possível gerar o evento com IA agora.");
    } finally {
      setAiLoading(false);
    }
  }

  async function onSubmit(values: EventFormValues) {
    setError(null);

    try {
      await updateEventService(id, {
        title: values.title,
        eventDate: values.eventDate,
        startTime: values.startTime || null,
        endTime: values.endTime || null,
        setDuration: values.setDuration || null,
        venueName: values.venueName,
        address: values.address,
        city: values.city,
        state: values.state,
        status: values.status,
        fee: values.fee ? Number(String(values.fee).replace(",", ".")) : null,
        paymentDate: values.paymentDate,
        paymentMethod: values.paymentMethod || null,
        hasContract: values.hasContract,
        notes: values.notes ?? "",
        artistId: values.artistId,
        clientName: values.clientName,
        clientPhone: values.clientPhone ?? "",
        clientEmail: values.clientEmail ?? "",
        clientCompanyName: values.clientCompanyName ?? "",
      });

      router.push(`/events/${id}`);
    } catch (error) {
      const message = isAxiosError(error)
        ? error.response?.data?.message
        : null;

      console.error(isAxiosError(error) ? error.response?.data : error);
      setError(message ?? "Nao foi possivel criar o evento agora.");
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Editar evento"
        title="Atualizar evento"
        description="Use IA para transformar uma mensagem do cliente em um rascunho de evento revisável."
        action={
          <Button variant="outline" asChild>
            <Link href="/events">
              <ArrowLeft />
              Voltar
            </Link>
          </Button>
        }
      />

      <Card className="mb-5 overflow-hidden border-primary/25 bg-card/85 shadow-glow">
        <CardContent className="p-5 sm:p-6">
          <div className="mb-5 flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-glow">
              <Sparkles />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold tracking-normal">
                Preencher com IA
              </h2>

              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                Cole um briefing recebido no WhatsApp. O Orbit interpreta data,
                horário, local, cliente e artista para montar um rascunho.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <Textarea
              value={aiMessage}
              onChange={(event) => setAiMessage(event.target.value)}
              className="min-h-36"
              placeholder="Casamento da Mariana no dia 20/07, das 18h às 23h, no Copacabana Palace. Cliente Mariana Silva, telefone 21999999999. Artista Rafael Lisboa."
            />

            {aiError ? (
              <p className="text-sm text-destructive">{aiError}</p>
            ) : null}

            <Button
              className="w-full sm:w-fit"
              size="lg"
              type="button"
              onClick={handleGenerateDraft}
              disabled={aiLoading}>
              {aiLoading ? <Loader2 className="animate-spin" /> : <Wand2 />}
              Preencher com IA
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="orbit-shell">
        <CardContent className="p-5 sm:p-6">
          <form className="grid gap-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-2">
                <Label htmlFor="title">Nome do evento</Label>
                <Input
                  id="title"
                  placeholder="Wedding at Copacabana Palace"
                  {...register("title")}
                />
                {errors.title ? (
                  <p className="text-sm text-destructive">
                    {errors.title.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventDate">Data</Label>
                <Input id="eventDate" type="date" {...register("eventDate")} />
                {errors.eventDate ? (
                  <p className="text-sm text-destructive">
                    {errors.eventDate.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startTime">Início do set</Label>
                <Input id="startTime" type="time" {...register("startTime")} />
                {errors.startTime ? (
                  <p className="text-sm text-destructive">
                    {errors.startTime.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">Fim do set</Label>
                <Input id="endTime" type="time" {...register("endTime")} />
                {errors.endTime ? (
                  <p className="text-sm text-destructive">
                    {errors.endTime.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="setDuration">Duração do set</Label>
                <Input
                  id="setDuration"
                  placeholder="2h, 90min..."
                  {...register("setDuration")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentDate">Data de pagamento</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  {...register("paymentDate")}
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Forma de pagamento</Label>
                <Input
                  id="paymentMethod"
                  placeholder="Pix, boleto, transferência..."
                  {...register("paymentMethod")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fee">Valor do cachê</Label>
                <Input
                  id="fee"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="1500.00"
                  {...register("fee")}
                />
                {errors.fee ? (
                  <p className="text-sm text-destructive">
                    {errors.fee.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>

                <select
                  id="status"
                  className="flex h-12 w-full rounded-md border border-input bg-muted/55 px-4 py-2 text-base text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
                  {...register("status")}>
                  <option value="NEGOTIATING">Em negociação</option>
                  <option value="CONFIRMED">Fechado</option>
                  <option value="LOST">Perdido</option>
                </select>
              </div>

              <label
                htmlFor="hasContract"
                className="flex h-12 items-center gap-3 self-end rounded-md border border-input bg-muted/55 px-4 py-2 text-sm text-foreground shadow-sm">
                <input
                  id="hasContract"
                  type="checkbox"
                  className="size-4 accent-primary"
                  {...register("hasContract")}
                />
                Contrato confirmado
              </label>
            </div>

            <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-2">
                <Label htmlFor="venueName">Local</Label>
                <Input
                  id="venueName"
                  placeholder="Copacabana Palace"
                  {...register("venueName")}
                />
                {errors.venueName ? (
                  <p className="text-sm text-destructive">
                    {errors.venueName.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  placeholder="Av. Atlântica, 1702"
                  {...register("address")}
                />
                {errors.address ? (
                  <p className="text-sm text-destructive">
                    {errors.address.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-[1fr_7rem]">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  placeholder="Rio de Janeiro"
                  {...register("city")}
                />
                {errors.city ? (
                  <p className="text-sm text-destructive">
                    {errors.city.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  placeholder="RJ"
                  maxLength={2}
                  {...register("state")}
                />
                {errors.state ? (
                  <p className="text-sm text-destructive">
                    {errors.state.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                placeholder="Brief, detalhes do set, restrições de acesso, contatos..."
                {...register("notes")}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="artistId">Artista</Label>

                <select
                  id="artistId"
                  className="flex h-12 w-full rounded-md border border-input bg-muted/55 px-4 py-2 text-base text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
                  {...register("artistId")}
                  disabled={artistsLoading}>
                  <option value="">
                    {artistsLoading
                      ? "Carregando artistas..."
                      : "Selecione um artista"}
                  </option>

                  {artists.map((artist) => (
                    <option key={artist.id} value={artist.id}>
                      {artist.stageName || artist.name}
                    </option>
                  ))}
                </select>

                {errors.artistId ? (
                  <p className="text-sm text-destructive">
                    {errors.artistId.message}
                  </p>
                ) : null}

                {suggestedArtistName ? (
                  <p className="text-sm text-muted-foreground">
                    Artista sugerido pela IA: {suggestedArtistName}. Selecione o
                    artista correto acima.
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientName">Cliente</Label>
                <Input
                  id="clientName"
                  placeholder="Mariana Silva"
                  {...register("clientName")}
                />
                {errors.clientName ? (
                  <p className="text-sm text-destructive">
                    {errors.clientName.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="clientPhone">Telefone do cliente</Label>
                <Input
                  id="clientPhone"
                  placeholder="21999999999"
                  {...register("clientPhone")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientEmail">Email do cliente</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  placeholder="mariana@email.com"
                  {...register("clientEmail")}
                />
                {errors.clientEmail ? (
                  <p className="text-sm text-destructive">
                    {errors.clientEmail.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientCompanyName">Empresa do cliente</Label>
              <Input
                id="clientCompanyName"
                placeholder="Opcional"
                {...register("clientCompanyName")}
              />
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <Button
              className="w-full sm:w-fit"
              size="lg"
              type="submit"
              disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <CalendarPlus />
              )}
              Salvar alterações
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
