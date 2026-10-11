"use client";

import { UserLink } from "@/components/shared/person-link";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { Lock, Plus, UserRound, X } from "lucide-react";
import { TopNav } from "@/components/dashboard/top-nav";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { PrimaryButton } from "@/components/ui/primary-button";
import { OfficialMeta } from "@/components/officials/official-meta";
import { OfficialsPicker } from "@/components/officials/officials-picker";
import { useAuth } from "@/hooks/use-auth";
import { useLangStore } from "@/lib/i18n/store";
import { OFFICIAL_STRINGS } from "@/lib/i18n/official-strings";
import { getApiErrorMessage } from "@/lib/api/errors";
import { fetchTournamentOfficials, removeTournamentOfficial } from "@/lib/officials/api";
import type { TournamentOfficial, TournamentOfficials } from "@/types/official";

export default function TournamentOfficialsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = use(params);
  const tournamentId = Number(idStr);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { lang } = useLangStore();
  const t = OFFICIAL_STRINGS[lang];

  const [picking, setPicking] = useState(false);
  const [removing, setRemoving] = useState<TournamentOfficial | null>(null);

  const key = ["officials", "roster", tournamentId];
  const rosterQ = useQuery({
    queryKey: key,
    queryFn: () => fetchTournamentOfficials(tournamentId),
    enabled: Number.isFinite(tournamentId),
    staleTime: 0,
  });

  function applyList(list: TournamentOfficials) {
    queryClient.setQueryData(key, list);
    // each official's tournament count and history changed too
    queryClient.invalidateQueries({ queryKey: ["officials", "directory"] });
    queryClient.invalidateQueries({ queryKey: ["officials", "history"] });
  }

  const remove = useMutation({
    mutationFn: (officialId: number) => removeTournamentOfficial(tournamentId, officialId),
    onSuccess: (list) => {
      applyList(list);
      setRemoving(null);
      toast.success(t.removedToast);
    },
    onError: (err) => {
      setRemoving(null);
      toast.error(getApiErrorMessage(err, t.actionFailed));
      // The tournament may have started meanwhile: show the list as it really is.
      if (isAxiosError(err) && err.response?.status === 422) rosterQ.refetch();
    },
  });

  if (!user) return null;

  const roster = rosterQ.data;
  const list = roster?.officials ?? [];

  return (
    <>
      <TopNav user={user} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-6">
        <PageHeader
          title={t.rosterTitle}
          subtitle={roster ? `${roster.tournamentName} — ${t.rosterSub}` : t.rosterSub}
          back={{
            label: t.backToTournaments,
            onClick: () => router.push("/admin/tournaments"),
          }}
          action={
            roster?.editable ? (
              <PrimaryButton
                type="button"
                onClick={() => setPicking(true)}
                className="!py-2 !px-3.5 text-xs w-auto"
              >
                <Plus size={14} />
                {t.addOfficials}
              </PrimaryButton>
            ) : undefined
          }
        />

        {roster && !roster.editable && (
          <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-ink-600 bg-ink-800/60 px-3.5 py-2.5 text-sm text-slate-300">
            <Lock size={16} className="mt-0.5 shrink-0 text-slate-400" />
            {t.lockedBanner}
          </div>
        )}

        {rosterQ.isLoading && (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} width="100%" height={64} className="rounded-xl" />
            ))}
          </div>
        )}

        {rosterQ.isError && (
          <div className="bg-ink-700 border border-ink-600/70 rounded-xl">
            <ErrorState message={t.loadFailed} retryLabel={t.retry} onRetry={() => rosterQ.refetch()} />
          </div>
        )}

        {roster && list.length === 0 && (
          <EmptyState
            icon={UserRound}
            title={t.emptyRoster}
            body={roster.editable ? t.emptyRosterBody : undefined}
            action={
              roster.editable ? (
                <PrimaryButton type="button" onClick={() => setPicking(true)} className="w-auto px-5">
                  <Plus size={14} />
                  {t.addOfficials}
                </PrimaryButton>
              ) : undefined
            }
          />
        )}

        {roster && list.length > 0 && (
          <>
            <div className="mb-2 text-xs text-slate-500">{t.rosterCount(list.length)}</div>
            <ul className="space-y-2">
              {list.map((o) => (
                <li
                  key={o.officialId}
                  className="flex items-center gap-3 rounded-xl border border-ink-600/70 bg-ink-700 px-4 py-3 min-h-[60px]"
                >
                  <span className="w-9 h-9 shrink-0 rounded-full bg-ink-800 border border-ink-600 text-slate-300 flex items-center justify-center">
                    <UserRound size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-white truncate">
                      <UserLink userId={o.userId}>{o.name}</UserLink>
                    </div>
                    <OfficialMeta
                      specialization={o.specialization}
                      level={o.certificationLevel}
                      certificationExpiry={o.certificationExpiry}
                      mustBeValidOn={roster.startDate}
                      active={o.active}
                      t={t}
                    />
                  </div>
                  {roster.editable && (
                    <button
                      type="button"
                      onClick={() => setRemoving(o)}
                      aria-label={`${t.remove} ${o.name}`}
                      className="shrink-0 p-2.5 rounded-md text-slate-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </main>

      {picking && roster && (
        <OfficialsPicker
          tournamentId={tournamentId}
          tournamentStart={roster.startDate}
          alreadyAdded={new Set(list.map((o) => o.officialId))}
          t={t}
          onClose={() => setPicking(false)}
          onAdded={(updated) => {
            applyList(updated);
            setPicking(false);
          }}
        />
      )}

      <ConfirmModal
        open={!!removing}
        onClose={() => !remove.isPending && setRemoving(null)}
        onConfirm={() => removing && remove.mutate(removing.officialId)}
        title={t.removeTitle}
        body={removing ? t.removeBody(removing.name) : ""}
        confirmLabel={t.remove}
        cancelLabel={t.cancel}
        loading={remove.isPending}
        danger
      />
    </>
  );
}
