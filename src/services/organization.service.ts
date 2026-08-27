import { api } from "@/libs/axios";

export async function createOrganizationService(data: {
  name: string;
  document: string;
  email: string;
}) {
  const response = await api.post("/organization", data);

  return response.data;
}