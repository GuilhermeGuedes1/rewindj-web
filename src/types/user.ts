export type UserRole = "CEO" | "ADMIN" | "PRODUCER" | "ARTIST";

export interface User {
  id: string;
  name: string;
  lastName?: string | null;
  email: string;
  role: UserRole;
  organizationId: string | null;
}
