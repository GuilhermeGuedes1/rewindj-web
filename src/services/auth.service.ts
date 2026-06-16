import { api } from "@/libs/axios";

export type LoginData = {
  email: string;
  password: string;
};

export type AuthUser = {
  sub: string;
  email: string;
  name: string;
  lastName?: string | null;
  role: "CEO" | "ADMIN" | "PRODUCER" | "ARTIST";
  organizationId: string;
};

export type LoginResponse = {
  access_token: string;
};

export async function loginService(data: LoginData) {
  const response = await api.post<LoginResponse>("/auth/login", data);
  return response.data;
}

export async function profileService() {
  const response = await api.get<AuthUser>("/auth/profile");
  return response.data;
}
