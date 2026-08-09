"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  type ReactNode,
} from "react";

import { useMe } from "@/features/auth/hooks/use-me";
import { OrgMembership } from "@/features/auth/api/me";
import { api } from "@/lib/api/client";


type AuthContextValue = {
  user: {
    id: string;
    username: string;
    email: string;
    status: string;
    created_at: string;
    updated_at: string;
  } | null;
  organizations: OrgMembership[];
  activeOrg: OrgMembership | null;
  setActiveOrg: (org: OrgMembership) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<unknown>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const { data, isLoading, isError, error, refetch } = useMe();

  // Client state: which org is currently active
  const [activeOrg, setActiveOrg] = useState<OrgMembership | null>(null);

  const user = data?.data ?? null;
  const organizations = user?.organizations ?? [];

  // Auto‑select the first organisation if none is chosen
  useEffect(() => {
    if (!activeOrg && organizations.length > 0) {
      setActiveOrg(organizations[0]);
    }
  }, [activeOrg, organizations]);

  // Optionally bind logout behaviour (redirect on refresh failure)
  // api.setRefreshFailureHandler(() => {
  //   window.location.href = "/login";
  // });

  const value = useMemo<AuthContextValue>(
    () => ({
      user: user
        ? {
            id: user.id,
            username: user.username,
            email: user.email,
            status: user.status,
            created_at: user.created_at,
            updated_at: user.updated_at,
          }
        : null,
      organizations,
      activeOrg,
      setActiveOrg,
      isAuthenticated: !!user,
      isLoading,
      isError,
      error: error instanceof Error ? error : error ? new Error("Unknown error") : null,
      refetch,
    }),
    [user, organizations, activeOrg, isLoading, isError, error, refetch],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}