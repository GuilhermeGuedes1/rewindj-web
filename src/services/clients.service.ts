import { api } from "@/libs/axios";
import type { Client } from "@/types/client";

export async function getClientsService() {
  const response = await api.get<Client[]>("/clients");
  return response.data;
}
