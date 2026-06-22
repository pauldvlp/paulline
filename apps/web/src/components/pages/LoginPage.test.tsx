import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from './LoginPage';

const loginMock = vi.fn();
let errorValue: string | null = null;
let authenticatedValue = false;

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: authenticatedValue,
    error: errorValue,
    login: loginMock,
    logout: vi.fn(),
  }),
}));

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<div>Dashboard</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    errorValue = null;
    authenticatedValue = false;
  });

  it('calls login with the submitted api token', async () => {
    const user = userEvent.setup();
    loginMock.mockResolvedValue(undefined);
    renderPage();

    await user.type(screen.getByLabelText(/cloudflare api token/i), 'cf-token-123');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({ apiToken: 'cf-token-123' });
    });
  });

  it('renders the exact invalid-token error message', () => {
    errorValue = 'Invalid API key. Check credentials at https://dash.cloudflare.com';
    renderPage();

    expect(
      screen.getByText('Invalid API key. Check credentials at https://dash.cloudflare.com'),
    ).toBeInTheDocument();
  });

  it('redirects to the dashboard when already authenticated', () => {
    authenticatedValue = true;
    renderPage();

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
