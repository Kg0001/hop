"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type AuthContextValue = {
  currentUserEmail: string | null;
  isLoggedIn: boolean;
  login: (email: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'hopon-current-email';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setCurrentUserEmail(stored);
    }
  }, []);

  const login = useCallback((email: string) => {
    setCurrentUserEmail(email);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, email);
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUserEmail(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const value = useMemo(
    () => ({ currentUserEmail, isLoggedIn: Boolean(currentUserEmail), login, logout }),
    [currentUserEmail, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
