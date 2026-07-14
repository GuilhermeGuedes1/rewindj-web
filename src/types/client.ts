export interface Client {
  id: string;
  name: string;
  companyName?: string | null;
  phone: string;
  email?: string | null;
  createdAt: string;
}

export interface ClientsResponseMeta {
  page: number;
  limit: number;
  total?: number;
  count?: number;
  pageTotal: number;
}

export interface ClientsResponse {
  meta: ClientsResponseMeta;
  data: Client[];
}

export interface ClientEvent {
  id: string;
  title: string;
  eventDate: string;
  venueName: string;
  city: string;
  state: string;
  artistName: string;
}

export interface ClientDetails {
  id: string;
  name: string;
  companyName?: string | null;
  phone?: string | null;
  email?: string | null;
  createdAt: string;
  events: ClientEvent[];
}
