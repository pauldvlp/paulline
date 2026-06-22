import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { RequireAuth } from './RequireAuth';

const STORAGE_KEY = 'paulline.sessionToken';

const renderAt = (initialPath: string) =>
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/login" element={<div>Login screen</div>} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <div>Protected dashboard</div>
              </RequireAuth>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );

describe('RequireAuth', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('redirects to /login when not authenticated', () => {
    renderAt('/');
    expect(screen.getByText('Login screen')).toBeInTheDocument();
    expect(screen.queryByText('Protected dashboard')).not.toBeInTheDocument();
  });

  it('renders the protected content when a token is stored', () => {
    localStorage.setItem(STORAGE_KEY, 'persisted.token');
    renderAt('/');
    expect(screen.getByText('Protected dashboard')).toBeInTheDocument();
  });
});
