import type { ReactNode } from "react";

export function AdminPageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="font-display text-4xl font-extrabold uppercase tracking-wide">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

export function NotConfigured() {
  return (
    <div role="alert" className="border border-amber-400/40 bg-amber-400/10 p-6 text-sm text-amber-100">
      <p className="font-bold">Database not connected</p>
      <p className="mt-1 text-amber-100/80">
        Set <code>SUPABASE_URL</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code> in your environment variables and run the SQL
        in <code>supabase/migrations</code>. See the README for setup steps.
      </p>
    </div>
  );
}

export function AdminLoading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading">
      <div className="h-10 w-64 animate-pulse bg-white/5" />
      <div className="h-64 animate-pulse bg-white/5" />
    </div>
  );
}
