"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { Settings2, Swords } from "lucide-react";
import { TopNav } from "@/components/dashboard/top-nav";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { Skeleton } from "@/components/ui/skeleton";
import { BracketView } from "@/components/brackets/bracket-view";
import { LiveStrip, Podium } from "@/components/brackets/bracket-extras";
import { MatchDialog } from "@/components/brackets/match-dialog";
import { useAuth } from "@/hooks/use-auth";
import { useMyPlayer } from "@/hooks/use-my-player";
import { useNow } from "@/hooks/use-now";
import { useLangStore } from "@/lib/i18n/store";
import { BRACKET_STRINGS } from "@/lib/i18n/bracket-strings";
import { getMyAcademies } from "@/lib/coach/api";
import { getApiErrorMessage } from "@/lib/api/errors";
import { fetchBracket, swapSlots } from "@/lib/brackets/api";
import { fetchResultsAccess } from "@/lib/people/api";

const POLL_MS = 8000;

export default function BracketPage({
  params,
}: {
  params: Promise<{ id: string; bracketId: string }>;
}) {
  const { id: idStr, bracketId: bracketStr } = use(params);
  const tournamentId = Number(idStr);
  const bracketId = Number(bracketStr);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { lang } = useLangStore();
  const t = BRACKET_STRINGS[lang];
  const now = useNow(1000);

  const isAdmin = user?.roles.includes("ROLE_ADMIN") ?? false;
  const isCoach = user?.roles.includes("ROLE_COACH") ?? false;
  // Admins, and the officials chosen for this tournament, may enter results; the server decides.
  const accessQ = useQuery({
    queryKey: ["tournaments", "detail", tournamentId, "results-access"],
    queryFn: () => fetchResultsAccess(tournamentId),
    enabled: Number.isFinite(tournamentId),
    staleTime: 60 * 1000,
  });
  const canEnterResults = accessQ.data?.canEnterResults ?? false;

  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  const bracketQ = useQuery({
    queryKey: ["brackets", "detail", bracketId],
    queryFn: () => fetchBracket(tournamentId, bracketId),
    enabled: Number.isFinite(tournamentId) && Number.isFinite(bracketId),
    // Live: re-ask every few seconds until the bracket is complete. While nothing
    // changes the server answers with a tiny 304, and polling pauses in a hidden tab.
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: (query) => (query.state.data?.summary.complete ? false : POLL_MS),
    refetchIntervalInBackground: false,
    retry: (count, err) =>
      !(isAxiosError(err) && [404, 429].includes(err.response?.status ?? 0)) && count < 1,
  });

  const myPlayerQ = useMyPlayer();
  const academiesQ = useQuery({
    queryKey: ["coach", "me", "academies"],
    queryFn: getMyAcademies,
    enabled: isCoach,
  });

  const swapMutation = useMutation({
    mutationFn: ({ a, b }: { a: number; b: number }) => swapSlots(bracketId, a, b),
    onSuccess: () => {
      toast.success(t.swapDone);
      setSelectedSlot(null);
      queryClient.invalidateQueries({ queryKey: ["brackets"] });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, t.actionFailed));
      setSelectedSlot(null);
    },
  });

  if (!user) return null;

  const bracket = bracketQ.data;
  const summary = bracket?.summary;
  const notFound =
    !Number.isFinite(bracketId) ||
    (bracketQ.isError &&
      isAxiosError(bracketQ.error) &&
      bracketQ.error.response?.status === 404);

  const viewer = {
    playerId: myPlayerQ.data?.playerId ?? null,
    academyIds: new Set((academiesQ.data ?? []).map((a) => a.academyId)),
  };
  const isDraft = summary?.status === "DRAFT";
  const selectedMatch = bracket?.matches.find((m) => m.matchId === selectedMatchId) ?? null;
  const secondsAgo = Math.max(0, Math.round((now - bracketQ.dataUpdatedAt) / 1000));
  const showLive = !!summary && summary.status === "PUBLISHED" && !summary.complete;

  const subtitle = summary
    ? [
        t[`gender${summary.categoryGender}` as const],
        t.playersCount(summary.playerCount),
        summary.court ? `${t.court}: ${summary.court}` : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : undefined;

  return (
    <>
      <TopNav user={user} />
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-6">
        <PageHeader
          title={summary?.categoryName ?? t.brackets}
          subtitle={subtitle}
          back={{
            label: t.backToTournament,
            onClick: () => router.push(`/tournaments/${tournamentId}`),
          }}
          action={
            isAdmin ? (
              <SecondaryButton
                onClick={() => router.push(`/admin/tournaments/${tournamentId}/brackets`)}
              >
                <Settings2 size={14} />
                {t.manageBrackets}
              </SecondaryButton>
            ) : undefined
          }
        />

        {bracketQ.isLoading && (
          <div className="space-y-4">
            <Skeleton width="100%" height={80} />
            <Skeleton width="100%" height={320} />
          </div>
        )}

        {notFound && (
          <EmptyState
            icon={Swords}
            title={t.bracketNotFound}
            body={t.bracketNotFoundBody}
            action={
              <PrimaryButton
                type="button"
                className="w-auto px-5"
                onClick={() => router.push(`/tournaments/${tournamentId}`)}
              >
                {t.backToTournament}
              </PrimaryButton>
            }
          />
        )}

        {bracketQ.isError && !notFound && (
          <ErrorState
            message={t.loadFailed}
            retryLabel={t.retry}
            onRetry={() => bracketQ.refetch()}
          />
        )}

        {bracket && summary && (
          <>
            <div className="flex items-center justify-between gap-3 flex-wrap mb-4 text-xs text-slate-400">
              <div className="flex items-center gap-3 flex-wrap">
                {showLive && (
                  <span className="inline-flex items-center gap-1.5 font-semibold text-flag uppercase tracking-[0.14em]">
                    <span className="w-2 h-2 rounded-full bg-flag animate-pulse" aria-hidden="true" />
                    {t.liveNow}
                  </span>
                )}
                {summary.complete && (
                  <span className="font-semibold text-emerald-300 uppercase tracking-[0.14em]">
                    {t.complete}
                  </span>
                )}
                <span>{t.progress(summary.matchesCompleted, summary.matchesTotal)}</span>
                {showLive && <span className="text-slate-500">{t.updated(secondsAgo)}</span>}
              </div>
              {(viewer.playerId != null || viewer.academyIds.size > 0) && (
                <span className="text-slate-500">{t.legend}</span>
              )}
            </div>

            {isDraft && (
              <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100 text-pretty">
                {t.draftBanner}
                {summary.stale && <div className="mt-1 text-amber-200">{t.draftStale}</div>}
                {isAdmin && <div className="mt-1 text-amber-200/80">{t.swapHint}</div>}
              </div>
            )}

            <LiveStrip bracket={bracket} t={t} />
            <Podium bracket={bracket} t={t} />

            <BracketView
              bracket={bracket}
              t={t}
              viewer={viewer}
              onSelectMatch={canEnterResults && !isDraft ? (m) => setSelectedMatchId(m.matchId) : undefined}
              swap={
                isAdmin && isDraft
                  ? {
                      selectedSlot,
                      onPickSlot: (slot) => {
                        if (swapMutation.isPending) return;
                        if (selectedSlot == null) {
                          setSelectedSlot(slot);
                        } else if (selectedSlot === slot) {
                          setSelectedSlot(null);
                        } else {
                          swapMutation.mutate({ a: selectedSlot, b: slot });
                        }
                      },
                    }
                  : undefined
              }
            />
          </>
        )}
      </main>

      {selectedMatch && (
        <MatchDialog
          match={selectedMatch}
          t={t}
          onClose={() => setSelectedMatchId(null)}
          onChanged={() => {
            queryClient.invalidateQueries({ queryKey: ["brackets"] });
          }}
        />
      )}
    </>
  );
}
