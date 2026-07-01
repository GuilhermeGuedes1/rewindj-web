"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import {
  ArrowLeft,
  CalendarPlus,
  Check,
  Loader2,
  Sparkles,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type FieldErrors,
  type UseFormRegister,
  useForm,
} from "react-hook-form";

import { PageHeader } from "@/components/orbit/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import {
  eventSchema,
  paymentMethodLabels,
  paymentMethodValues,
  type EventFormValues,
} from "@/schemas/event.schema";
import { aiService } from "@/services/ai.service";
import { createEventService } from "@/services/events.service";
import { listArtistsService } from "@/services/artists.service";
import { getClientsService } from "@/services/clients.service";
import type { Artist } from "@/types/artist";
import type { Client } from "@/types/client";
import type { CreateEventPayload } from "@/types/event";
import { cn } from "@/utils/utils";

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

function normalizePhone(value?: string | null) {
  return (value ?? "").replace(/\D/g, "");
}

function normalizeEmail(value?: string | null) {
  return (value ?? "").trim().toLowerCase();
}

function normalizeClientName(value?: string | null) {
  return (value ?? "").trim().toLowerCase();
}

function formatCurrencyInput(value?: number | string | null) {
  if (value === null || value === undefined || value === "") return "";

  const numberValue =
    typeof value === "number" ? value : Number(String(value).replace(",", "."));

  if (Number.isNaN(numberValue)) return "";

  return String(numberValue);
}

function normalizePaymentMethod(
  value?: string | null,
): EventFormValues["paymentMethod"] {
  if (!value) return "";

  const normalizedValue = normalizeName(value);
  const aliases: Record<string, EventFormValues["paymentMethod"]> = {
    deposito: "DEPOSIT",
    deposit: "DEPOSIT",
    transferencia: "DEPOSIT",
    transfer: "DEPOSIT",
    integralnoevento: "FULL_ON_EVENT",
    pagamentonoevento: "FULL_ON_EVENT",
    noevento: "FULL_ON_EVENT",
    invoice: "INVOICE",
    notafiscal: "INVOICE",
    boleto: "INVOICE",
    parcelado: "INSTALLMENTS",
    parcelas: "INSTALLMENTS",
    installments: "INSTALLMENTS",
    pix: "PIX",
    dinheiro: "CASH",
    cash: "CASH",
    outro: "OTHER",
    other: "OTHER",
  };

  const enumValue = paymentMethodValues.find(
    (method) => normalizeName(method) === normalizedValue,
  );

  return enumValue ?? aliases[normalizedValue] ?? "";
}

function formatClientMeta(client: Client) {
  return [client.companyName, client.phone].filter(Boolean).join(" • ");
}

type ClientMatchInput = {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
};

function getClientMatchSignature({ name, phone, email }: ClientMatchInput) {
  return [
    normalizeClientName(name),
    normalizePhone(phone),
    normalizeEmail(email),
  ].join("|");
}

function findExistingClientMatch(input: ClientMatchInput, clients: Client[]) {
  const phone = normalizePhone(input.phone);
  const email = normalizeEmail(input.email);
  const name = normalizeClientName(input.name);

  if (phone) {
    const matchedByPhone = clients.find(
      (client) => normalizePhone(client.phone) === phone,
    );

    if (matchedByPhone) return matchedByPhone;
  }

  if (email) {
    const matchedByEmail = clients.find(
      (client) => normalizeEmail(client.email) === email,
    );

    if (matchedByEmail) return matchedByEmail;
  }

  if (name) {
    return clients.find((client) => normalizeClientName(client.name) === name);
  }

  return undefined;
}

type ClientSectionProps = {
  register: UseFormRegister<EventFormValues>;
  errors: FieldErrors<EventFormValues>;
  clientMode: EventFormValues["clientMode"];
  selectedClientId?: string;
  clients: Client[];
  filteredClients: Client[];
  clientsLoading: boolean;
  clientSearch: string;
  autoSelectedMessage: string | null;
  onClientSearchChange: (value: string) => void;
  onExistingModeSelect: () => void;
  onNewModeSelect: () => void;
  onClientSelect: (clientId: string) => void;
};

function ClientSection({
  register,
  errors,
  clientMode,
  selectedClientId,
  clients,
  filteredClients,
  clientsLoading,
  clientSearch,
  autoSelectedMessage,
  onClientSearchChange,
  onExistingModeSelect,
  onNewModeSelect,
  onClientSelect,
}: ClientSectionProps) {
  return (
    <section className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
      <input type="hidden" {...register("clientMode")} />
      <input type="hidden" {...register("clientId")} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-normal">Cliente</h2>
          <p className="text-sm text-muted-foreground">
            Escolha um cliente cadastrado ou informe um novo contato.
          </p>
        </div>

        <div className="grid grid-cols-2 rounded-md border border-border bg-background/40 p-1">
          <button
            type="button"
            className={cn(
              "rounded-sm px-3 py-2 text-sm font-semibold transition-colors",
              clientMode === "existing"
                ? "bg-primary text-primary-foreground shadow-glow"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
            onClick={onExistingModeSelect}>
            Cliente existente
          </button>

          <button
            type="button"
            className={cn(
              "rounded-sm px-3 py-2 text-sm font-semibold transition-colors",
              clientMode === "new"
                ? "bg-primary text-primary-foreground shadow-glow"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
            onClick={onNewModeSelect}>
            Novo cliente
          </button>
        </div>
      </div>

      {clientMode === "existing" ? (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="clientSearch">Buscar cliente</Label>
            <Input
              id="clientSearch"
              value={clientSearch}
              onChange={(event) => onClientSearchChange(event.target.value)}
              placeholder="Nome, empresa ou telefone"
              disabled={clientsLoading}
            />
          </div>

          {clientsLoading ? (
            <div className="rounded-md border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              Carregando clientes...
            </div>
          ) : clients.length === 0 ? (
            <div className="rounded-md border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              Nenhum cliente cadastrado ainda. Use o modo Novo cliente para
              informar os dados deste evento.
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="rounded-md border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              Nenhum cliente encontrado para esta busca.
            </div>
          ) : (
            <div className="max-h-72 space-y-2 overflow-y-auto rounded-md border border-border bg-background/30 p-2">
              {filteredClients.map((client) => {
                const isSelected = selectedClientId === client.id;

                return (
                  <button
                    key={client.id}
                    type="button"
                    className={cn(
                      "flex w-full items-start justify-between gap-3 rounded-md border px-3 py-3 text-left transition-colors",
                      isSelected
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-transparent hover:bg-accent hover:text-foreground",
                    )}
                    onClick={() => onClientSelect(client.id)}>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">
                        {client.name}
                      </span>
                      {formatClientMeta(client) ? (
                        <span className="block truncate text-sm text-muted-foreground">
                          {formatClientMeta(client)}
                        </span>
                      ) : null}
                    </span>

                    {isSelected ? (
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}

          {autoSelectedMessage ? (
            <p className="text-sm text-primary">{autoSelectedMessage}</p>
          ) : null}

          {errors.clientId ? (
            <p className="text-sm text-destructive">
              {errors.clientId.message}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
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

            <div className="space-y-2">
              <Label htmlFor="clientPhone">Telefone do cliente</Label>
              <Input
                id="clientPhone"
                placeholder="21999999999"
                {...register("clientPhone")}
              />
              {errors.clientPhone ? (
                <p className="text-sm text-destructive">
                  {errors.clientPhone.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
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

            <div className="space-y-2">
              <Label htmlFor="clientCompanyName">Empresa do cliente</Label>
              <Input
                id="clientCompanyName"
                placeholder="Opcional"
                {...register("clientCompanyName")}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default function NewEventPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [artists, setArtists] = useState<Artist[]>([]);
  const [artistsLoading, setArtistsLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientsLoaded, setClientsLoaded] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [autoSelectedClientMessage, setAutoSelectedClientMessage] = useState<
    string | null
  >(null);
  const [suppressedAutoMatchSignature, setSuppressedAutoMatchSignature] =
    useState<string | null>(null);
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
    watch,
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
      clientMode: "existing",
      clientId: "",
      clientName: "",
      clientPhone: "",
      clientEmail: "",
      clientCompanyName: "",
      notes: "",
    },
  });

  const clientMode = watch("clientMode");
  const selectedClientId = watch("clientId");
  const clientName = watch("clientName");
  const clientPhone = watch("clientPhone");
  const clientEmail = watch("clientEmail");

  const clientMatchInput = useMemo(
    () => ({
      name: clientName,
      phone: clientPhone,
      email: clientEmail,
    }),
    [clientEmail, clientName, clientPhone],
  );

  const clientMatchSignature = useMemo(
    () => getClientMatchSignature(clientMatchInput),
    [clientMatchInput],
  );

  const filteredClients = useMemo(() => {
    const query = normalizeName(clientSearch);

    if (!query) return clients;

    return clients.filter((client) =>
      normalizeName(
        `${client.name} ${client.companyName ?? ""} ${client.phone}`,
      ).includes(query),
    );
  }, [clientSearch, clients]);

  const loadClients = useCallback(async () => {
    if (clientsLoaded || clientsLoading) return;

    try {
      setClientsLoading(true);
      const data = await getClientsService();
      setClients(data);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    } finally {
      setClientsLoaded(true);
      setClientsLoading(false);
    }
  }, [clientsLoaded, clientsLoading]);

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
    if (clientMode !== "existing" || clientsLoaded || clientsLoading) return;

    loadClients();
  }, [clientMode, clientsLoaded, clientsLoading, loadClients]);

  useEffect(() => {
    if (clientMode !== "new" || !clientMatchSignature.replace(/\|/g, "")) {
      return;
    }

    if (!clientsLoaded) {
      loadClients();
      return;
    }

    if (suppressedAutoMatchSignature === clientMatchSignature) {
      return;
    }

    const matchedClient = findExistingClientMatch(clientMatchInput, clients);

    if (!matchedClient) {
      setAutoSelectedClientMessage(null);
      return;
    }

    setValue("clientMode", "existing", { shouldValidate: true });
    setValue("clientId", matchedClient.id, { shouldValidate: true });
    setClientSearch(matchedClient.name);
    setAutoSelectedClientMessage(
      "Cliente existente encontrado e selecionado automaticamente.",
    );
  }, [
    clientMatchInput,
    clientMatchSignature,
    clientMode,
    clients,
    clientsLoaded,
    loadClients,
    setValue,
    suppressedAutoMatchSignature,
  ]);

  async function handleGenerateDraft() {
    setAiError(null);
    setSuggestedArtistName(null);

    if (!aiMessage.trim()) {
      setAiError("Cole uma mensagem do WhatsApp antes de gerar o rascunho.");
      return;
    }

    try {
      setAiLoading(true);

      const draft = await aiService.generateEventDraft(aiMessage, "create");

      setSuppressedAutoMatchSignature(null);
      setAutoSelectedClientMessage(null);
      setValue("clientMode", "new", { shouldValidate: true });
      setValue("clientId", "", { shouldValidate: true });
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

      setValue("paymentMethod", normalizePaymentMethod(draft.paymentMethod), {
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
      const eventPayload = {
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
      };

      const payload: CreateEventPayload =
        values.clientMode === "existing"
          ? {
              ...eventPayload,
              clientId: values.clientId ?? "",
            }
          : {
              ...eventPayload,
              clientName: values.clientName ?? "",
              clientPhone: values.clientPhone ?? "",
              clientEmail: values.clientEmail ?? "",
              clientCompanyName: values.clientCompanyName ?? "",
            };

      console.log("PAYLOAD", payload);
      await createEventService(payload);

      router.push("/events");
    } catch (error) {
      const message = isAxiosError(error)
        ? error.response?.data?.message
        : null;

      console.error(isAxiosError(error) ? error.response?.data : error);
      setError(message ?? "Nao foi possivel criar o evento agora.");
    }
  }

  function handleExistingModeSelect() {
    setSuppressedAutoMatchSignature(null);
    setAutoSelectedClientMessage(null);
    setValue("clientMode", "existing", { shouldValidate: true });
  }

  function handleNewModeSelect() {
    setSuppressedAutoMatchSignature(clientMatchSignature);
    setAutoSelectedClientMessage(null);
    setValue("clientMode", "new", { shouldValidate: true });
    setValue("clientId", "", { shouldValidate: true });
  }

  function handleClientSelect(clientId: string) {
    setSuppressedAutoMatchSignature(null);
    setAutoSelectedClientMessage(null);
    setValue("clientId", clientId, { shouldValidate: true });
  }

  return (
    <div>
      <PageHeader
        eyebrow="Novo evento"
        title="Crie uma noite memorável"
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
                Cole um briefing recebido no WhatsApp. O Rewindj interpreta
                data, horário, local, cliente e artista para montar um rascunho.
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

                <select
                  id="paymentMethod"
                  className="flex h-12 w-full rounded-md border border-input bg-muted/55 px-4 py-2 text-base text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
                  {...register("paymentMethod")}>
                  <option value="">Selecione</option>
                  {paymentMethodValues.map((method) => (
                    <option key={method} value={method}>
                      {paymentMethodLabels[method]}
                    </option>
                  ))}
                </select>

                {errors.paymentMethod ? (
                  <p className="text-sm text-destructive">
                    {errors.paymentMethod.message}
                  </p>
                ) : null}
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

            <div className="space-y-2">
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
            </div>

            <ClientSection
              register={register}
              errors={errors}
              clientMode={clientMode}
              selectedClientId={selectedClientId}
              clients={clients}
              filteredClients={filteredClients}
              clientsLoading={clientsLoading}
              clientSearch={clientSearch}
              autoSelectedMessage={autoSelectedClientMessage}
              onClientSearchChange={setClientSearch}
              onExistingModeSelect={handleExistingModeSelect}
              onNewModeSelect={handleNewModeSelect}
              onClientSelect={handleClientSelect}
            />

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
              Salvar evento
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
