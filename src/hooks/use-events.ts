import {
  createEventService,
  listEventsService,
} from "@/services/events.service";

export function useEvents() {
  return { loadEvents: listEventsService };
}

export function useCreateEvent() {
  return { createEvent: createEventService };
}
