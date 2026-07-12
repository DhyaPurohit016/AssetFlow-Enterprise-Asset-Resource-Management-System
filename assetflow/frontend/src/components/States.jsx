import { Inbox } from "lucide-react";

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-11 bg-surface-800 rounded-lg" />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return <div className="card h-28 animate-pulse bg-surface-800/60" />;
}

export function EmptyState({ title = "Nothing here yet", subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="p-3 rounded-full bg-surface-800 mb-4">
        <Inbox size={22} className="text-ink-400" />
      </div>
      <p className="text-ink-50 font-medium">{title}</p>
      {subtitle && <p className="text-sm text-ink-400 mt-1 max-w-sm">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950">
      <div className="w-8 h-8 border-2 border-sage-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
