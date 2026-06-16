export interface Client {
  id: string;
  name: string;
  companyName?: string | null;
  phone: string;
  email?: string | null;
  createdAt: string;
}
