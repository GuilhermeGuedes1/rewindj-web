export interface Event {
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
  paymentDate?: string | null;
  paymentMethod?: string | null;
  hasContract?: boolean | null;
  notes?: string | null;

  artist: {
    id: string;
    fullName: string;
    stageName?: string | null;
    email: string;
    phone?: string | null;
  };

  client: {
    id: string;
    name: string;
    companyName?: string | null;
    phone?: string | null;
    email?: string | null;
  };

  createdAt: string;
  updatedAt: string;
}

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
