import { api } from "@/libs/axios";
import { Artist } from "@/types/artist";
import type { Event } from "@/types/event";
import { UpdateArtistPayload, UpdateMyArtistPayload } from "@/types/artist";
import { CreateArtistPayload } from "@/types/artist";

export type RegisterArtistPayload = {
  name: string;
  stageName: string;
  email: string;
  password: string;
  phone: string;
  birthDate?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pixKey?: string | null;
};

export async function listArtistsService() {
  const response = await api.get<Artist[]>("/artists");
  return response.data;
}

export async function registerArtistService(data: RegisterArtistPayload) {
  const response = await api.post("/artists/register", data);
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

export async function updateMyArtistProfileService(
  payload: UpdateMyArtistPayload,
) {
  const response = await api.patch<Artist>("/artists/me", payload);
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

export async function updateArtistService(
  id: string,
  payload: UpdateArtistPayload,
) {
  const response = await api.patch<Artist>(`/artists/${id}`, payload);
  return response.data;
}
