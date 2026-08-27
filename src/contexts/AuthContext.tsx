"use client";

import { createContext, ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/libs/axios";
import {
  AuthUser,
  LoginData,
  RegisterData,
  loginService,
  profileService,
  registerService,
} from "@/services/auth.service";

type AuthContextData = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<AuthUser>;
  login: (data: LoginData) => Promise<void>;
  loginWithToken: (accessToken: string, isNewUser?: boolean) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext({} as AuthContextData);

type AuthProviderProps = {
  children: ReactNode;
};

const TOKEN_KEY = "@orbit:token";

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  async function refreshUser() {
    const profile = await profileService();

    setUser(profile);

    return profile;
  }

  async function persistSession(accessToken: string) {
    localStorage.setItem(TOKEN_KEY, accessToken);
    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

    try {
      const profile = await profileService();

      setToken(accessToken);
      setUser(profile);
    } catch (err) {
      localStorage.removeItem(TOKEN_KEY);
      delete api.defaults.headers.common.Authorization;

      setToken(null);
      setUser(null);

      throw err;
    }
  }

  async function login(data: LoginData) {
    const { access_token } = await loginService(data);

    await persistSession(access_token);

    router.push("/dashboard");
  }

  async function loginWithToken(accessToken: string, isNewUser = false) {
    await persistSession(accessToken);

    router.replace(isNewUser ? "/profile?complete=1" : "/dashboard");
  }

  async function register(data: RegisterData) {
    const { access_token, isNewUser } = await registerService(data);

    await persistSession(access_token);

    router.push(isNewUser ? "/profile?complete=1" : "/dashboard");
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    delete api.defaults.headers.common.Authorization;

    setUser(null);
    setToken(null);

    router.push("/login");
  }

  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem(TOKEN_KEY);

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        api.defaults.headers.common.Authorization = `Bearer ${storedToken}`;

        const profile = await profileService();

        setToken(storedToken);
        setUser(profile);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        delete api.defaults.headers.common.Authorization;

        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        refreshUser,
        login,
        loginWithToken,
        register,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
