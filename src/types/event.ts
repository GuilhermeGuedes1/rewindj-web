export interface Event {
  id: string;
  title: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  venueName: string;
  address: string;
  city: string;
  state: string;
  fee?: number | null;
  notes?: string | null;

  client: {
    id: string;
    name: string;
    phone: string;
    email?: string | null;
  };

  artist: {
    id: string;
    name: string;
    lastName?: string | null;
    email: string;
    role: string;
  };
}

export interface CreateEventPayload {
  title: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  venueName: string;
  address: string;
  city: string;
  state: string;
  notes?: string;
  artistId?: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
}
