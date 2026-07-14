"use client";

import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ClientCard } from "@/components/orbit/client-card";
import { PageHeader } from "@/components/orbit/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useClients } from "@/hooks/use-clients";
import { useAuth } from "@/hooks/useAuth";
import { canManageClients } from "@/utils/auth-permissions";

export default function ClientsPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const canAccessClients = canManageClients(user);
  const {
    data: response,
    isLoading: isClientsLoading,
    error,
  } = useClients(page, !isAuthLoading && canAccessClients);
  const isLoading = isAuthLoading || !canAccessClients || isClientsLoading;

  useEffect(() => {
    if (!user) return;

    if (!canManageClients(user)) {
      router.replace("/events");
      return;
    }
  }, [router, user]);

  useEffect(() => {
    if (error) {
      console.error("Erro ao buscar clientes:", error);
    }
  }, [error]);

  const filteredClients = useMemo(() => {
    const clients = response?.data ?? [];
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return clients;
    }

    return clients.filter((client) =>
      [client.name, client.companyName ?? "", client.phone, client.email ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query, response]);

  return (
    <div>
      <PageHeader
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
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
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
          Não foi possível carregar os clientes agora.
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

      {!isLoading && response ? (
        <div className="mt-5 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => setPage((page) => page - 1)}
            disabled={page === 1}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page} de {response.meta.pageTotal}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((page) => page + 1)}
            disabled={page === response.meta.pageTotal}
          >
            Próxima
          </Button>
        </div>
      ) : null}
    </div>
  );
}
