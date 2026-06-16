"use client";

import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ArtistCard } from "@/components/orbit/artist-card";
import { PageHeader } from "@/components/orbit/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { listArtistsService } from "@/services/artists.service";
import { Artist } from "@/types/artist";

export default function ArtistsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");

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
        setIsLoading(false);
      }
    }

    loadArtists();
  }, [router, user?.role]);

  const filteredArtists = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return artists;
    }

    return artists.filter((artist) =>
      [
        artist.fullName,
        artist.stageName ?? "",
        artist.email,
        artist.phone ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [artists, query]);

  return (
    <div>
      <PageHeader
        eyebrow="Roster"
        title="Artistas"
        description="Acompanhe o elenco da agência com contatos, status e identidade visual de app musical."
        action={
          <Button asChild>
            <Link href="/artists/new">
              <Plus className="size-4" />
              Novo artista
            </Link>
          </Button>
        }
      />

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
