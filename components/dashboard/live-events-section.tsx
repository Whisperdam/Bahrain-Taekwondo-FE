"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { CalendarDays, MapPin, Swords, Trophy } from "lucide-react";
import { DASH_STRINGS } from "@/lib/i18n/dashboard-strings";
import type { DashLang } from "@/lib/i18n/dashboard-strings";
import { fetchLiveTournaments } from "@/lib/dashboard/api";
import { fetchBrackets } from "@/lib/brackets/api";
import type { TournamentDTO } from "@/types/dashboard";

interface LiveEventsSectionProps {
  lang: DashLang;
}

/**
 * The headline of the dashboard while something is happening: every tournament
 * that is being held right now. It renders nothing at all otherwise (while
 * loading, on error, or when no event is on), so the dashboard looks as usual.
 */
export function LiveEventsSection({ lang }: LiveEventsSectionProps) {
  const t = DASH_STRINGS[lang];

  const liveQ = useQuery({
    queryKey: ["tournaments", "live"],
    queryFn: fetchLiveTournaments,
    // Short enough to notice a tournament starting or ending, long enough that
    // coming back to the dashboard does not fetch every time.
    staleTime: 2 * 60 * 1000,
  });

  const events = liveQ.data ?? [];
  if (events.length === 0) return null;

  return (
    // A full-width band, so it sits outside the page's centered column. The moving
    // layers are decoration only; the cards on top of them stay still.
    <section aria-labelledby="live-h" className="live-band">
      <div className="live-layer live-glow live-glow-a" aria-hidden="true" />
      <div className="live-layer live-glow live-glow-b" aria-hidden="true" />
      <div className="live-layer live-stripes" aria-hidden="true" />
      <div className="live-layer live-ring" aria-hidden="true" />
      <div className="live-layer live-ring live-ring-2" aria-hidden="true" />
      <div className="live-layer live-ring live-ring-3" aria-hidden="true" />

      {/* Equal padding above and below, so the card sits in the middle of the band. The
          label is placed in the top padding rather than above the card. */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <h2
          id="live-h"
          className="absolute start-4 top-5 inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.22em] text-white sm:start-6 sm:top-6 sm:text-base lg:start-8"
        >
          <span className="relative flex h-3 w-3" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-flag opacity-70" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-flag" />
          </span>
          {t.liveHeading}
        </h2>
        <div className="flex flex-col gap-5">
          {events.map((event) => (
            <LiveEventCard key={event.tournamentId} event={event} lang={lang} />
          ))}
        </div>
      </div>
    </section>
  );
}

function LiveEventCard({ event, lang }: { event: TournamentDTO; lang: DashLang }) {
  const t = DASH_STRINGS[lang];

  // How far along the tournament is, from its published brackets.
  const bracketsQ = useQuery({
    queryKey: ["brackets", "list", event.tournamentId],
    queryFn: () => fetchBrackets(event.tournamentId),
    staleTime: 60 * 1000,
  });
  const published = (bracketsQ.data ?? []).filter((b) => b.status === "PUBLISHED");
  const total = published.reduce((sum, b) => sum + b.matchesTotal, 0);
  const done = published.reduce((sum, b) => sum + b.matchesCompleted, 0);
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  const start = parseISO(event.startDate);
  const end = parseISO(event.endDate);
  const days = differenceInCalendarDays(end, start) + 1;
  const day = Math.min(days, Math.max(1, differenceInCalendarDays(new Date(), start) + 1));

  return (
    <article className="live-card w-full rounded-2xl p-5 sm:p-7 lg:max-w-3xl">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-flag px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-accent-foreground">
          {t.liveBadge}
        </span>
        {days > 1 && <span className="text-xs text-slate-400">{t.liveDay(day, days)}</span>}
      </div>

      <h3 className="mt-3 flex items-start gap-3 text-2xl sm:text-3xl font-semibold tracking-tight text-white">
        <span className="mt-1 shrink-0 text-flag">
          <Trophy size={26} aria-hidden="true" />
        </span>
        <span className="min-w-0 break-words text-balance">{event.tournamentName}</span>
      </h3>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-slate-300">
        {event.venue && (
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={15} className="text-slate-400" aria-hidden="true" />
            {event.venue}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays size={15} className="text-slate-400" aria-hidden="true" />
          {format(start, "MMM d")} – {format(end, "MMM d, yyyy")}
        </span>
      </div>

      {total > 0 && (
        <div className="mt-5">
          <div className="mb-1.5 text-xs text-slate-400 tabular-nums">{t.liveProgress(done, total)}</div>
          <div
            className="h-1.5 overflow-hidden rounded-full bg-ink-800"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={done}
            aria-label={t.liveProgress(done, total)}
          >
            <div className="h-full rounded-full bg-flag" style={{ width: `${percent}%` }} />
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/tournaments/${event.tournamentId}/matches`}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-flag px-5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-flag-hover"
        >
          <Swords size={16} aria-hidden="true" />
          {t.liveMatches}
        </Link>
        <Link
          href={`/tournaments/${event.tournamentId}`}
          className="inline-flex min-h-[44px] items-center rounded-lg border border-ink-600 px-5 text-sm font-medium text-slate-200 transition-colors hover:border-ink-500 hover:text-white"
        >
          {t.liveDetails}
        </Link>
      </div>
    </article>
  );
}
