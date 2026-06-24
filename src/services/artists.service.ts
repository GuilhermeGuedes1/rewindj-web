import { api } from "@/libs/axios";
import { Artist } from "@/types/artist";
import type { Event } from "@/types/event";

export type CreateArtistPayload = {
  name: string;
  email: string;
  phone?: string;
  temporaryPassword?: string;
};

export async function listArtistsService() {
  const response = await api.get<Artist[]>("/artists");
  return response.data;
}

export async function createArtistService(data: CreateArtistPayload) {
  const response = await api.post<Artist>("/artists", data);
  return response.data;
}

export async function getMyArtistProfileService() {
  const response = await api.get<Artist>("/artists/me");
  return response.data;
}

export async function listMyArtistEventsService() {
  const response = await api.get<Event[]>("/artists/me/events");
  return response.data;
}

export async function getArtistByIdService(id: string) {
  const response = await api.get<Artist>(`/artists/${id}`);
  return response.data;
}
