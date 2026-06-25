import { api } from "@/libs/axios";
import type { EventDraft, GenerateEventDraftPayload } from "@/types/ai";

export const aiService = {
  async generateEventDraft(
    text: string,
    mode: "create" | "edit" = "create",
  ): Promise<EventDraft> {
    const payload: GenerateEventDraftPayload = { text, mode };

    const { data } = await api.post<EventDraft>("/ai/event-draft", payload);

    return data;
  },
};
