import { api } from "@/libs/axios";
import type { Event } from "@/types/event";

export type EventDraft = {
  title: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  venueName: string;
  address: string;
  city: string;
  state: string;
  artistName: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  notes: string;
};

export type CreateEventPayload = {
  title: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  venueName: string;
  address: string;
  city: string;
  state: string;
  notes?: string;
  artistId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
};

export async function generateEventDraftService(text: string) {
  const response = await api.post<EventDraft>("/ai/event-draft", { text });
  return response.data;
}

export async function createEventService(data: CreateEventPayload) {
  const response = await api.post("/events/create", data);
  return response.data;
}

export async function listEventsService() {
  const response = await api.get<Event[]>("/events");
  return response.data;
}
