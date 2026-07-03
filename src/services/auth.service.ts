import { api } from "@/libs/axios";
import type { AccountType, UserRole } from "@/types/user";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type LoginData = {
  email: string;
  password: string;
};

export type RegisterData = {
  name: string;
  email: string;
  phone: string;
  password: string;
  organizationName: string;
  organizationEmail: string;
  organizationDocument: string;
};

export type UpdateMeData = {
  name: string;
  phone: string | null;
};

export type AuthUser = {
  sub?: string;
  id?: string;
  email: string;
  name: string;
  phone?: string | null;
  role: UserRole;
  accountType: AccountType;
  artistId?: string | null;
  organizationId: string | null;
  organizationName: string | null;
};

export type LoginResponse = {
  access_token: string;
};

export async function loginService(data: LoginData) {
  const response = await api.post<LoginResponse>("/auth/login", data);
  return response.data;
}

export function googleLoginService() {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  window.location.href = new URL("/auth/google", API_URL).toString();
}

export async function registerService(data: RegisterData) {
  const response = await api.post("/auth/register", data);
  return response.data;
}

export async function updateMeService(data: UpdateMeData) {
  const response = await api.patch<AuthUser>("/auth/me", data);
  return response.data;
}

export async function profileService() {
  const response = await api.get<AuthUser>("/auth/me");
  return response.data;
}
