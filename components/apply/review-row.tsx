interface ReviewRowProps {
  label: string;
  children?: React.ReactNode;
}

export function ReviewRow({ label, children }: ReviewRowProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-1 sm:gap-4 py-2.5 border-b border-ink-600/40 last:border-0">
      <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
        {label}
      </div>
      <div className="text-sm text-slate-100">
        {children || <span className="text-slate-500 italic">—</span>}
      </div>
    </div>
  );
}
