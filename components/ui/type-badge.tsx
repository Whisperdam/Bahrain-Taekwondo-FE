import { Award, Medal, Building2 } from "lucide-react";
import type { ApplicationType } from "@/types/applications";

const ICONS: Record<ApplicationType, React.ComponentType<{ size?: number }>> = {
  COACH: Award,
  OFFICIAL: Medal,
  ACADEMY: Building2,
};

export function TypeBadge({
  type,
  label,
}: {
  type: ApplicationType;
  label: string;
}) {
  const Icon = ICONS[type];
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] font-medium text-slate-300 border border-ink-600 bg-ink-800/60 rounded px-1.5 py-0.5">
      <span className="text-flag">
        <Icon size={11} />
      </span>
      {label}
    </span>
  );
}
