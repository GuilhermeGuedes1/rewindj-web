"use client";

import { CheckCircle2, Loader2, Ticket } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { isAxiosError } from "axios";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  invitesService,
  type AcceptInvitePayload,
  type InviteDetails,
} from "@/services/invites.service";
import { phoneMask } from "@/utils/phoneMask";

type ArtistInviteAcceptFormProps = {
  token?: string | null;
};

const initialFormData: AcceptInvitePayload = {
  name: "",
  stageName: "",
  birthDate: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  password: "",
};

function getApiErrorMessage(error: unknown) {
  if (!isAxiosError(error)) {
    return "Não foi possível concluir seu cadastro agora.";
  }

  const message = error.response?.data?.message;

  if (Array.isArray(message)) {
    return message[0] ?? "Não foi possível concluir seu cadastro agora.";
  }

  if (typeof message === "string") {
    return message;
  }

  return "Não foi possível concluir seu cadastro agora.";
}

export function ArtistInviteAcceptForm({ token }: ArtistInviteAcceptFormProps) {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);
  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoadingInvite, setIsLoadingInvite] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const organizationName =
    invite?.organization?.name ?? invite?.organizationName ?? "Organização";

  useEffect(() => {
    async function loadInvite() {
      if (!token) {
        setError("Token do convite não encontrado.");
        setIsLoadingInvite(false);
        return;
      }

      try {
        const data = await invitesService.getInvite(token);
        setInvite(data);
      } catch (error) {
        console.error("Erro ao buscar convite:", error);
        setError(getApiErrorMessage(error));
      } finally {
        setIsLoadingInvite(false);
      }
    }

    loadInvite();
  }, [token]);

  function updateField(name: keyof AcceptInvitePayload, value: string) {
    setError(null);

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isAccepting) return;

    if (!token) {
      setError("Token do convite não encontrado.");
      return;
    }

    if (!formData.name.trim()) {
      setError("Informe seu nome completo.");
      return;
    }

    if (!formData.phone.trim()) {
      setError("Informe seu telefone.");
      return;
    }

    if (!formData.password.trim()) {
      setError("Informe uma senha.");
      return;
    }

    if (formData.password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    try {
      setIsAccepting(true);
      setError(null);

      await invitesService.acceptInvite(token, {
        ...formData,
        name: formData.name.trim(),
        stageName: formData.stageName?.trim(),
        birthDate: formData.birthDate || undefined,
        phone: formData.phone.replace(/\D/g, ""),
        address: formData.address?.trim(),
        city: formData.city?.trim(),
        state: formData.state?.trim().toUpperCase(),
        password: formData.password,
      });

      setAccepted(true);
    } catch (error) {
      console.error("Erro ao aceitar convite:", error);
      setError(getApiErrorMessage(error));
    } finally {
      setIsAccepting(false);
    }
  }

  return (
    <Card className="orbit-shell mx-auto w-full max-w-xl">
      <CardHeader>
        <div className="mb-3 flex size-12 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-glow">
          {accepted ? <CheckCircle2 /> : <Ticket />}
        </div>

        <CardTitle>
          {accepted ? "Cadastro concluído" : "Convite RewindJ"}
        </CardTitle>

        <CardDescription>
          {accepted
            ? "Seu acesso foi confirmado. Entre para continuar."
            : "Complete seus dados de artista para entrar na organização."}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {isLoadingInvite ? (
          <p className="text-sm text-muted-foreground">Carregando convite...</p>
        ) : invite ? (
          <div className="space-y-3 rounded-lg border border-border bg-muted/35 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Organização</span>
              <Badge variant="silver">{organizationName}</Badge>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="truncate text-sm">{invite.email}</span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Papel</span>
              <span className="text-sm">{invite.role}</span>
            </div>
          </div>
        ) : null}

        {accepted ? (
          <Button
            className="w-full"
            size="lg"
            onClick={() => router.push("/login")}>
            Entrar
          </Button>
        ) : (
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Rafael Lisboa"
                  disabled={isAccepting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stageName">Nome artístico</Label>
                <Input
                  id="stageName"
                  value={formData.stageName}
                  onChange={(event) =>
                    updateField("stageName", event.target.value)
                  }
                  placeholder="DJ Rafa Lisboa"
                  disabled={isAccepting}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="birthDate">Data de nascimento</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(event) =>
                    updateField("birthDate", event.target.value)
                  }
                  disabled={isAccepting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(event) =>
                    updateField("phone", phoneMask(event.target.value))
                  }
                  placeholder="(21) 99999-9999"
                  disabled={isAccepting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(event) => updateField("address", event.target.value)}
                placeholder="Rua, número, complemento"
                disabled={isAccepting}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_7rem]">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(event) => updateField("city", event.target.value)}
                  placeholder="Rio de Janeiro"
                  disabled={isAccepting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  maxLength={2}
                  value={formData.state}
                  onChange={(event) =>
                    updateField("state", event.target.value.toUpperCase())
                  }
                  placeholder="RJ"
                  disabled={isAccepting}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(event) =>
                    updateField("password", event.target.value)
                  }
                  placeholder="Mínimo 6 caracteres"
                  disabled={isAccepting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => {
                    setError(null);
                    setConfirmPassword(event.target.value);
                  }}
                  placeholder="Repita sua senha"
                  disabled={isAccepting}
                />
              </div>
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <Button
              className="w-full"
              size="lg"
              type="submit"
              disabled={isLoadingInvite || isAccepting || !invite}>
              {isAccepting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <CheckCircle2 />
              )}
              {isAccepting ? "Concluindo..." : "Concluir cadastro"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
