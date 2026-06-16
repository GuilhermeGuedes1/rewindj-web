"use client";

import { createContext, ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/libs/axios";
import {
  AuthUser,
  LoginData,
  loginService,
  profileService,
} from "@/services/auth.service";

type AuthContextData = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
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

  async function login(data: LoginData) {
    const { access_token } = await loginService(data);

    localStorage.setItem(TOKEN_KEY, access_token);
    api.defaults.headers.common.Authorization = `Bearer ${access_token}`;

    setToken(access_token);

    const profile = await profileService();
    setUser(profile);

    router.push("/dashboard");
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
        login,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
