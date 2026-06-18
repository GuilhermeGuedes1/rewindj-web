import { api } from "@/libs/axios";
import type { Client, ClientDetails } from "@/types/client";

export async function getClientsService() {
  const response = await api.get<Client[]>("/clients");
  return response.data;
}

export async function getClientByIdService(id: string) {
  const response = await api.get<ClientDetails>(`/clients/${id}`);
  return response.data;
}
