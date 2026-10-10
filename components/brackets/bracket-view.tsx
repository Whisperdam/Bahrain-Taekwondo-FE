"use client";

import { useId, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { CornerBadge, activeCorner } from "@/components/brackets/corner-badge";
import type { BracketStrings } from "@/lib/i18n/bracket-strings";
import type { Bracket, BracketMatch, BracketPlayer } from "@/types/bracket";

/** Who the viewer is, so their player (or their academy's players) stand out. */
export interface ViewerIdentity {
  playerId: number | null;
  academyIds: Set<number>;
}

export interface SwapControls {
  /** First-round slot currently picked, or null. */
  selectedSlot: number | null;
  onPickSlot: (slot: number) => void;
}

interface BracketViewProps {
  bracket: Bracket;
  t: BracketStrings;
  viewer: ViewerIdentity;
  /** Admins: open the result dialog for a match. */
  onSelectMatch?: (match: BracketMatch) => void;
  /** Admins on a draft: pick two first-round players to swap. */
  swap?: SwapControls;
}

export function roundTitle(round: number, totalRounds: number, t: BracketStrings): string {
  const fromEnd = totalRounds - round;
  if (fromEnd === 0) return t.roundFinal;
  if (fromEnd === 1) return t.roundSemi;
  if (fromEnd === 2) return t.roundQuarter;
  return t.roundOf(2 ** (fromEnd + 1));
}

/**
 * The whole bracket, one column per round. Every round-N+1 cell is centred
 * between the two round-N cells that feed it, joined by connector lines, so it
 * reads like the familiar printed draw.
 * <p>
 * On a phone only a column or two fits, so a chip bar jumps straight to a round
 * (or to the viewer's own match) and scrolling snaps to round boundaries.
 */
export function BracketView({ bracket, t, viewer, onSelectMatch, swap }: BracketViewProps) {
  const totalRounds = bracket.summary.totalRounds;
  const containerId = useId();
  const [activeRound, setActiveRound] = useState(1);

  const rounds = Array.from({ length: totalRounds }, (_, i) => i + 1).map((round) => ({
    round,
    matches: bracket.matches
      .filter((m) => m.roundNumber === round)
      .sort((a, b) => a.matchIndex - b.matchIndex),
  }));

  // The viewer's current match: their first unfinished one, else their latest.
  const mine = bracket.matches
    .filter((m) => !m.bye && viewer.playerId != null &&
      (m.player1?.playerId === viewer.playerId || m.player2?.playerId === viewer.playerId))
    .sort((a, b) => a.roundNumber - b.roundNumber);
  const myMatch = mine.find((m) => m.status !== "COMPLETED") ?? mine[mine.length - 1] ?? null;

  function jumpToRound(round: number) {
    document
      .getElementById(containerId)
      ?.querySelector(`[data-round="${round}"]`)
      ?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }

  function jumpToMyMatch() {
    if (!myMatch) return;
    document
      .getElementById(containerId)
      ?.querySelector(`[data-match-id="${myMatch.matchId}"]`)
      ?.scrollIntoView({ behavior: "smooth", inline: "center", block: "center" });
  }

  // Which round is nearest the middle of the viewport, to highlight its chip.
  function onScroll(box: HTMLElement) {
    const mid = box.getBoundingClientRect().left + box.clientWidth / 2;
    let best = activeRound;
    let bestDistance = Infinity;
    box.querySelectorAll<HTMLElement>("[data-round]").forEach((col) => {
      const r = col.getBoundingClientRect();
      const distance = Math.abs(r.left + r.width / 2 - mid);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = Number(col.dataset.round);
      }
    });
    if (best !== activeRound) setActiveRound(best);
  }

  return (
    <div>
      {(totalRounds > 1 || myMatch) && (
        <div className="flex items-center gap-2 overflow-x-auto pb-3 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {myMatch && (
            <button
              type="button"
              onClick={jumpToMyMatch}
              className="shrink-0 min-h-[36px] rounded-full border border-flag/60 bg-flag/10 px-3.5 text-xs font-semibold text-flag"
            >
              {t.myMatch}
            </button>
          )}
          {totalRounds > 1 &&
            rounds.map(({ round }) => (
              <button
                key={round}
                type="button"
                onClick={() => jumpToRound(round)}
                aria-current={activeRound === round}
                className={cn(
                  "md:hidden shrink-0 min-h-[36px] rounded-full border px-3.5 text-xs font-medium whitespace-nowrap transition-colors",
                  activeRound === round
                    ? "border-white/70 bg-white/10 text-white"
                    : "border-ink-600 text-slate-400",
                )}
              >
                {roundTitle(round, totalRounds, t)}
              </button>
            ))}
        </div>
      )}

      <div id={containerId} onScroll={(e) => onScroll(e.currentTarget)} className="overflow-x-auto pb-4 snap-x snap-proximity">
        <div className="flex min-w-max">
          {rounds.map(({ round, matches }) => (
            <div key={round} data-round={round} className="flex flex-col w-[248px] shrink-0 snap-start">
              <div className="text-[10px] uppercase tracking-[0.16em] font-medium text-slate-500 text-center mb-2 h-4">
                {roundTitle(round, totalRounds, t)}
              </div>
              <div className="flex flex-col flex-1">
                {matches.map((match) => (
                  <div
                    key={match.matchId}
                    data-match-id={match.matchId}
                    className="relative flex-1 flex items-center px-4 py-1.5"
                  >
                    {round > 1 && (
                      <span className="absolute start-0 top-1/2 w-4 border-t border-ink-500" aria-hidden="true" />
                    )}
                    {round < totalRounds && (
                      <>
                        <span className="absolute end-0 top-1/2 w-4 border-t border-ink-500" aria-hidden="true" />
                        <span
                          className={cn(
                            "absolute end-0 border-e border-ink-500",
                            match.matchIndex % 2 === 0 ? "top-1/2 bottom-0" : "top-0 h-1/2",
                          )}
                          aria-hidden="true"
                        />
                      </>
                    )}
                    <MatchCard
                      match={match}
                      t={t}
                      viewer={viewer}
                      onSelect={onSelectMatch}
                      swap={round === 1 ? swap : undefined}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MatchCard({
  match,
  t,
  viewer,
  onSelect,
  swap,
}: {
  match: BracketMatch;
  t: BracketStrings;
  viewer: ViewerIdentity;
  onSelect?: (match: BracketMatch) => void;
  swap?: SwapControls;
}) {
  const live = match.status === "IN_PROGRESS";
  const upNext = match.status === "READY";
  const canOpen =
    !!onSelect && !swap && !match.bye && !!match.player1 && !!match.player2;

  const body = (
    <div
      className={cn(
        "w-full rounded-lg border bg-ink-700 overflow-hidden text-start",
        live
          ? "border-flag ring-1 ring-flag/40"
          : upNext
            ? "border-sky-500/40"
            : "border-ink-600/70",
        match.bye && "opacity-70",
        canOpen && "hover:border-flag/60 transition-colors",
      )}
    >
      <div className="flex items-center justify-between gap-2 px-2.5 py-1 bg-ink-800/70 text-[10px] uppercase tracking-[0.14em] text-slate-500">
        <span>{match.bye ? t.bye : match.matchNumber ? t.matchLabel(match.matchNumber) : ""}</span>
        {live && (
          <span className="inline-flex items-center gap-1 text-flag font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-flag animate-pulse" aria-hidden="true" />
            {t.live}
          </span>
        )}
        {upNext && <span className="text-sky-300 font-semibold">{t.next}</span>}
      </div>
      <PlayerRow
        player={match.player1}
        side={1}
        match={match}
        t={t}
        viewer={viewer}
        slot={swap ? (match.matchIndex * 2) : null}
        swap={swap}
      />
      <div className="border-t border-ink-600/50" />
      <PlayerRow
        player={match.player2}
        side={2}
        match={match}
        t={t}
        viewer={viewer}
        slot={swap ? (match.matchIndex * 2 + 1) : null}
        swap={swap}
      />
    </div>
  );

  if (!canOpen) return body;
  return (
    <button type="button" onClick={() => onSelect?.(match)} className="w-full block">
      {body}
    </button>
  );
}

function PlayerRow({
  player,
  side,
  match,
  t,
  viewer,
  slot,
  swap,
}: {
  player: BracketPlayer | null;
  side: 1 | 2;
  match: BracketMatch;
  t: BracketStrings;
  viewer: ViewerIdentity;
  slot: number | null;
  swap?: SwapControls;
}) {
  const score = side === 1 ? match.player1Score : match.player2Score;
  const corner = player ? activeCorner(match, side) : null;
  const decided = match.status === "COMPLETED" && !match.bye;
  const won = !!player && match.winnerId === player.playerId;
  const lost = decided && !!player && !won;
  const mine = !!player && viewer.playerId === player.playerId;
  const myAcademy = !mine && !!player && player.academyId != null && viewer.academyIds.has(player.academyId);
  const selected = swap != null && slot != null && swap.selectedSlot === slot;

  const content = (
    <div
      className={cn(
        "flex items-center gap-2 px-2.5 py-1.5 min-h-[38px]",
        won && "bg-emerald-500/10",
        lost && "opacity-50",
        mine && "bg-flag/10 ring-1 ring-inset ring-flag/60",
        myAcademy && "border-s-2 border-flag/50",
        selected && "bg-sky-500/20 ring-1 ring-inset ring-sky-400",
      )}
    >
      <div className="min-w-0 flex-1">
        {player ? (
          <>
            <div className={cn("text-[13px] truncate leading-tight", won ? "text-white font-semibold" : "text-slate-100")}>
              {player.name}
              {mine && (
                <span className="ms-1.5 text-[9px] uppercase tracking-[0.12em] text-flag font-semibold">
                  {t.you}
                </span>
              )}
            </div>
            {player.academyName && (
              <div className="text-[10px] text-slate-500 truncate leading-tight">{player.academyName}</div>
            )}
          </>
        ) : (
          <span className="text-[11px] italic text-slate-500">
            {match.bye ? t.bye : t.tbd}
          </span>
        )}
      </div>
      {corner && <CornerBadge corner={corner} t={t} />}
      {decided && score != null && (
        <span className="text-xs font-semibold tabular-nums text-slate-200">{score}</span>
      )}
      {won && (
        <span className="text-emerald-400 shrink-0" aria-label="winner">
          <Check size={14} />
        </span>
      )}
    </div>
  );

  // An empty slot (a bye) can be picked too, to give someone else the bye.
  if (swap && slot != null) {
    return (
      <button type="button" className="w-full block" onClick={() => swap.onPickSlot(slot)}>
        {content}
      </button>
    );
  }
  return content;
}
