export interface GenerateEventDraftPayload {
  message: string;
}

export interface EventDraft {
  title: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  venueName: string;
  address: string;
  city: string;
  state: string;
  artistName: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  notes: string;
}
