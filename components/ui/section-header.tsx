interface SectionHeaderProps {
  title: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, action, className }: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className ?? ""}`}>
      <h2 className="text-xs uppercase tracking-[0.18em] text-slate-500">
        {title}
      </h2>
      {action}
    </div>
  );
}
