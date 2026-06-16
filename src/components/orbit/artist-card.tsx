import { Mail, Phone, Radio } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Artist } from "@/types/artist";

interface ArtistCardProps {
  artist: Artist;
}

export function ArtistCard({ artist }: ArtistCardProps) {
  const displayName = artist.stageName || artist.fullName;
  const initials = artist.fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.slice(0, 1))
    .join("");

  return (
    <Card className="orbit-shell overflow-hidden">
      <CardContent className="p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-md bg-primary text-xl font-black text-primary-foreground shadow-glow">
              {initials}
            </div>
            <div className="min-w-0 space-y-2">
              <h2 className="truncate text-xl font-semibold tracking-normal">
                {displayName}
              </h2>
              <Badge variant="silver" className="w-fit">
                {artist.stageName ? artist.fullName : "ARTIST"}
              </Badge>
            </div>
          </div>
          <span className="flex items-center gap-1 rounded-md border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            <Radio className="size-3" />
            Ativo
          </span>
        </div>

        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Mail className="size-4 text-primary" />
            <span className="truncate">{artist.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="size-4 text-primary" />
            {artist.phone ? <span>{artist.phone}</span> : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
