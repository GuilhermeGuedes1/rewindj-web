export interface EventArtist {
  id: string;
  name: string;
  stageName?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface EventClient {
  id: string;
  name: string;
  companyName?: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface EventDetails {
  id: string;
  title: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  setDuration?: string | null;
  venueName: string;
  address: string;
  city: string;
  state: string;
  status?: string | null;
  paymentDate?: string | null;
  paymentMethod?: string | null;
  hasContract?: boolean | null;
  notes?: string | null;
  artist?: EventArtist | null;
  client?: EventClient | null;
  createdAt?: string;
  updatedAt?: string;
}

export type Event = EventDetails;

export interface CreateEventPayload {
  title: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  setDuration?: string | null;
  venueName: string;
  address: string;
  city: string;
  state: string;
  status: "NEGOTIATING" | "CONFIRMED" | "LOST" | null;
  paymentDate?: string | null;
  paymentMethod?: string | null;
  hasContract?: boolean;
  notes?: string | null;
  artistId: string;
  clientName: string;
  clientPhone?: string | null;
  clientEmail?: string | null;
  clientCompanyName?: string | null;
}
