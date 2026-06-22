export interface GenerateEventDraftPayload {
  text: string;
}

export interface EventDraft {
  title: string | null;
  eventDate: string | null;
  startTime: string | null;
  endTime: string | null;
  setDuration: string | null;
  venueName: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  status: "NEGOTIATING" | "CONFIRMED" | "LOST" | null;
  fee: number | null;
  paymentDate: string | null;
  paymentMethod: string | null;
  hasContract: boolean | null;
  notes: string | null;
  artistName: string | null;
  clientName: string | null;
  clientPhone: string | null;
  clientEmail: string | null;
  clientCompanyName: string | null;
}
