import { api } from "@/libs/axios";
import { Artist } from "@/types/artist";

export async function listArtistsService() {
  const response = await api.get<Artist[]>("/artists");
  return response.data;
}
