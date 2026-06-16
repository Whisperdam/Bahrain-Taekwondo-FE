import * as React from "react";

interface EmptyStateProps {
  icon?: React.ComponentType<{ size?: number }>;
  title: string;
  body?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, body, action }: EmptyStateProps) {
  return (
    <div className="bg-ink-700 border border-ink-600/70 rounded-xl p-10 text-center">
      {Icon && (
        <div className="inline-flex w-12 h-12 rounded-full bg-ink-800 border border-ink-600 text-slate-400 items-center justify-center mb-4">
          <Icon size={22} />
        </div>
      )}
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {body && (
        <p className="text-sm text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed">
          {body}
        </p>
      )}
      {action && (
        <div className="mt-5 flex items-center justify-center gap-2 flex-wrap">
          {action}
        </div>
      )}
    </div>
  );
}
