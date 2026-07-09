import type { AuthUser } from "@/services/auth.service";
import type { User, UserRole } from "@/types/user";

type PermissionUser = AuthUser | User | null | undefined;
type NormalizedAccountType = "AGENCY" | "INDEPENDENT_ARTIST" | null;

const agencyManagerRoles: UserRole[] = ["CEO", "ADMIN", "PRODUCER"];

function getAccountType(user: PermissionUser): NormalizedAccountType {
  const normalized = String(user?.accountType ?? "")
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .toUpperCase();
  const compact = normalized.replace(/_/g, "");

  if (normalized === "INDEPENDENT_ARTIST" || compact === "INDEPENDENTARTIST") {
    return "INDEPENDENT_ARTIST";
  }

  if (normalized === "AGENCY") return "AGENCY";

  return null;
}

export function isAgencyManager(user: PermissionUser) {
  return Boolean(
    user &&
      getAccountType(user) !== "INDEPENDENT_ARTIST" &&
      agencyManagerRoles.includes(user.role),
  );
}

export function isIndependentArtist(user: PermissionUser) {
  return (
    user?.role === "ARTIST" && getAccountType(user) === "INDEPENDENT_ARTIST"
  );
}

export function isAgencyArtist(user: PermissionUser) {
  return user?.role === "ARTIST" && getAccountType(user) === "AGENCY";
}

export function canCreateEvent(user: PermissionUser) {
  return isAgencyManager(user) || isIndependentArtist(user);
}

export function canManageClients(user: PermissionUser) {
  return isAgencyManager(user) || isIndependentArtist(user);
}

export function canViewFinancial(user: PermissionUser) {
  return Boolean(user);
}

export function canManageArtists(user: PermissionUser) {
  return Boolean(
    user &&
      getAccountType(user) !== "INDEPENDENT_ARTIST" &&
      agencyManagerRoles.includes(user.role),
  );
}

export function canInviteArtists(user: PermissionUser) {
  return (
    getAccountType(user) !== "INDEPENDENT_ARTIST" &&
    (user?.role === "CEO" || user?.role === "ADMIN")
  );
}
