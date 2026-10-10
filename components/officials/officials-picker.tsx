"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Search } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { ErrorBanner } from "@/components/ui/error-banner";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { OfficialMeta } from "@/components/officials/official-meta";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/api/errors";
import { addTournamentOfficials, fetchOfficials } from "@/lib/officials/api";
import type { OfficialStrings } from "@/lib/i18n/official-strings";
import type { TournamentOfficials } from "@/types/official";

interface OfficialsPickerProps {
  tournamentId: number;
  /** Used to flag certifications that will have lapsed by then. */
  tournamentStart: string;
  /** Officials already on the list, who are not offered again. */
  alreadyAdded: Set<number>;
  t: OfficialStrings;
  onClose: () => void;
  /** Called with the updated list once the officials were added. */
  onAdded: (list: TournamentOfficials) => void;
}

/** Pick any number of approved, active officials to add to a tournament. */
export function OfficialsPicker({
  tournamentId,
  tournamentStart,
  alreadyAdded,
  t,
  onClose,
  onAdded,
}: OfficialsPickerProps) {
  const [search, setSearch] = useState("");
  const [chosen, setChosen] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const officialsQ = useQuery({
    queryKey: ["officials", "directory", "active"],
    queryFn: () => fetchOfficials({ activeOnly: true }),
    staleTime: 0,
  });

  const available = useMemo(
    () => (officialsQ.data ?? []).filter((o) => !alreadyAdded.has(o.officialId)),
    [officialsQ.data, alreadyAdded],
  );
  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? available.filter((o) => o.name.toLowerCase().includes(q)) : available;
  }, [available, search]);

  const add = useMutation({
    mutationFn: () => addTournamentOfficials(tournamentId, [...chosen]),
    onSuccess: (list) => {
      toast.success(t.addedToast(chosen.size));
      onAdded(list);
    },
    onError: (err) => setError(getApiErrorMessage(err, t.actionFailed)),
  });

  function toggle(id: number) {
    setChosen((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }

  const loaded = !officialsQ.isLoading && !officialsQ.isError;
  const noOfficialsYet = loaded && (officialsQ.data ?? []).length === 0;
  const allAlreadyAdded = loaded && !noOfficialsYet && available.length === 0;

  return (
    <Modal
      open
      onClose={() => !add.isPending && onClose()}
      title={t.pickTitle}
      size="lg"
      dismissible={!add.isPending}
      footer={
        <>
          <SecondaryButton onClick={onClose} disabled={add.isPending}>
            {t.cancel}
          </SecondaryButton>
          <PrimaryButton
            type="button"
            className="w-auto px-4"
            disabled={chosen.size === 0}
            loading={add.isPending}
            loadingText={t.adding}
            onClick={() => {
              setError(null);
              add.mutate();
            }}
          >
            {t.addSelected(chosen.size)}
          </PrimaryButton>
        </>
      }
    >
      {error && <ErrorBanner>{error}</ErrorBanner>}

      {officialsQ.isLoading && (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} width="100%" height={52} className="rounded-lg" />
          ))}
        </div>
      )}
      {officialsQ.isError && (
        <ErrorState message={t.loadFailed} retryLabel={t.retry} onRetry={() => officialsQ.refetch()} />
      )}
      {noOfficialsYet && <p className="text-sm text-slate-400 text-center py-6">{t.noOfficialsYet}</p>}
      {allAlreadyAdded && <p className="text-sm text-slate-400 text-center py-6">{t.nothingToAdd}</p>}

      {available.length > 0 && (
        <>
          <div className="relative mb-3">
            <span className="pointer-events-none absolute top-1/2 -translate-y-1/2 ltr:left-3 rtl:right-3 text-slate-400">
              <Search size={16} />
            </span>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.search}
              aria-label={t.search}
              className="ltr:pl-10 rtl:pr-10 min-h-[44px]"
            />
          </div>
          <div className="max-h-[50vh] overflow-y-auto -mx-1 px-1 space-y-2">
            {shown.length === 0 && <p className="text-sm text-slate-400 text-center py-6">{t.noMatch}</p>}
            {shown.map((o) => {
              const on = chosen.has(o.officialId);
              return (
                <button
                  key={o.officialId}
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  onClick={() => toggle(o.officialId)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg border px-3.5 py-2.5 min-h-[52px] text-start transition-colors",
                    on ? "border-flag bg-flag/10" : "border-ink-600 bg-ink-800/60 hover:border-ink-500",
                  )}
                >
                  <span
                    className={cn(
                      "shrink-0 w-5 h-5 rounded border flex items-center justify-center",
                      on ? "border-flag bg-flag text-white" : "border-ink-500",
                    )}
                    aria-hidden="true"
                  >
                    {on && <Check size={14} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-white truncate">{o.name}</span>
                    <OfficialMeta
                      specialization={o.specialization}
                      level={o.certificationLevel}
                      certificationExpiry={o.certificationExpiry}
                      mustBeValidOn={tournamentStart}
                      t={t}
                    />
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </Modal>
  );
}
