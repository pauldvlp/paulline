import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const LOGIN_ROUTE = '/login';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={LOGIN_ROUTE} replace />;
  }

  return <>{children}</>;
}
