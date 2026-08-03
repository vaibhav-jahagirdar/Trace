"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

import { useQuery } from "@tanstack/react-query";

import { getSession, type Session } from "@/lib/auth/session";
import { queryKeys } from "@/lib/query/keys";

type AuthContextValue = {
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<unknown>;
};

const AuthContext = createContext<AuthContextValue | null>(
  null
);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: getSession,
    retry: false,
  });

  const value: AuthContextValue = {
    session: data ?? null,
    isAuthenticated: !!data,
    isLoading,
    isError,
    refetch,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider."
    );
  }

  return context;
}