import { Calendar, MapPin, Trophy, ArrowRight } from "lucide-react";
import { format, parseISO } from "date-fns";
import { DASH_STRINGS } from "@/lib/i18n/dashboard-strings";
import type { DashLang } from "@/lib/i18n/dashboard-strings";
import type { TournamentDTO } from "@/types/dashboard";

function formatDateRange(start: string, end: string): string {
  try {
    const s = parseISO(start);
    const e = parseISO(end);
    const sStr = format(s, "MMM d");
    const eStr = format(e, "d, yyyy");
    return `${sStr} – ${eStr}`;
  } catch {
    return `${start} – ${end}`;
  }
}

function TypeBadge({ type, lang }: { type: string; lang: DashLang }) {
  const t = DASH_STRINGS[lang];
  const styles: Record<string, { bg: string; text: string; border: string; label: string }> = {
    NATIONAL: {
      bg: "bg-flag/15",
      text: "text-flag",
      border: "border-flag/40",
      label: t.badgeNATIONAL,
    },
    INTERNATIONAL: {
      bg: "bg-amber-500/10",
      text: "text-amber-300",
      border: "border-amber-500/40",
      label: t.badgeINTERNATIONAL,
    },
    REGIONAL: {
      bg: "bg-sky-500/10",
      text: "text-sky-300",
      border: "border-sky-500/40",
      label: t.badgeREGIONAL,
    },
  };
  const s = styles[type] ?? styles.NATIONAL;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] rounded-md border ${s.bg} ${s.text} ${s.border}`}
    >
      {s.label}
    </span>
  );
}

function TournamentCard({ tournament, lang }: { tournament: TournamentDTO; lang: DashLang }) {
  return (
    <div className="card bg-ink-700 border border-ink-600/70 rounded-xl p-5 flex flex-col gap-3 h-full">
      <div className="flex items-start justify-between gap-3">
        <span className="text-flag"><Trophy size={20} /></span>
        <TypeBadge type={tournament.tournamentType} lang={lang} />
      </div>
      <h3 className="text-base font-semibold text-white leading-snug">
        {tournament.tournamentName}
      </h3>
      <div className="mt-auto flex flex-col gap-1.5 text-sm text-slate-400">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 shrink-0"><Calendar size={14} /></span>
          <span>{formatDateRange(tournament.startDate, tournament.endDate)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500 shrink-0"><MapPin size={14} /></span>
          <span className="truncate">{tournament.venue}</span>
        </div>
      </div>
    </div>
  );
}

function TournamentSkeleton() {
  return (
    <div className="bg-ink-700 border border-ink-600/70 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex justify-between">
        <div className="skel h-5 w-5 rounded-md" />
        <div className="skel h-5 w-20" />
      </div>
      <div className="skel h-5 w-4/5" />
      <div className="skel h-4 w-3/5 mt-auto" />
      <div className="skel h-4 w-2/5" />
    </div>
  );
}

interface TournamentsSectionProps {
  data: TournamentDTO[] | undefined;
  isLoading: boolean;
  lang: DashLang;
}

export function TournamentsSection({ data, isLoading, lang }: TournamentsSectionProps) {
  const t = DASH_STRINGS[lang];
  const isEmpty = !isLoading && (!data || data.length === 0);

  return (
    <section aria-labelledby="tour-h">
      <div className="flex items-end justify-between gap-4 mb-5">
        <h2 id="tour-h" className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
          {t.tournaments}
        </h2>
        <button className="shrink-0 whitespace-nowrap text-sm text-flag hover:text-flag-hover font-medium inline-flex items-center gap-1.5 transition-colors">
          <span>{t.viewAll}</span>
          <span className="rtl:rotate-180"><ArrowRight size={14} /></span>
        </button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <TournamentSkeleton />
          <TournamentSkeleton />
          <TournamentSkeleton />
        </div>
      )}

      {isEmpty && (
        <div className="bg-ink-700/50 border border-dashed border-ink-600 rounded-xl p-10 text-center">
          <div className="text-slate-500 mb-2 inline-flex"><Calendar size={22} /></div>
          <p className="text-sm text-slate-400">{t.noTournaments}</p>
        </div>
      )}

      {!isLoading && data && data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((tournament) => (
            <TournamentCard key={tournament.tournamentId} tournament={tournament} lang={lang} />
          ))}
        </div>
      )}
    </section>
  );
}
