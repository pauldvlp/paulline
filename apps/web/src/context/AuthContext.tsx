import { useCallback, useMemo, useState, type ReactNode } from 'react';
import type { LoginInput } from '@paulline/types';
import { paulineClient } from '../lib/paulineClient';
import { AuthContext, SESSION_STORAGE_KEY, type AuthContextValue } from './authContextValue';

const readStoredToken = (): string | null => localStorage.getItem(SESSION_STORAGE_KEY);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessionToken, setSessionToken] = useState<string | null>(() => {
    const stored = readStoredToken();
    if (stored) {
      paulineClient.auth().setSessionToken(stored);
    }
    return stored;
  });
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (input: LoginInput) => {
    setError(null);
    try {
      const session = await paulineClient.auth().login(input);
      localStorage.setItem(SESSION_STORAGE_KEY, session.sessionToken);
      setSessionToken(session.sessionToken);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Login failed';
      setError(message);
      throw caught;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await paulineClient.auth().logout();
    } finally {
      paulineClient.auth().setSessionToken(null);
      localStorage.removeItem(SESSION_STORAGE_KEY);
      setSessionToken(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ isAuthenticated: sessionToken !== null, error, login, logout }),
    [sessionToken, error, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
