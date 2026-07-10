"use client";

import { Copy, Loader2, MailPlus, Search, Share2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { ArtistCard } from "@/components/orbit/artist-card";
import { PageHeader } from "@/components/orbit/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { listArtistsService } from "@/services/artists.service";
import { createInviteService } from "@/services/invites.service";
import { Artist } from "@/types/artist";
import { canInviteArtists, canManageArtists } from "@/utils/auth-permissions";

export default function ArtistsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);
  const [copiedInviteLink, setCopiedInviteLink] = useState(false);
  const canInviteArtist = canInviteArtists(user);

  useEffect(() => {
    if (!user) return;

    if (!canManageArtists(user)) {
      router.replace("/events");
      return;
    }

    async function loadArtists() {
      try {
        const data = await listArtistsService();
        setArtists(data);
      } catch (error) {
        console.error("Erro ao buscar artistas:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadArtists();
  }, [router, user]);

  const filteredArtists = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return artists;
    }

    return artists.filter((artist) =>
      [artist.name, artist.stageName ?? "", artist.email, artist.phone ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [artists, query]);

  async function handleCreateInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!inviteEmail.trim()) {
      setInviteError("Informe o email do artista.");
      return;
    }

    try {
      setIsCreatingInvite(true);
      setInviteError(null);
      setInviteLink(null);
      setInviteMessage(null);
      setCopiedInviteLink(false);

      const data = await createInviteService({
        email: inviteEmail.trim(),
        role: "ARTIST",
      });

      const inviteObject =
        data.invite && typeof data.invite === "object" ? data.invite : null;
      const token = data.token ?? inviteObject?.token;
      const generatedLink =
        data.inviteLink ??
        data.inviteUrl ??
        data.url ??
        (typeof data.invite === "string" ? data.invite : null) ??
        inviteObject?.inviteUrl ??
        inviteObject?.url ??
        (token && typeof window !== "undefined"
          ? `${window.location.origin}/invite/${token}`
          : null);

      if (!generatedLink) {
        setInviteError("Convite criado, mas o link não foi retornado.");
        return;
      }

      setInviteLink(generatedLink);
      setInviteMessage(data.message ?? "Convite criado com sucesso.");
      setInviteEmail("");
    } catch (error) {
      console.error("Erro ao criar convite:", error);
      setInviteError("Não foi possível gerar o convite agora.");
    } finally {
      setIsCreatingInvite(false);
    }
  }

  async function handleCopyInviteLink() {
    if (!inviteLink) return;

    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopiedInviteLink(true);
    } catch (error) {
      console.error("Erro ao copiar convite:", error);
      setInviteError("Não foi possível copiar o link automaticamente.");
    }
  }

  async function handleShareInviteLink() {
    if (!inviteLink) return;

    const text = `Você recebeu um convite para entrar no RewindJ: ${inviteLink}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Convite RewindJ",
          text,
          url: inviteLink,
        });

        return;
      }

      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, "_blank");
    } catch (error) {
      console.error("Erro ao compartilhar convite:", error);
      setInviteError("Não foi possível compartilhar o link.");
    }
  }

  return (
    <div>
      <PageHeader
        title="Artistas"
        description="Acompanhe o elenco da agência com contatos, status e identidade visual de app musical."
      />

      {canInviteArtist ? (
        <Card className="orbit-shell mb-5 overflow-hidden">
          <CardContent className="p-5 sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold tracking-normal">
                  Convidar artista
                </h2>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                  Gere um link de acesso e compartilhe.
                </p>
              </div>
            </div>

            <form className="grid gap-4" onSubmit={handleCreateInvite}>
              <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                <div className="space-y-2">
                  <Label htmlFor="inviteEmail">Email do artista</Label>
                  <Input
                    id="inviteEmail"
                    type="email"
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                    placeholder="artista@rewindj.local"
                  />
                </div>

                <Button type="submit" disabled={isCreatingInvite}>
                  {isCreatingInvite ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <MailPlus />
                  )}
                  Convidar artista
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">ARTIST</Badge>
                <span className="text-sm text-muted-foreground">
                  Papel fixo do convite
                </span>
              </div>

              {inviteError ? (
                <p className="text-sm text-destructive">{inviteError}</p>
              ) : null}

              {inviteLink ? (
                <div className="rounded-md border border-border bg-muted/40 p-4">
                  {inviteMessage ? (
                    <div className="mb-3 text-sm text-primary">
                      {inviteMessage}
                    </div>
                  ) : null}
                  <div className="mb-3 text-sm font-medium">
                    Link do convite
                  </div>
                  <Link
                    href={inviteLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mb-4 block break-all text-sm font-medium text-primary hover:underline">
                    {inviteLink}
                  </Link>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCopyInviteLink}>
                      <Copy />
                      {copiedInviteLink ? "Link copiado" : "Copiar link"}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleShareInviteLink}>
                      <Share2 />
                      Compartilhar
                    </Button>
                  </div>
                </div>
              ) : null}
            </form>
          </CardContent>
        </Card>
      ) : null}

      <div className="mb-5 flex items-center gap-3 rounded-lg border border-border bg-card/70 px-4 py-3">
        <Search className="size-4 shrink-0 text-muted-foreground" />

        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nome, email ou telefone"
          className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
        />
      </div>

      {isLoading ? (
        <div className="orbit-shell rounded-lg p-6 text-muted-foreground">
          Carregando artistas...
        </div>
      ) : filteredArtists.length === 0 ? (
        <div className="orbit-shell rounded-lg p-6 text-muted-foreground">
          Nenhum artista encontrado.
        </div>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredArtists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </section>
      )}
    </div>
  );
}
