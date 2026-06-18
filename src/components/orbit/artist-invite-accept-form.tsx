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

type ArtistInviteAcceptFormProps = {
  token?: string | null;
};

const initialFormData: AcceptInvitePayload = {
  fullName: "",
  stageName: "",
  birthDate: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  password: "",
};

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
        setError("Não foi possível carregar este convite.");
      } finally {
        setIsLoadingInvite(false);
      }
    }

    loadInvite();
  }, [token]);

  function updateField(name: keyof AcceptInvitePayload, value: string) {
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setError("Token do convite não encontrado.");
      return;
    }

    if (
      !formData.fullName.trim() ||
      !formData.phone.trim() ||
      !formData.password.trim()
    ) {
      setError("Informe nome completo, telefone e senha.");
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
        fullName: formData.fullName.trim(),
        stageName: formData.stageName?.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      });

      setAccepted(true);
    } catch (error) {
      if (isAxiosError(error)) {
        console.log("ERRO ACCEPT INVITE:", error.response?.data);
        console.log("PAYLOAD ENVIADO:", {
          ...formData,
          fullName: formData.fullName.trim(),
          stageName: formData.stageName?.trim(),
          phone: formData.phone.trim(),
          password: formData.password,
        });
      } else {
        console.error("Erro ao aceitar convite:", error);
      }

      setError("Não foi possível concluir seu cadastro agora.");
    }
  }

  return (
    <Card className="orbit-shell mx-auto w-full max-w-xl">
      <CardHeader>
        <div className="mb-3 flex size-12 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-glow">
          {accepted ? <CheckCircle2 /> : <Ticket />}
        </div>
        <CardTitle>
          {accepted ? "Cadastro concluído" : "Convite Orbit"}
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
                <Label htmlFor="fullName">Nome completo</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(event) =>
                    updateField("fullName", event.target.value)
                  }
                  placeholder="Rafael Lisboa"
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  placeholder="21999999999"
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repita sua senha"
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
              Concluir cadastro
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
