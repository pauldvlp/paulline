import { type ReactNode } from 'react';

export interface AuthLayoutProps {
  title: string;
  children: ReactNode;
}

export function AuthLayout({ title, children }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-800 bg-slate-900 p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-semibold tracking-tight text-slate-50">
          {title}
        </h1>
        {children}
      </div>
    </main>
  );
}
