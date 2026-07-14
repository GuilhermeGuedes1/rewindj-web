import { useQuery } from "@tanstack/react-query";

import {
  createEventService,
  listEventsService,
} from "@/services/events.service";

export function useEvents(page: number, enabled = true) {
  return useQuery({
    queryKey: ["events", page],
    queryFn: () => listEventsService(page),
    enabled,
  });
}

export function useCreateEvent() {
  return { createEvent: createEventService };
}
