import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('renders an api token field and a submit button', () => {
    render(<LoginForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/cloudflare api token/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('masks the api token input as a password field', () => {
    render(<LoginForm onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/cloudflare api token/i)).toHaveAttribute('type', 'password');
  });

  it('shows a validation error and does not submit when empty', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with the trimmed api token on valid input', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/cloudflare api token/i), 'cf-token-123');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ apiToken: 'cf-token-123' });
    });
  });
});
