import { api } from "@/libs/axios";
import type {
  CreateEventPayload,
  Event,
  EventDetails,
  EventsResponse,
} from "@/types/event";

export async function createEventService(data: CreateEventPayload) {
  const response = await api.post<Event>("/events/create", data);
  return response.data;
}

export async function listEventsService(page = 1) {
  const response = await api.get<EventsResponse>(`/events?page=${page}`);
  return response.data;
}

export async function getEventByIdService(id: string) {
  const response = await api.get<EventDetails>(`/events/${id}`);

  return response.data;
}

export async function updateEventService(id: string, data: CreateEventPayload) {
  const response = await api.patch<Event>(`/events/${id}`, data);

  return response.data;
}
