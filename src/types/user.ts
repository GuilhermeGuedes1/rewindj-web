export type UserRole = "ADMIN" | "AGENCY" | "DJ" | "CLIENT" | string;

export interface User {
  id: string;
  name: string;
  lastName: string;
  email: string;
  role: UserRole;
  organizationId: string | null;
}
