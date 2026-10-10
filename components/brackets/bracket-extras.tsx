"use client";

import { Medal, Radio, Trophy } from "lucide-react";
import type { BracketStrings } from "@/lib/i18n/bracket-strings";
import type { Bracket, BracketMatch, PodiumEntry } from "@/types/bracket";

const MEDAL_STYLE: Record<PodiumEntry["medal"], { icon: string; ring: string; label: "gold" | "silver" | "bronze" }> = {
  GOLD: { icon: "text-amber-300", ring: "border-amber-400/50 bg-amber-400/10", label: "gold" },
  SILVER: { icon: "text-slate-300", ring: "border-slate-400/50 bg-slate-400/10", label: "silver" },
  BRONZE: { icon: "text-orange-400", ring: "border-orange-500/50 bg-orange-500/10", label: "bronze" },
};

/** Gold, silver and the two bronzes once the final has been decided. */
export function Podium({ bracket, t }: { bracket: Bracket; t: BracketStrings }) {
  if (bracket.podium.length === 0) return null;
  return (
    <section className="rounded-xl border border-ink-600/70 bg-ink-700 p-5 mb-5">
      <div className="flex items-center gap-2 mb-3 text-xs uppercase tracking-[0.18em] text-slate-500">
        <Trophy size={14} />
        {t.podium}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {bracket.podium.map((entry) => {
          const style = MEDAL_STYLE[entry.medal];
          return (
            <div
              key={`${entry.medal}-${entry.player.playerId}`}
              className={`rounded-lg border px-4 py-3 flex items-center gap-3 ${style.ring}`}
            >
              <span className={style.icon}>
                <Medal size={22} />
              </span>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
                  {t[style.label]}
                </div>
                <div className="text-sm font-semibold text-white truncate">{entry.player.name}</div>
                {entry.player.academyName && (
                  <div className="text-[11px] text-slate-500 truncate">{entry.player.academyName}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function pairLabel(match: BracketMatch): string {
  return `${match.player1?.name ?? "—"}  vs  ${match.player2?.name ?? "—"}`;
}

/** What is being fought right now and what comes next, for people watching from the stands. */
export function LiveStrip({ bracket, t }: { bracket: Bracket; t: BracketStrings }) {
  if (bracket.summary.complete) return null;
  const real = bracket.matches.filter((m) => !m.bye);
  const now = real.filter((m) => m.status === "IN_PROGRESS");
  const next = real
    .filter((m) => m.status === "READY")
    .sort((a, b) => a.roundNumber - b.roundNumber || a.matchIndex - b.matchIndex)
    .slice(0, 3);

  return (
    <section className="rounded-xl border border-ink-600/70 bg-ink-700 p-4 mb-5 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <div className="flex items-center gap-2 mb-2 text-[11px] uppercase tracking-[0.16em] text-flag font-semibold">
          <Radio size={13} />
          {t.nowPlaying}
        </div>
        {now.length === 0 ? (
          <p className="text-sm text-slate-500">{t.nothingNow}</p>
        ) : (
          <ul className="space-y-1.5">
            {now.map((m) => (
              <li key={m.matchId} className="text-sm text-white">
                <span className="text-slate-500 me-2 text-xs">{m.matchNumber && t.matchLabel(m.matchNumber)}</span>
                {pairLabel(m)}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <div className="mb-2 text-[11px] uppercase tracking-[0.16em] text-sky-300 font-semibold">
          {t.upNext}
        </div>
        {next.length === 0 ? (
          <p className="text-sm text-slate-500">—</p>
        ) : (
          <ul className="space-y-1.5">
            {next.map((m) => (
              <li key={m.matchId} className="text-sm text-slate-200">
                <span className="text-slate-500 me-2 text-xs">{m.matchNumber && t.matchLabel(m.matchNumber)}</span>
                {pairLabel(m)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
