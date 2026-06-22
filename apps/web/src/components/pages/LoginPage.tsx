import { Navigate } from 'react-router-dom';
import type { LoginInput } from '@paulline/types';
import { useAuth } from '../../hooks/useAuth';
import { AuthLayout } from '../templates/AuthLayout';
import { LoginForm } from '../organisms/LoginForm';

const DASHBOARD_ROUTE = '/';

export function LoginPage() {
  const { isAuthenticated, error, login } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={DASHBOARD_ROUTE} replace />;
  }

  async function handleSubmit(values: LoginInput): Promise<void> {
    try {
      await login(values);
    } catch {
      // Error is surfaced through the auth context's error state.
    }
  }

  return (
    <AuthLayout title="Sign in to Paulline">
      <LoginForm onSubmit={handleSubmit} />
      {error ? (
        <p role="alert" className="mt-4 text-center text-sm font-medium text-red-400">
          {error}
        </p>
      ) : null}
    </AuthLayout>
  );
}
