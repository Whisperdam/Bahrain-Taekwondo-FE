"use client";

import { ChevronLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  back?: { label: string; onClick: () => void };
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, back, action }: PageHeaderProps) {
  return (
    <div className="mb-6">
      {back && (
        <button
          type="button"
          onClick={back.onClick}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-flag transition-colors mb-3"
        >
          <span className="rtl:rotate-180">
            <ChevronLeft size={14} />
          </span>
          <span>{back.label}</span>
        </button>
      )}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1.5 text-sm text-slate-400 max-w-2xl">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
