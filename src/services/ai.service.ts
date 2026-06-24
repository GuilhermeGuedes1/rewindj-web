import { api } from "@/libs/axios";
import type { EventDraft, GenerateEventDraftPayload } from "@/types/ai";

export const aiService = {
  async generateEventDraft(text: string): Promise<EventDraft> {
    const payload: GenerateEventDraftPayload = { text };
    const { data } = await api.post<EventDraft>("/ai/event-draft", payload);
    return data;
  },
};
