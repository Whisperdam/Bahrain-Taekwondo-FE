import { cn } from "@/lib/utils";
import type { ApplicationStatus } from "@/types/applications";

const STYLES: Record<ApplicationStatus, string> = {
  PENDING: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  UNDER_REVIEW: "bg-sky-500/10 text-sky-300 border-sky-500/30",
  APPROVED: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  REJECTED: "bg-red-500/10 text-red-300 border-red-500/30",
  WITHDRAWN: "bg-slate-500/10 text-slate-300 border-slate-500/30",
};

export function StatusBadge({
  status,
  label,
}: {
  status: ApplicationStatus;
  label: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-[10px] uppercase tracking-[0.14em] font-medium border rounded px-1.5 py-0.5",
        STYLES[status],
      )}
    >
      {label}
    </span>
  );
}
