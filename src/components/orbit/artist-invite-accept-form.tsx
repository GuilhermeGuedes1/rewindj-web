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
import { invitesService, type InviteDetails } from "@/services/invites.service";

type ArtistInviteAcceptFormProps = {
  token?: string | null;
};

function getApiErrorMessage(error: unknown) {
  if (!isAxiosError(error)) {
    return "Não foi possível concluir o aceite do convite agora.";
  }

  const message = error.response?.data?.message;

  if (Array.isArray(message)) {
    return message[0] ?? "Não foi possível concluir o aceite do convite agora.";
  }

  if (typeof message === "string") {
    return message;
  }

  return "Não foi possível concluir o aceite do convite agora.";
}

export function ArtistInviteAcceptForm({ token }: ArtistInviteAcceptFormProps) {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);
  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [password, setPassword] = useState("");
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

  async function acceptInvite() {
    if (isAccepting) return;

    if (!token) {
      setError("Token do convite não encontrado.");
      return;
    }

    if (!invite) {
      setError("Convite não encontrado.");
      return;
    }

    if (!invite.existingUser && !password.trim()) {
      setError("Informe uma senha.");
      return;
    }

    if (!invite.existingUser && password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    try {
      setIsAccepting(true);
      setError(null);

      await invitesService.acceptInvite(
        token,
        invite.existingUser ? {} : { password },
      );

      setAccepted(true);
    } catch (error) {
      console.error("Erro ao aceitar convite:", error);
      setError(getApiErrorMessage(error));
    } finally {
      setIsAccepting(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void acceptInvite();
  }

  return (
    <Card className="orbit-shell mx-auto w-full max-w-xl">
      <CardHeader>
        <div className="mb-3 flex size-12 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-glow">
          {accepted ? <CheckCircle2 /> : <Ticket />}
        </div>

        <CardTitle>
          {accepted
            ? "Convite aceito"
            : invite?.existingUser
              ? "Convite para organização"
              : "Criar conta e aceitar convite"}
        </CardTitle>

        <CardDescription>
          {accepted
            ? "Seu acesso foi confirmado. Entre para continuar."
            : invite?.existingUser
              ? "Sua conta já existe. Confirme se deseja entrar nesta organização."
              : "Defina uma senha para criar sua conta e entrar na organização."}
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
        ) : invite?.existingUser ? (
          <div className="space-y-4">
            <div className="space-y-2 text-sm">
              <p className="font-medium">
                Você já possui uma conta no RewindJ.
              </p>
              <p className="text-muted-foreground">
                Deseja entrar na organização {organizationName} como{" "}
                {invite.role}?
              </p>
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                size="lg"
                onClick={() => void acceptInvite()}
                disabled={isAccepting}>
                {isAccepting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <CheckCircle2 />
                )}
                {isAccepting ? "Aceitando..." : "Aceitar convite"}
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={() => router.push("/login")}
                disabled={isAccepting}>
                Recusar
              </Button>
            </div>
          </div>
        ) : (
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => {
                  setError(null);
                  setPassword(event.target.value);
                }}
                placeholder="Mínimo 6 caracteres"
                required
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
                required
                disabled={isAccepting}
              />
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
              {isAccepting
                ? "Criando conta..."
                : "Criar conta e aceitar convite"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
