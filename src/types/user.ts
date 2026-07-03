export type UserRole = "CEO" | "ADMIN" | "PRODUCER" | "ARTIST";
export type AccountType = "AGENCY" | "INDEPENDENT_ARTIST";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  accountType: AccountType;
  artistId?: string | null;
  organizationId: string | null;
  organizationName?: string | null;
}
