import { api } from "@/libs/axios";

export interface InviteDetails {
  id?: string;
  token?: string;
  email: string;
  organizationName?: string;
  organization?: {
    id: string;
    name: string;
    email?: string | null;
  };
  role: string;
  invitedBy?: string;
  expiresAt?: string;
}

export interface AcceptInviteResponse {
  accepted: boolean;
  userId?: string;
}

export interface AcceptInvitePayload {
  name: string;
  stageName?: string;
  birthDate?: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  password: string;
}

export interface CreateInvitePayload {
  email: string;
  role: "ARTIST";
}

export interface CreateInviteResponse {
  message?: string;
  inviteLink?: string;
  inviteUrl?: string;
  url?: string;
  token?: string;
  invite?:
    | string
    | {
        token: string;
        inviteUrl?: string;
        url?: string;
      };
}

export async function createInviteService(data: CreateInvitePayload) {
  const response = await api.post<CreateInviteResponse>("/invites", data);
  return response.data;
}

export const invitesService = {
  async getInvite(token: string): Promise<InviteDetails> {
    const { data } = await api.get<InviteDetails>(`/invites/${token}`);
    return data;
  },

  async acceptInvite(
    token: string,
    payload: AcceptInvitePayload,
  ): Promise<AcceptInviteResponse> {
    const { data } = await api.post<AcceptInviteResponse>(
      `/invites/${encodeURIComponent(token)}/accept`,
      payload,
    );
    return data;
  },
};
