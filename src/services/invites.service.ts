import { api, isApiConfigured } from "@/services/api";
import { mockUser } from "@/services/mock-data";

export interface InviteDetails {
  token: string;
  email: string;
  organizationName: string;
  role: string;
  invitedBy: string;
}

export interface AcceptInviteResponse {
  accepted: boolean;
  userId?: string;
}

export const invitesService = {
  async getInvite(token: string): Promise<InviteDetails> {
    if (!isApiConfigured) {
      return {
        token,
        email: "guest@orbit.local",
        organizationName: "Orbit Collective",
        role: "DJ",
        invitedBy: `${mockUser.name} ${mockUser.lastName}`,
      };
    }

    const { data } = await api.get<InviteDetails>(`/invites/${token}`);
    return data;
  },

  async acceptInvite(token: string): Promise<AcceptInviteResponse> {
    if (!isApiConfigured) {
      return {
        accepted: true,
        userId: mockUser.id,
      };
    }

    const { data } = await api.post<AcceptInviteResponse>(`/invites/accept/${token}`);
    return data;
  },
};
