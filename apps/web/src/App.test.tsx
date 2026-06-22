import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('App', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('renders the login screen when unauthenticated', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /sign in to paulline/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/cloudflare api token/i)).toBeInTheDocument();
  });

  it('renders the dashboard when a session token is stored', () => {
    localStorage.setItem('paulline.sessionToken', 'persisted.token');
    render(<App />);
    expect(screen.getByRole('heading', { name: /hello paulline/i })).toBeInTheDocument();
  });
});
