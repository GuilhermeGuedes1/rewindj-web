"use client";

import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ClientCard } from "@/components/orbit/client-card";
import { PageHeader } from "@/components/orbit/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { getClientsService } from "@/services/clients.service";
import type { Client } from "@/types/client";
import { canManageClients } from "@/utils/auth-permissions";

export default function ClientsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!user) return;

    if (!canManageClients(user)) {
      router.replace("/events");
      return;
    }

    async function loadClients() {
      try {
        setError(null);
        const data = await getClientsService();
        setClients(data);
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
        setError("Não foi possível carregar os clientes agora.");
      } finally {
        setIsLoading(false);
      }
    }

    loadClients();
  }, [router, user]);

  const filteredClients = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return clients;
    }

    return clients.filter((client) =>
      [
        client.name,
        client.companyName ?? "",
        client.phone,
        client.email ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [clients, query]);

  return (
    <div>
      <PageHeader
        eyebrow="Clientes"
        title="Clientes"
        description="Gerencie os clientes da sua agência e acompanhe seus contatos."
        action={
          <Button disabled>
            <Plus className="size-4" />
            Novo Cliente
          </Button>
        }
      />

      <div className="mb-5 flex items-center gap-3 rounded-lg border border-border bg-card/70 px-4 py-3">
        <Search className="size-4 shrink-0 text-muted-foreground" />

        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por cliente, empresa, telefone ou email"
          className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
        />
      </div>

      {isLoading ? (
        <div className="orbit-shell rounded-lg p-6 text-muted-foreground">
          Carregando clientes...
        </div>
      ) : error ? (
        <div className="orbit-shell rounded-lg p-6 text-muted-foreground">
          {error}
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="orbit-shell rounded-lg p-6 text-muted-foreground">
          Nenhum cliente encontrado.
        </div>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredClients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </section>
      )}
    </div>
  );
}
