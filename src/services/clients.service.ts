import { api } from "@/libs/axios";
import type { ClientDetails, ClientsResponse } from "@/types/client";

export async function getClientsService(page = 1) {
  const response = await api.get<ClientsResponse>(`/clients?page=${page}`);
  return response.data;
}

export async function getClientByIdService(id: string) {
  const response = await api.get<ClientDetails>(`/clients/${id}`);
  return response.data;
}
