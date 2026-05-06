import * as React from "react";

function AlertIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

export function Field({ id, label, error, hint, children }: FieldProps) {
  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="block text-[11px] font-medium tracking-[0.14em] uppercase text-slate-400 mb-1.5"
      >
        {label}
      </label>
      {children}
      {hint && !error && (
        <div className="mt-1.5 text-[11px] text-slate-500">{hint}</div>
      )}
      {error && (
        <div className="mt-1.5 text-[12px] text-red-400 flex items-center gap-1.5">
          <AlertIcon />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
