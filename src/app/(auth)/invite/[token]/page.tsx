"use client";

import { CheckCircle2, Loader2, Ticket } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { invitesService, type InviteDetails } from "@/services/invites.service";

export default function InvitePage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token = useMemo(() => params.token, [params.token]);
  const [accepted, setAccepted] = useState(false);
  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [isLoadingInvite, setIsLoadingInvite] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    async function loadInvite() {
      if (!token) return;

      try {
        const data = await invitesService.getInvite(token);
        setInvite(data);
      } catch (error) {
        console.error("Erro ao buscar convite:", error);
      } finally {
        setIsLoadingInvite(false);
      }
    }

    loadInvite();
  }, [token]);

  async function handleAcceptInvite() {
    try {
      setIsAccepting(true);
      await invitesService.acceptInvite(token);
      setAccepted(true);
    } catch (error) {
      console.error("Erro ao aceitar convite:", error);
    } finally {
      setIsAccepting(false);
    }
  }

  return (
    <Card className="orbit-shell mx-auto w-full max-w-md">
      <CardHeader>
        <div className="mb-3 flex size-12 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-glow">
          {accepted ? <CheckCircle2 /> : <Ticket />}
        </div>
        <CardTitle>{accepted ? "Convite aceito" : "Convite Orbit"}</CardTitle>
        <CardDescription>
          {accepted
            ? "Seu acesso foi confirmado. Entre para continuar."
            : "Revise os detalhes e aceite para entrar na organizacao."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {isLoadingInvite ? (
          <p className="text-sm text-muted-foreground">Carregando convite...</p>
        ) : invite ? (
          <div className="space-y-3 rounded-lg border border-border bg-muted/35 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Organizacao</span>
              <Badge variant="silver">{invite.organizationName}</Badge>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="truncate text-sm">{invite.email}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Papel</span>
              <span className="text-sm">{invite.role}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Enviado por</span>
              <span className="text-sm">{invite.invitedBy}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-destructive">Convite nao encontrado.</p>
        )}

        {accepted ? (
          <Button className="w-full" size="lg" onClick={() => router.push("/login")}>
            Entrar
          </Button>
        ) : (
          <Button
            className="w-full"
            size="lg"
            disabled={isLoadingInvite || isAccepting}
            onClick={handleAcceptInvite}
          >
            {isAccepting ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
            Aceitar convite
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
