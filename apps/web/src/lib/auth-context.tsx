"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiFetch } from "@/lib/api";
import type { AuthUser } from "@/lib/types";

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  setSession: (accessToken: string, user: AuthUser) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const setSession = useCallback((token: string, nextUser: AuthUser) => {
    setAccessToken(token);
    setUser(nextUser);
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const refreshed = await apiFetch<{ accessToken: string }>("/auth/refresh", {
        method: "POST",
      });
      setAccessToken(refreshed.accessToken);
      const me = await apiFetch<AuthUser>("/auth/me", {
        token: refreshed.accessToken,
      });
      setUser(me);
    } catch {
      setUser(null);
      setAccessToken(null);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await refreshSession();
      setLoading(false);
    })();
  }, [refreshSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await apiFetch<{
        accessToken: string;
        user: AuthUser;
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setSession(result.accessToken, result.user);
    },
    [setSession],
  );

  const logout = useCallback(async () => {
    if (accessToken) {
      try {
        await apiFetch("/auth/logout", {
          method: "POST",
          token: accessToken,
        });
      } catch {
        /* ignore */
      }
    }
    setUser(null);
    setAccessToken(null);
  }, [accessToken]);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      loading,
      login,
      logout,
      refreshSession,
      setSession,
    }),
    [user, accessToken, loading, login, logout, refreshSession, setSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
