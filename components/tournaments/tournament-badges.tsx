import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  UPCOMING: "bg-sky-500/10 text-sky-300 border-sky-500/30",
  ONGOING: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  COMPLETED: "bg-slate-500/10 text-slate-300 border-slate-500/30",
  CANCELLED: "bg-red-500/10 text-red-300 border-red-500/30",
};

const TYPE_STYLES: Record<string, string> = {
  NATIONAL: "bg-flag/15 text-flag border-flag/40",
  INTERNATIONAL: "bg-amber-500/10 text-amber-300 border-amber-500/40",
  REGIONAL: "bg-sky-500/10 text-sky-300 border-sky-500/40",
};

const CHIP =
  "inline-flex items-center text-[10px] uppercase tracking-[0.14em] font-medium border rounded px-1.5 py-0.5";

export function TournamentStatusBadge({
  status,
  label,
}: {
  status: string;
  label: string;
}) {
  return (
    <span className={cn(CHIP, STATUS_STYLES[status] ?? STATUS_STYLES.UPCOMING)}>
      {label}
    </span>
  );
}

export function TournamentTypeBadge({
  type,
  label,
}: {
  type: string;
  label: string;
}) {
  return (
    <span className={cn(CHIP, TYPE_STYLES[type] ?? TYPE_STYLES.NATIONAL)}>
      {label}
    </span>
  );
}
