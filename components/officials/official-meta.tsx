import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { OfficialStrings } from "@/lib/i18n/official-strings";
import type { OfficialLevel, OfficialSpecialization } from "@/types/official";

interface OfficialMetaProps {
  specialization: OfficialSpecialization | null;
  level: OfficialLevel | null;
  certificationExpiry: string | null;
  /** If given, a certification that ends before this date (ISO) is flagged. */
  mustBeValidOn?: string;
  active?: boolean;
  t: OfficialStrings;
  className?: string;
}

/** "Referee · National · Certified until Mar 3, 2027", flagged when the certification will have lapsed. */
export function OfficialMeta({
  specialization,
  level,
  certificationExpiry,
  mustBeValidOn,
  active = true,
  t,
  className,
}: OfficialMetaProps) {
  const parts: string[] = [];
  if (specialization) parts.push(t[`spec${specialization}` as const]);
  if (level) parts.push(t[`level${level}` as const]);

  const lapses = !!certificationExpiry && !!mustBeValidOn && certificationExpiry < mustBeValidOn;
  const expiry = certificationExpiry ? format(new Date(certificationExpiry), "PP") : null;

  return (
    <span className={cn("text-xs text-slate-500 flex flex-wrap items-center gap-x-1.5 gap-y-0.5", className)}>
      {parts.length > 0 && <span>{parts.join(" · ")}</span>}
      {expiry && !lapses && <span>· {t.certExpires(expiry)}</span>}
      {expiry && lapses && (
        <span className="text-amber-300 font-medium">· {t.certExpiredBefore(expiry)}</span>
      )}
      {!active && (
        <span className="rounded border border-ink-600 px-1.5 py-px text-[10px] uppercase tracking-[0.12em] text-slate-400">
          {t.inactive}
        </span>
      )}
    </span>
  );
}
