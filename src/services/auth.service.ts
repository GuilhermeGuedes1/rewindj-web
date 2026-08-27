import { api } from "@/libs/axios";
import type { UserRole } from "@/types/user";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type LoginData = {
  email: string;
  password: string;
};

export type RegisterData = {
  email: string;
  password: string;
};

export type AuthUser = {
  sub?: string;
  email: string;
  name: string;
  role: UserRole;
  artistId?: string | null;
  organizationId: string | null;
  organizationName?: string | null;
  organization?: {
    name: string;
  } | null;
  isIndependent: boolean;
};

export type LoginResponse = {
  access_token: string;
};

export type RegisterResponse = {
  access_token: string;
  isNewUser: boolean;
  user: AuthUser;
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
  const response = await api.post<RegisterResponse>("/auth/register", data);
  return response.data;
}

export async function profileService() {
  const response = await api.get<AuthUser>("/auth/me");
  return response.data;
}
