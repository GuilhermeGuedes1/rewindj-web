"use client";

import Link from "next/link";
import { Music, Mail, Phone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Artist } from "@/types/artist";

interface ArtistCardProps {
  artist: Artist;
}

function fallback(value?: string | null) {
  return value && value.trim() ? value : "Não informado";
}

export function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <Link
      href={`/artists/${artist.id}`}
      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <Card className="orbit-shell overflow-hidden transition-colors hover:border-primary/40">
        <CardContent className="p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold tracking-normal">
                {artist.stageName || artist.name}
              </h2>

              <Badge variant="silver" className="w-fit">
                {artist.name}
              </Badge>
            </div>

            <Music className="size-5 text-primary" />
          </div>

          <div className="grid gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-primary" />
              {fallback(artist.email)}
            </div>

            <div className="flex items-center gap-2">
              <Phone className="size-4 text-primary" />
              {fallback(artist.phone)}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
