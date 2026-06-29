export type UserRole = "CEO" | "ADMIN" | "PRODUCER" | "ARTIST";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  artistId?: string | null;
  organizationId: string | null;
  organizationName?: string | null;
}
