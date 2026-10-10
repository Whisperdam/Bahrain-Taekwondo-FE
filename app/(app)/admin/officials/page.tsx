"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ChevronDown, UserRound } from "lucide-react";
import { TopNav } from "@/components/dashboard/top-nav";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { OfficialMeta } from "@/components/officials/official-meta";
import { useAuth } from "@/hooks/use-auth";
import { useLangStore } from "@/lib/i18n/store";
import { OFFICIAL_STRINGS, type OfficialStrings } from "@/lib/i18n/official-strings";
import { cn } from "@/lib/utils";
import { fetchOfficials, fetchOfficialTournaments } from "@/lib/officials/api";
import type { OfficialSummary } from "@/types/official";

export default function OfficialsDirectoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { lang } = useLangStore();
  const t = OFFICIAL_STRINGS[lang];

  const officialsQ = useQuery({
    queryKey: ["officials", "directory", "all"],
    queryFn: () => fetchOfficials(),
  });

  if (!user) return null;

  const list = officialsQ.data ?? [];

  return (
    <>
      <TopNav user={user} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-6">
        <PageHeader
          title={t.directoryTitle}
          subtitle={t.directorySub}
          back={{ label: t.backToAdmin, onClick: () => router.push("/admin") }}
        />

        {officialsQ.isLoading && (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} width="100%" height={64} className="rounded-xl" />
            ))}
          </div>
        )}

        {officialsQ.isError && (
          <div className="bg-ink-700 border border-ink-600/70 rounded-xl">
            <ErrorState message={t.loadFailed} retryLabel={t.retry} onRetry={() => officialsQ.refetch()} />
          </div>
        )}

        {officialsQ.isSuccess && list.length === 0 && (
          <EmptyState icon={UserRound} title={t.noOfficials} />
        )}

        {list.length > 0 && (
          <ul className="space-y-2">
            {list.map((o) => (
              <OfficialRow key={o.officialId} official={o} t={t} />
            ))}
          </ul>
        )}
      </main>
    </>
  );
}

function OfficialRow({ official, t }: { official: OfficialSummary; t: OfficialStrings }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Only fetched once the row is opened.
  const historyQ = useQuery({
    queryKey: ["officials", "history", official.officialId],
    queryFn: () => fetchOfficialTournaments(official.officialId),
    enabled: open,
    staleTime: 0,
  });

  const panelId = `official-${official.officialId}-tournaments`;

  return (
    <li className="rounded-xl border border-ink-600/70 bg-ink-700 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full flex items-center gap-3 px-4 py-3 min-h-[60px] text-start hover:bg-ink-600/30 transition-colors"
      >
        <span className="w-9 h-9 shrink-0 rounded-full bg-ink-800 border border-ink-600 text-slate-300 flex items-center justify-center">
          <UserRound size={16} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-white truncate">{official.name}</span>
          <OfficialMeta
            specialization={official.specialization}
            level={official.certificationLevel}
            certificationExpiry={official.certificationExpiry}
            active={official.active}
            t={t}
          />
        </span>
        <span className="shrink-0 text-xs text-slate-300 tabular-nums">
          {t.tournamentCount(official.tournamentCount)}
        </span>
        <ChevronDown
          size={16}
          className={cn("shrink-0 text-slate-500 transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
        <span className="sr-only">{open ? t.hideTournaments : t.showTournaments}</span>
      </button>

      {open && (
        <div id={panelId} className="border-t border-ink-600/60 px-4 py-3">
          {historyQ.isLoading && <Skeleton width="60%" height={16} />}
          {historyQ.isError && (
            <ErrorState message={t.loadFailed} retryLabel={t.retry} onRetry={() => historyQ.refetch()} />
          )}
          {historyQ.isSuccess && historyQ.data.length === 0 && (
            <p className="text-sm text-slate-500">{t.noTournaments}</p>
          )}
          {historyQ.isSuccess && historyQ.data.length > 0 && (
            <ul className="divide-y divide-ink-600/50">
              {historyQ.data.map((tour) => (
                <li key={tour.tournamentId} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-white truncate">{tour.tournamentName}</div>
                    <div className="text-xs text-slate-500 truncate">
                      {format(new Date(tour.startDate), "PP")}
                      {tour.venue ? ` · ${tour.venue}` : ""}
                    </div>
                  </div>
                  <span className="shrink-0 text-[10px] uppercase tracking-[0.14em] text-slate-400">
                    {t[`status${tour.status as "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED"}`] ?? tour.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => router.push(`/admin/tournaments/${tour.tournamentId}/officials`)}
                    className="shrink-0 min-h-[36px] text-xs font-medium text-flag hover:text-flag-hover"
                  >
                    {t.openTournament}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}
