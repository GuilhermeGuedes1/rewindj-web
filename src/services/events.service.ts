import { api } from "@/libs/axios";
import type { Event, CreateEventPayload } from "@/types/event";

export async function createEventService(data: CreateEventPayload) {
  const response = await api.post<Event>("/events/create", data);
  return response.data;
}

export async function listEventsService() {
  const response = await api.get<Event[]>("/events");
  console.log(response.data);
  return response.data;
}
