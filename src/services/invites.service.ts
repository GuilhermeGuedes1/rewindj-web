import { api } from "@/libs/axios";

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
    const { data } = await api.get<InviteDetails>(`/invites/${token}`);
    return data;
  },

  async acceptInvite(token: string): Promise<AcceptInviteResponse> {
    const { data } = await api.post<AcceptInviteResponse>(`/invites/accept/${token}`);
    return data;
  },
};
