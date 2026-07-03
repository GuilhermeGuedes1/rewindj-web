"use client";

import {
  ArrowLeft,
  CalendarDays,
  Mail,
  MapPin,
  Music,
  Phone,
  Sparkles,
  User,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/orbit/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { getArtistByIdService } from "@/services/artists.service";
import type { Artist } from "@/types/artist";
import { canManageArtists } from "@/utils/auth-permissions";
import { formatEventDate } from "@/utils/formatEventDate";

function fallback(value?: string | null) {
  return value && value.trim() ? value : "Não informado";
}

function getArtistDisplayName(artist: Artist) {
  if (artist.stageName && artist.stageName !== "string") {
    return artist.stageName;
  }

  return artist.name;
}

export default function ArtistDetailsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useParams<{ id: string }>();

  const [artist, setArtist] = useState<Artist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    if (!canManageArtists(user)) {
      router.replace("/events");
      return;
    }

    async function loadArtist() {
      if (!params.id) return;

      try {
        setIsLoading(true);
        setError(null);

        const data = await getArtistByIdService(params.id);
        setArtist(data);
      } catch (error) {
        console.error("Erro ao buscar artista:", error);
        setError("Não foi possível carregar os detalhes deste artista.");
      } finally {
        setIsLoading(false);
      }
    }

    loadArtist();
  }, [params.id, router, user]);

  return (
    <div>
      <PageHeader
        eyebrow="Detalhes do artista"
        title={artist ? getArtistDisplayName(artist) : "Artista"}
        description="Informações completas do artista dentro da organização."
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/artists">
                <ArrowLeft />
                Voltar
              </Link>
            </Button>

            <Button asChild>
              <Link href={`/artists/${params.id}/edit`}>Editar artista</Link>
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="orbit-shell rounded-lg p-6 text-muted-foreground">
          Carregando artista...
        </div>
      ) : error ? (
        <div className="orbit-shell rounded-lg p-6 text-muted-foreground">
          {error}
        </div>
      ) : artist ? (
        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="orbit-shell overflow-hidden">
            <CardContent className="p-5 sm:p-6">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold tracking-normal">
                    {getArtistDisplayName(artist)}
                  </h2>

                  <Badge variant="silver" className="w-fit">
                    {fallback(artist.name)}
                  </Badge>
                </div>

                <Badge>ARTIST</Badge>
              </div>

              <div className="grid gap-4 text-sm text-muted-foreground sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <User className="size-4 text-primary" />
                  Nome: {fallback(artist.name)}
                </div>

                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  Nome artístico: {fallback(artist.stageName)}
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="size-4 text-primary" />
                  {fallback(artist.email)}
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="size-4 text-primary" />
                  {fallback(artist.phone)}
                </div>

                <div className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-primary" />
                  Nascimento:{" "}
                  {artist.birthDate
                    ? formatEventDate(artist.birthDate, {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "Não informado"}
                </div>

                <div className="flex items-center gap-2">
                  <Wallet className="size-4 text-primary" />
                  Pix: {fallback(artist.pixKey)}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <Card className="orbit-shell overflow-hidden">
              <CardContent className="p-5">
                <div className="mb-4 flex items-center gap-2">
                  <MapPin className="size-4 text-primary" />
                  <h2 className="text-xl font-semibold tracking-normal">
                    Localização
                  </h2>
                </div>

                <div className="grid gap-3 text-sm text-muted-foreground">
                  <p>{fallback(artist.address)}</p>
                  <p>
                    {fallback(artist.city)}, {fallback(artist.state)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="orbit-shell overflow-hidden">
              <CardContent className="p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Music className="size-4 text-primary" />
                  <h2 className="text-xl font-semibold tracking-normal">
                    Operação
                  </h2>
                </div>

                <div className="grid gap-3 text-sm text-muted-foreground">
                  <p>
                    Este artista está vinculado à organização e pode ser
                    selecionado na criação e edição de eventos.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="orbit-shell rounded-lg p-6 text-muted-foreground">
          Artista não encontrado.
        </div>
      )}
    </div>
  );
}
