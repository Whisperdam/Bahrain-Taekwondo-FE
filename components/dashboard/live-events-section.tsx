"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { CalendarDays, MapPin, Swords, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { DASH_STRINGS } from "@/lib/i18n/dashboard-strings";
import type { DashLang } from "@/lib/i18n/dashboard-strings";
import { fetchLiveTournaments } from "@/lib/dashboard/api";
import { fetchBrackets } from "@/lib/brackets/api";
import type { TournamentDTO } from "@/types/dashboard";

interface LiveEventsSectionProps {
  lang: DashLang;
}

/** How long each event stays on screen before the next one slides in. */
const ROTATE_MS = 10_000;

/**
 * The headline of the dashboard while something is happening: the tournaments that
 * are being held right now. It renders nothing at all otherwise (while loading, on
 * error, or when no event is on), so the dashboard looks as usual.
 * <p>
 * One event is shown at a time. With several, dots at the bottom of the band switch
 * between them, they can be swiped on a phone, and they rotate by themselves every
 * ten seconds (paused while the pointer or keyboard focus is on the band).
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
  const count = events.length;

  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const current = Math.min(active, Math.max(0, count - 1));

  const goTo = useCallback((index: number) => {
    const el = scroller.current;
    if (!el) return;
    const rtl = getComputedStyle(el).direction === "rtl"; // scrollLeft runs negative in right-to-left
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({
      left: (rtl ? -1 : 1) * index * el.clientWidth,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, []);

  // Which event is showing follows the scroll position, so swiping and the dots agree.
  const onScroll = useCallback(() => {
    const el = scroller.current;
    if (!el || el.clientWidth === 0) return;
    setActive(Math.round(Math.abs(el.scrollLeft) / el.clientWidth));
  }, []);

  // Next event every ten seconds. The timer starts over whenever the event changes,
  // so choosing one by hand gives it a full ten seconds.
  useEffect(() => {
    if (count < 2 || paused) return;
    const id = window.setInterval(() => {
      if (!document.hidden) goTo((current + 1) % count);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [count, paused, current, goTo]);

  if (count === 0) return null;

  return (
    // A full-width band, so it sits outside the page's centered column. The moving
    // layers are decoration only.
    <section
      aria-labelledby="live-h"
      className="live-band"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="live-layer live-glow live-glow-a" aria-hidden="true" />
      <div className="live-layer live-glow live-glow-b" aria-hidden="true" />
      <div className="live-layer live-stripes" aria-hidden="true" />

      {/* Equal room above and below the card, so it sits in the middle of the band. The
          label takes up the top and the dots the bottom, both inside that room. */}
      <div className="relative z-10 mx-auto max-w-7xl py-[4.5rem] sm:py-[5.5rem]">
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

        {/* One event per screen-width slide; the browser snaps to each. */}
        <div
          ref={scroller}
          onScroll={onScroll}
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {events.map((event, i) => (
            <div
              key={event.tournamentId}
              role="group"
              aria-roledescription="slide"
              aria-label={t.liveEventOf(i + 1, count)}
              inert={i !== current}
              className="flex w-full shrink-0 snap-center items-center px-4 sm:px-6 lg:px-8"
            >
              <LiveEventCard event={event} lang={lang} />
            </div>
          ))}
        </div>

        {count > 1 && (
          <div className="absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-5 lg:inset-x-8">
            {/* centered under the card, which is at most 48rem wide */}
            <div className="flex justify-center lg:max-w-3xl">
              {events.map((event, i) => (
                <button
                  key={event.tournamentId}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`${t.liveEventOf(i + 1, count)}: ${event.tournamentName}`}
                  aria-current={i === current}
                  className="group flex h-6 items-center px-1"
                >
                  <span
                    className={cn(
                      "h-2 rounded-full transition-all",
                      i === current ? "w-6 bg-flag" : "w-2 bg-slate-400/60 group-hover:bg-slate-300",
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
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
