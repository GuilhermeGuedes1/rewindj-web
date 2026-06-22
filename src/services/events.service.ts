import { api } from "@/libs/axios";
import type { CreateEventPayload, Event, EventDetails } from "@/types/event";

export async function createEventService(data: CreateEventPayload) {
  const response = await api.post<Event>("/events/create", data);
  return response.data;
}

export async function listEventsService() {
  const response = await api.get<Event[]>("/events");
  return response.data;
}

export async function getEventByIdService(id: string) {
  const response = await api.get<EventDetails>(`/events/${id}`);
  console.log(response.data);
  return response.data;
}

export async function updateEventService(id: string, data: CreateEventPayload) {
  const response = await api.patch<Event>(`/events/${id}`, data);

  return response.data;
}
