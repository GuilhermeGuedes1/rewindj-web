"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { eventsService } from "@/services/events.service";
import type { CreateEventPayload, Event } from "@/types/event";

export const eventsQueryKey = ["events"] as const;

export function useEvents() {
  return useQuery({
    queryKey: eventsQueryKey,
    queryFn: eventsService.getEvents,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEventPayload) => eventsService.createEvent(payload),
    onSuccess: (event) => {
      queryClient.setQueryData<Event[]>(eventsQueryKey, (currentEvents = []) => [
        event,
        ...currentEvents,
      ]);
    },
  });
}
