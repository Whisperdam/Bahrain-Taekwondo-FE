"use client";

import Link from "next/link";
import { ArrowRight, ListChecks, Settings2, Swords, Trophy } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import type { BracketStrings } from "@/lib/i18n/bracket-strings";
import type { BracketSummary } from "@/types/bracket";

interface BracketListProps {
  tournamentId: number;
  brackets: BracketSummary[];
  isAdmin: boolean;
  t: BracketStrings;
}

/** The tournament's brackets as cards: class, court, progress and champion. */
export function BracketList({ tournamentId, brackets, isAdmin, t }: BracketListProps) {
  return (
    <section className="card bg-ink-700 border border-ink-600/70 rounded-xl p-6">
      <SectionHeader
        title={t.brackets}
        action={
          <div className="flex items-center gap-4">
            {brackets.some((b) => b.status === "PUBLISHED") && (
              <Link
                href={`/tournaments/${tournamentId}/matches`}
                className="min-h-[32px] text-xs text-flag hover:text-flag-hover font-medium inline-flex items-center gap-1.5 transition-colors"
              >
                <ListChecks size={14} />
                {t.allMatches}
              </Link>
            )}
            {isAdmin && (
              <Link
                href={`/admin/tournaments/${tournamentId}/brackets`}
                className="min-h-[32px] text-xs text-flag hover:text-flag-hover font-medium inline-flex items-center gap-1.5 transition-colors"
              >
                <Settings2 size={13} />
                {t.manageBrackets}
              </Link>
            )}
          </div>
        }
      />

      {brackets.length === 0 ? (
        <p className="text-sm text-slate-400">{isAdmin ? t.noBracketsAdmin : t.noBrackets}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {brackets.map((b) => (
            <BracketCard key={b.bracketId} bracket={b} tournamentId={tournamentId} t={t} />
          ))}
        </div>
      )}
    </section>
  );
}

function BracketCard({
  bracket,
  tournamentId,
  t,
}: {
  bracket: BracketSummary;
  tournamentId: number;
  t: BracketStrings;
}) {
  const percent = bracket.matchesTotal
    ? Math.round((bracket.matchesCompleted / bracket.matchesTotal) * 100)
    : 0;
  const draft = bracket.status === "DRAFT";
  const live = !draft && !bracket.complete && bracket.matchesCompleted > 0;

  return (
    <Link
      href={`/tournaments/${tournamentId}/brackets/${bracket.bracketId}`}
      className="group rounded-lg border border-ink-600/70 bg-ink-800/40 p-4 hover:border-flag/50 transition-colors flex flex-col gap-2.5"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white truncate">{bracket.categoryName}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {t[`gender${bracket.categoryGender}` as const]} · {t.playersCount(bracket.playerCount)}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {bracket.court && (
            <span className="text-[10px] uppercase tracking-[0.12em] border border-ink-600 rounded px-1.5 py-0.5 text-slate-300">
              {bracket.court}
            </span>
          )}
          {draft && (
            <span className="text-[10px] uppercase tracking-[0.12em] border border-amber-500/40 bg-amber-500/10 rounded px-1.5 py-0.5 text-amber-300">
              {t.draft}
            </span>
          )}
          {live && (
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-flag font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-flag animate-pulse" aria-hidden="true" />
              {t.live}
            </span>
          )}
        </div>
      </div>

      {bracket.complete && bracket.champion ? (
        <div className="flex items-center gap-2 text-sm text-amber-200">
          <Trophy size={14} />
          <span className="truncate">
            <span className="text-slate-500 text-xs me-1.5">{t.champion}</span>
            {bracket.champion.name}
          </span>
        </div>
      ) : (
        <>
          <div className="h-1.5 rounded-full bg-ink-800 overflow-hidden">
            <div className="h-full bg-flag rounded-full" style={{ width: `${percent}%` }} />
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Swords size={12} />
            {t.progress(bracket.matchesCompleted, bracket.matchesTotal)}
          </div>
        </>
      )}

      <div className="text-xs text-flag font-medium inline-flex items-center gap-1.5 mt-auto">
        {t.viewBracket}
        <span className="rtl:rotate-180 inline-flex transition-transform group-hover:translate-x-0.5">
          <ArrowRight size={12} />
        </span>
      </div>
    </Link>
  );
}
