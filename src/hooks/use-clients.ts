import { useQuery } from "@tanstack/react-query";

import { getClientsService } from "@/services/clients.service";

export function useClients(page: number, enabled = true) {
  return useQuery({
    queryKey: ["clients", page],
    queryFn: () => getClientsService(page),
    enabled,
  });
}
