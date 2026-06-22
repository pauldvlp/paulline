import { createContext } from 'react';
import type { LoginInput } from '@paulline/types';

export const SESSION_STORAGE_KEY = 'paulline.sessionToken';

export interface AuthContextValue {
  isAuthenticated: boolean;
  error: string | null;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
