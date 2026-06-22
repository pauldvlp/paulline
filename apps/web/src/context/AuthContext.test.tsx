import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from './AuthContext';
import { useAuth } from '../hooks/useAuth';

const STORAGE_KEY = 'paulline.sessionToken';

const loginMock = vi.fn();
const logoutMock = vi.fn();
const setSessionTokenMock = vi.fn();
const getSessionTokenMock = vi.fn();

vi.mock('../lib/paulineClient', () => ({
  paulineClient: {
    auth: () => ({
      login: loginMock,
      logout: logoutMock,
      setSessionToken: setSessionTokenMock,
      getSessionToken: getSessionTokenMock,
    }),
  },
}));

function AuthProbe() {
  const { isAuthenticated, login, logout, error } = useAuth();
  return (
    <div>
      <span data-testid="auth-state">{isAuthenticated ? 'authenticated' : 'anonymous'}</span>
      <span data-testid="auth-error">{error ?? ''}</span>
      <button type="button" onClick={() => void login({ apiToken: 'cf-token' }).catch(() => undefined)}>
        login
      </button>
      <button type="button" onClick={() => void logout().catch(() => undefined)}>
        logout
      </button>
    </div>
  );
}

const renderProbe = () =>
  render(
    <AuthProvider>
      <AuthProbe />
    </AuthProvider>,
  );

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    getSessionTokenMock.mockReturnValue(null);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('starts anonymous when no token is stored', () => {
    renderProbe();
    expect(screen.getByTestId('auth-state')).toHaveTextContent('anonymous');
  });

  it('login stores the token and flips to authenticated', async () => {
    const user = userEvent.setup();
    loginMock.mockResolvedValue({ sessionToken: 'jwt.token', expiresAt: '2026-06-23T00:00:00.000Z' });
    renderProbe();

    await user.click(screen.getByRole('button', { name: 'login' }));

    await waitFor(() => {
      expect(screen.getByTestId('auth-state')).toHaveTextContent('authenticated');
    });
    expect(localStorage.getItem(STORAGE_KEY)).toBe('jwt.token');
  });

  it('hydrates as authenticated when a token is already in storage', () => {
    localStorage.setItem(STORAGE_KEY, 'persisted.token');
    renderProbe();

    expect(screen.getByTestId('auth-state')).toHaveTextContent('authenticated');
    expect(setSessionTokenMock).toHaveBeenCalledWith('persisted.token');
  });

  it('login surfaces the error message and stays anonymous on failure', async () => {
    const user = userEvent.setup();
    loginMock.mockRejectedValue(
      Object.assign(new Error('Invalid'), {
        message: 'Invalid API key. Check credentials at https://dash.cloudflare.com',
      }),
    );
    renderProbe();

    await user.click(screen.getByRole('button', { name: 'login' }));

    await waitFor(() => {
      expect(screen.getByTestId('auth-error')).toHaveTextContent(
        'Invalid API key. Check credentials at https://dash.cloudflare.com',
      );
    });
    expect(screen.getByTestId('auth-state')).toHaveTextContent('anonymous');
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('logout clears the token and storage', async () => {
    const user = userEvent.setup();
    localStorage.setItem(STORAGE_KEY, 'persisted.token');
    logoutMock.mockResolvedValue(undefined);
    renderProbe();

    await user.click(screen.getByRole('button', { name: 'logout' }));

    await waitFor(() => {
      expect(screen.getByTestId('auth-state')).toHaveTextContent('anonymous');
    });
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
