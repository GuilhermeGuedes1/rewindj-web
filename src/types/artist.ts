export interface Artist {
  id: string;
  fullName: string;
  stageName?: string | null;
  birthDate?: string | null;
  phone?: string | null;
  email: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pixKey?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
