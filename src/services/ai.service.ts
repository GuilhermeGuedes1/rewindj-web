import { api, isApiConfigured } from "@/services/api";
import type { EventDraft, GenerateEventDraftPayload } from "@/types/ai";

const mockDraft: EventDraft = {
  title: "Casamento da Mariana",
  eventDate: "2026-07-20",
  startTime: "18:00",
  endTime: "23:00",
  venueName: "Copacabana Palace",
  address: "Av. Atlantica, 1702",
  city: "Rio de Janeiro",
  state: "RJ",
  artistName: "DJ Gabriel",
  clientName: "Mariana Silva",
  clientPhone: "21999999999",
  clientEmail: "",
  notes:
    "Brief gerado a partir da mensagem recebida no WhatsApp. Revisar endereco, contato e detalhes finais antes de salvar.",
};

export const aiService = {
  async generateEventDraft(message: string): Promise<EventDraft> {
    const payload: GenerateEventDraftPayload = { message };

    if (!isApiConfigured) {
      return {
        ...mockDraft,
        notes: `${mockDraft.notes}\n\nMensagem original: ${message}`,
      };
    }

    const { data } = await api.post<EventDraft>("/ai/generateEventDraft", payload);
    return data;
  },
};
