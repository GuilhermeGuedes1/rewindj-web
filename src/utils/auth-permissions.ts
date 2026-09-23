import type { AuthUser } from "@/services/auth.service";
import type { User } from "@/types/user";

type PermissionUser = AuthUser | User | null | undefined;
function isOrganizationMember(user: PermissionUser) {
  return Boolean(user?.organizationId && !user.isIndependent);
}

function isAgencyManagerRole(user: PermissionUser) {
  return Boolean(
    user &&
    (user.role === "CEO" || user.role === "ADMIN" || user.role === "PRODUCER"),
  );
}

export function isAgencyManager(user: PermissionUser) {
  return Boolean(
    user && isOrganizationMember(user) && isAgencyManagerRole(user),
  );
}

export function isIndependentArtist(user: PermissionUser) {
  return Boolean(
    user?.role === "ARTIST" && user.isIndependent && !user.organizationId,
  );
}

export function isAgencyArtist(user: PermissionUser) {
  return Boolean(user?.role === "ARTIST" && isOrganizationMember(user));
}

export function canCreateEvent(user: PermissionUser) {
  return isAgencyManager(user) || isIndependentArtist(user);
}

export function canManageClients(user: PermissionUser) {
  return isAgencyManager(user) || isIndependentArtist(user);
}

export function canViewFinancial(user: PermissionUser) {
  return Boolean(
    user &&
    (isIndependentArtist(user) ||
      isAgencyArtist(user) ||
      isAgencyManager(user)),
  );
}

export function canManageArtists(user: PermissionUser) {
  return Boolean(
    user && isOrganizationMember(user) && isAgencyManagerRole(user),
  );
}

export function canInviteArtists(user: PermissionUser) {
  return isOrganizationMember(user) && user?.role === "CEO";
}
