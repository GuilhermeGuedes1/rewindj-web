export type UserRole = "CEO" | "ADMIN" | "PRODUCER" | "ARTIST";

export interface User {
  sub?: string;
  email: string;
  artistId?: string | null;
  name: string;
  role: UserRole;
  organizationId: string | null;
  organizationName?: string | null;
  organization?: {
    name: string;
  } | null;
  isIndependent: boolean;
}
