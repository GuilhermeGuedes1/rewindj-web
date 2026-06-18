import { Building2, Mail, Phone, UserRound } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Client } from "@/types/client";

interface ClientCardProps {
  client: Client;
}

function fallback(value?: string | null) {
  return value && value.trim() ? value : "Não informado";
}

export function ClientCard({ client }: ClientCardProps) {
  return (
    <Card className="orbit-shell overflow-hidden">
      <CardContent className="p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-glow">
              <UserRound className="size-6" />
            </div>

            <div className="min-w-0 space-y-2">
              <h2 className="truncate text-xl font-semibold tracking-normal">
                {fallback(client.name)}
              </h2>

              <Badge variant="silver" className="w-fit">
                {fallback(client.companyName)}
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Building2 className="size-4 text-primary" />
            <span className="truncate">{fallback(client.companyName)}</span>
          </div>

          <div className="flex items-center gap-2">
            <Phone className="size-4 text-primary" />
            <span>{fallback(client.phone)}</span>
          </div>

          <div className="flex items-center gap-2">
            <Mail className="size-4 text-primary" />
            <span className="truncate">{fallback(client.email)}</span>
          </div>
        </div>

        <Button className="mt-5 w-full" variant="outline" asChild>
          <Link href={`/clients/${client.id}`}>Ver detalhes</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
