"use client";

import { PlayerLink } from "@/components/shared/person-link";
import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Check, Search, Swords } from "lucide-react";
import { TopNav } from "@/components/dashboard/top-nav";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { MatchDialog } from "@/components/brackets/match-dialog";
import { roundTitle, type ViewerIdentity } from "@/components/brackets/bracket-view";
import {
  CORNER_FILL,
  CornerBadge,
  activeCorner,
  cornerName,
} from "@/components/brackets/corner-badge";
import { useAuth } from "@/hooks/use-auth";
import { useMyPlayer } from "@/hooks/use-my-player";
import { useNow } from "@/hooks/use-now";
import { cn } from "@/lib/utils";
import { useLangStore } from "@/lib/i18n/store";
import { BRACKET_STRINGS, type BracketStrings } from "@/lib/i18n/bracket-strings";
import { getMyAcademies } from "@/lib/coach/api";
import { fetchBrackets, fetchMatches } from "@/lib/brackets/api";
import { fetchResultsAccess } from "@/lib/people/api";
import type { BracketPlayer, MatchListItem, MatchStatus } from "@/types/bracket";

type StatusFilter = "ACTIVE" | "WAITING" | "DONE" | "ALL";

const POLL_MS = 8000;

/** Live first, then up next, then waiting, then finished (most recent first). */
const PRIORITY: Record<MatchStatus, number> = {
  IN_PROGRESS: 0,
  READY: 1,
  PENDING: 2,
  COMPLETED: 3,
};

const STATUS_MATCHERS: Record<StatusFilter, (s: MatchStatus) => boolean> = {
  ACTIVE: (s) => s === "IN_PROGRESS" || s === "READY",
  WAITING: (s) => s === "PENDING",
  DONE: (s) => s === "COMPLETED",
  ALL: () => true,
};

function involves(m: MatchListItem, viewer: ViewerIdentity): boolean {
  return [m.player1, m.player2].some(
    (p) =>
      !!p &&
      (p.playerId === viewer.playerId ||
        (p.academyId != null && viewer.academyIds.has(p.academyId))),
  );
}

export default function MatchesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = use(params);
  const tournamentId = Number(idStr);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { lang } = useLangStore();
  const t = BRACKET_STRINGS[lang];
  const now = useNow(1000);

  const isCoach = user?.roles.includes("ROLE_COACH") ?? false;
  // Admins, and the officials chosen for this tournament, may enter results; the server decides.
  const accessQ = useQuery({
    queryKey: ["tournaments", "detail", tournamentId, "results-access"],
    queryFn: () => fetchResultsAccess(tournamentId),
    enabled: Number.isFinite(tournamentId),
    staleTime: 60 * 1000,
  });
  const canEnterResults = accessQ.data?.canEnterResults ?? false;

  const [classId, setClassId] = useState("");
  const [court, setCourt] = useState("");
  // null = not chosen yet; a player then starts on their own matches (all of them)
  const [statusChoice, setStatusChoice] = useState<StatusFilter | null>(null);
  const [search, setSearch] = useState("");
  const [mineChoice, setMineChoice] = useState<boolean | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const bracketsQ = useQuery({
    queryKey: ["brackets", "list", tournamentId],
    queryFn: () => fetchBrackets(tournamentId),
    enabled: Number.isFinite(tournamentId),
  });
  const matchesQ = useQuery({
    queryKey: ["matches", tournamentId, classId],
    queryFn: () => fetchMatches(tournamentId, classId ? Number(classId) : undefined),
    enabled: Number.isFinite(tournamentId),
    // A match list is for use during play, so it keeps itself current. Unchanged
    // answers come back as tiny 304s, and polling pauses in a hidden tab.
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: (query) => {
      const data = query.state.data;
      return data && data.length > 0 && data.every((m) => m.status === "COMPLETED") ? false : POLL_MS;
    },
    refetchIntervalInBackground: false,
    retry: (count, err) => !(isAxiosError(err) && err.response?.status === 429) && count < 1,
  });
  const myPlayerQ = useMyPlayer();
  const academiesQ = useQuery({
    queryKey: ["coach", "me", "academies"],
    queryFn: getMyAcademies,
    enabled: isCoach,
  });

  const published = useMemo(
    () => (bracketsQ.data ?? []).filter((b) => b.status === "PUBLISHED"),
    [bracketsQ.data],
  );
  const courts = useMemo(
    () => [...new Set(published.map((b) => b.court).filter((c): c is string => !!c))].sort(),
    [published],
  );

  const myPlayerId = myPlayerQ.data?.playerId ?? null;
  const viewer = useMemo<ViewerIdentity>(
    () => ({
      playerId: myPlayerId,
      academyIds: new Set((academiesQ.data ?? []).map((a) => a.academyId)),
    }),
    [myPlayerId, academiesQ.data],
  );
  const canFilterMine = viewer.playerId != null || viewer.academyIds.size > 0;
  const autoMine = !canEnterResults && viewer.playerId != null;
  const mineOnly = mineChoice ?? autoMine;
  const status: StatusFilter = statusChoice ?? (mineOnly ? "ALL" : "ACTIVE");
  const setStatus = setStatusChoice;
  const setMineOnly = (next: boolean) => setMineChoice(next);

  const all = useMemo(() => matchesQ.data ?? [], [matchesQ.data]);

  // Everything except the status filter, so the status chips can show how many each would hold.
  const base = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all.filter((m) => {
      if (court && m.court !== court) return false;
      if (mineOnly && !involves(m, viewer)) return false;
      if (!q) return true;
      return [m.player1, m.player2].some(
        (p) => !!p && (p.name.toLowerCase().includes(q) || (p.academyName ?? "").toLowerCase().includes(q)),
      );
    });
  }, [all, court, mineOnly, search, viewer]);

  const counts = useMemo(
    () => ({
      ACTIVE: base.filter((m) => STATUS_MATCHERS.ACTIVE(m.status)).length,
      WAITING: base.filter((m) => STATUS_MATCHERS.WAITING(m.status)).length,
      DONE: base.filter((m) => STATUS_MATCHERS.DONE(m.status)).length,
      ALL: base.length,
    }),
    [base],
  );

  const visible = useMemo(() => {
    return base
      .map((m, index) => ({ m, index }))
      .filter(({ m }) => STATUS_MATCHERS[status](m.status))
      .sort((a, b) => {
        const byStatus = PRIORITY[a.m.status] - PRIORITY[b.m.status];
        if (byStatus !== 0) return byStatus;
        if (a.m.status === "COMPLETED") {
          return (b.m.decidedAt ?? "").localeCompare(a.m.decidedAt ?? "") || a.index - b.index;
        }
        return a.index - b.index; // server order: class, then round, then position
      })
      .map(({ m }) => m);
  }, [base, status]);

  // The viewer's own match that is on now or next, so they know what to wear.
  const myNext = useMemo(() => {
    if (myPlayerId == null) return null;
    const mine = all.filter(
      (m) =>
        (m.status === "IN_PROGRESS" || m.status === "READY") &&
        (m.player1?.playerId === myPlayerId || m.player2?.playerId === myPlayerId),
    );
    return mine.find((m) => m.status === "IN_PROGRESS") ?? mine[0] ?? null;
  }, [all, myPlayerId]);

  if (!user) return null;

  const selected = all.find((m) => m.matchId === selectedId) ?? null;
  const secondsAgo = Math.max(0, Math.round((now - matchesQ.dataUpdatedAt) / 1000));
  const noPublished = !bracketsQ.isLoading && published.length === 0;

  return (
    <>
      <TopNav user={user} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-6">
        <PageHeader
          title={t.matches}
          subtitle={t.matchesSub}
          back={{
            label: t.backToTournament,
            onClick: () => router.push(`/tournaments/${tournamentId}`),
          }}
        />

        {myNext && myPlayerId != null && <YourNextMatch match={myNext} playerId={myPlayerId} t={t} />}

        {/* Filters */}
        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select value={classId} onChange={(e) => setClassId(e.target.value)} aria-label={t.filterClass} className="min-h-[44px]">
              <option value="">{t.allClasses}</option>
              {published.map((b) => (
                <option key={b.categoryId} value={b.categoryId}>
                  {b.categoryName}
                </option>
              ))}
            </Select>
            {courts.length > 0 && (
              <Select value={court} onChange={(e) => setCourt(e.target.value)} aria-label={t.filterCourt} className="min-h-[44px]">
                <option value="">{t.allCourts}</option>
                {courts.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto -mx-1 px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {(["ACTIVE", "WAITING", "DONE", "ALL"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setStatus(key)}
                aria-pressed={status === key}
                className={cn(
                  "shrink-0 min-h-[40px] rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors",
                  status === key
                    ? "border-flag bg-flag/15 text-white"
                    : "border-ink-600 text-slate-400 hover:text-white",
                )}
              >
                {t[`show${key === "ACTIVE" ? "Active" : key === "WAITING" ? "Waiting" : key === "DONE" ? "Done" : "All"}` as const]}
                <span className="ms-1.5 text-xs tabular-nums opacity-70">{counts[key]}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <span className="pointer-events-none absolute top-1/2 -translate-y-1/2 ltr:left-3 rtl:right-3 text-slate-400">
                <Search size={16} />
              </span>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.searchMatches}
                aria-label={t.searchMatches}
                className="ltr:pl-10 rtl:pr-10 min-h-[44px]"
              />
            </div>
            {canFilterMine && (
              <button
                type="button"
                onClick={() => setMineOnly(!mineOnly)}
                aria-pressed={mineOnly}
                className={cn(
                  "min-h-[44px] rounded-lg border px-4 text-sm font-medium transition-colors",
                  mineOnly
                    ? "border-flag bg-flag/15 text-white"
                    : "border-ink-600 text-slate-300 hover:text-white",
                )}
              >
                {t.onlyMine}
              </button>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
            <span>{canEnterResults ? t.tapToEnter : canFilterMine ? t.legend : ""}</span>
            {matchesQ.data && <span>{t.updated(secondsAgo)}</span>}
          </div>
        </div>

        {matchesQ.isLoading && (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} width="100%" height={116} className="rounded-xl" />
            ))}
          </div>
        )}

        {matchesQ.isError && (
          <ErrorState message={t.loadFailed} retryLabel={t.retry} onRetry={() => matchesQ.refetch()} />
        )}

        {noPublished && !matchesQ.isLoading && (
          <EmptyState icon={Swords} title={t.noMatchesYet} />
        )}

        {!noPublished && !matchesQ.isLoading && !matchesQ.isError && visible.length === 0 && (
          <div className="rounded-xl border border-ink-600/70 bg-ink-700 p-8 text-center">
            <p className="text-sm text-slate-400">
              {status === "ACTIVE" && counts.ALL > 0 ? t.nothingActive : t.noMatches}
            </p>
            {status !== "ALL" && counts.ALL > 0 && (
              <button
                type="button"
                onClick={() => setStatus("ALL")}
                className="mt-3 min-h-[40px] text-sm font-medium text-flag hover:text-flag-hover"
              >
                {t.showEverything}
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {visible.map((m) => (
            <MatchRow
              key={m.matchId}
              match={m}
              t={t}
              viewer={viewer}
              tournamentId={tournamentId}
              onOpen={canEnterResults && m.player1 && m.player2 ? () => setSelectedId(m.matchId) : undefined}
            />
          ))}
        </div>
      </main>

      {selected && (
        <MatchDialog
          match={selected}
          t={t}
          onClose={() => setSelectedId(null)}
          onChanged={() => {
            queryClient.invalidateQueries({ queryKey: ["matches", tournamentId] });
            queryClient.invalidateQueries({ queryKey: ["brackets"] });
          }}
        />
      )}
    </>
  );
}

/** Tells a player which color to wear in the match they are about to fight (or are fighting). */
function YourNextMatch({
  match,
  playerId,
  t,
}: {
  match: MatchListItem;
  playerId: number;
  t: BracketStrings;
}) {
  const side = match.player1?.playerId === playerId ? 1 : 2;
  const corner = activeCorner(match, side);
  if (!corner) return null;
  const opponent = side === 1 ? match.player2 : match.player1;
  const live = match.status === "IN_PROGRESS";
  const details = [match.matchNumber ? t.matchLabel(match.matchNumber) : null, match.categoryName, match.court]
    .filter(Boolean)
    .join(" · ");

  return (
    <section
      aria-label={t.yourNextMatch}
      className="mb-4 flex items-center gap-4 rounded-xl border border-ink-600/70 bg-ink-700 p-3.5"
    >
      <div className={cn("shrink-0 min-w-[84px] rounded-lg px-4 py-2.5 text-center", CORNER_FILL[corner])}>
        <div className="text-[10px] uppercase tracking-[0.14em] opacity-90">{t.yourColor}</div>
        <div className="text-xl font-bold uppercase leading-tight">{cornerName(corner, t)}</div>
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
          {live ? t.nowPlaying : t.yourNextMatch}
        </div>
        {opponent && <div className="text-sm font-semibold text-white truncate">{t.versus(opponent.name)}</div>}
        <div className="text-xs text-slate-400 truncate">{details}</div>
      </div>
    </section>
  );
}

function MatchRow({
  match,
  t,
  viewer,
  tournamentId,
  onOpen,
}: {
  match: MatchListItem;
  t: BracketStrings;
  viewer: ViewerIdentity;
  tournamentId: number;
  onOpen?: () => void;
}) {
  const live = match.status === "IN_PROGRESS";
  const next = match.status === "READY";
  const done = match.status === "COMPLETED";

  return (
    <div
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (onOpen && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onOpen();
        }
      }}
      className={cn(
        "rounded-xl border bg-ink-700 p-3.5 text-start",
        live ? "border-flag ring-1 ring-flag/40" : next ? "border-sky-500/40" : "border-ink-600/70",
        onOpen && "cursor-pointer hover:border-flag/60 transition-colors",
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="min-w-0 text-[11px] text-slate-400 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          {match.matchNumber && (
            <span className="font-semibold text-slate-100">{t.matchLabel(match.matchNumber)}</span>
          )}
          <span>· {match.categoryName}</span>
          <span>· {roundTitle(match.roundNumber, match.totalRounds, t)}</span>
          {match.court && <span>· {match.court}</span>}
        </div>
        <span
          className={cn(
            "shrink-0 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] border",
            live && "border-flag/50 text-flag",
            next && "border-sky-500/40 text-sky-300",
            done && "border-emerald-500/30 text-emerald-300",
            !live && !next && !done && "border-ink-600 text-slate-500",
          )}
        >
          {live && <span className="w-1.5 h-1.5 rounded-full bg-flag animate-pulse" aria-hidden="true" />}
          {live ? t.live : next ? t.next : done ? t.done : t.waiting}
        </span>
      </div>

      <PlayerLine player={match.player1} side={1} score={match.player1Score} match={match} viewer={viewer} t={t} />
      <div className="h-px bg-ink-600/50 my-1" />
      <PlayerLine player={match.player2} side={2} score={match.player2Score} match={match} viewer={viewer} t={t} />

      <div className="mt-2.5 flex justify-end">
        <Link
          href={`/tournaments/${tournamentId}/brackets/${match.bracketId}`}
          onClick={(e) => e.stopPropagation()}
          className="min-h-[32px] inline-flex items-center text-xs font-medium text-flag hover:text-flag-hover"
        >
          {t.bracketLink}
        </Link>
      </div>
    </div>
  );
}

function PlayerLine({
  player,
  side,
  score,
  match,
  viewer,
  t,
}: {
  player: BracketPlayer | null;
  side: 1 | 2;
  score: number | null;
  match: MatchListItem;
  viewer: ViewerIdentity;
  t: BracketStrings;
}) {
  const corner = player ? activeCorner(match, side) : null;
  const won = !!player && match.winnerId === player.playerId;
  const lost = match.status === "COMPLETED" && !!player && !won;
  const mine = !!player && viewer.playerId === player.playerId;
  const myAcademy = !mine && !!player && player.academyId != null && viewer.academyIds.has(player.academyId);

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-1.5 min-h-[44px]",
        won && "bg-emerald-500/10",
        lost && "opacity-50",
        mine && "bg-flag/10 ring-1 ring-inset ring-flag/60",
        myAcademy && "border-s-2 border-flag/50",
      )}
    >
      <div className="min-w-0 flex-1">
        {player ? (
          <>
            <div className={cn("text-sm truncate", won ? "text-white font-semibold" : "text-slate-100")}>
              <PlayerLink playerId={player.playerId}>{player.name}</PlayerLink>
              {mine && (
                <span className="ms-1.5 text-[9px] uppercase tracking-[0.12em] text-flag font-semibold">{t.you}</span>
              )}
            </div>
            {player.academyName && (
              <div className="text-[11px] text-slate-500 truncate">{player.academyName}</div>
            )}
          </>
        ) : (
          <span className="text-xs italic text-slate-500">{t.tbd}</span>
        )}
      </div>
      {corner && <CornerBadge corner={corner} t={t} className="text-[11px]" />}
      {match.status === "COMPLETED" && score != null && (
        <span className="text-sm font-semibold tabular-nums text-slate-200">{score}</span>
      )}
      {won && (
        <span className="text-emerald-400 shrink-0" aria-label="winner">
          <Check size={16} />
        </span>
      )}
    </div>
  );
}
