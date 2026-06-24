export type Artist = {
  id: string;
  name: string;
  stageName: string;
  email?: string | null;
  phone?: string | null;
  birthDate?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pixKey?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type UpdateArtistPayload = {
  name: string;
  stageName: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pixKey?: string | null;
};

export type CreateArtistPayload = {
  name: string;
  email: string;
  phone?: string;
  temporaryPassword?: string;
};
