import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';

export function DashboardPage() {
  const { logout } = useAuth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-950 text-slate-50">
      <h1 className="text-4xl font-semibold tracking-tight">Hello Paulline</h1>
      <Button type="button" variant="outline" onClick={() => void logout()}>
        Log out
      </Button>
    </main>
  );
}
