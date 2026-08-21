export type UserRole = "CEO" | "ADMIN" | "PRODUCER" | "ARTIST";

export interface User {
  sub?: string;
  email: string;
  artistId?: string | null;
  name: string;
  role: UserRole;
  organizationId: string | null;
  isIndependent: boolean;
}
