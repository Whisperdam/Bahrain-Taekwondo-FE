"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Search, Trophy } from "lucide-react";
import { TopNav } from "@/components/dashboard/top-nav";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ErrorState } from "@/components/ui/error-state";
import { useAuth } from "@/hooks/use-auth";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useLangStore } from "@/lib/i18n/store";
import { BROWSE_STRINGS } from "@/lib/i18n/browse-strings";
import { listTournaments } from "@/lib/dashboard/api";
import type { TournamentDTO } from "@/types/dashboard";

const PAGE_SIZE = 10;

type StatusTab = "" | "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";

const STATUS_STYLES: Record<string, string> = {
  UPCOMING: "bg-sky-500/10 text-sky-300 border-sky-500/30",
  ONGOING: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  COMPLETED: "bg-slate-500/10 text-slate-300 border-slate-500/30",
  CANCELLED: "bg-red-500/10 text-red-300 border-red-500/30",
};

const TYPE_STYLES: Record<string, string> = {
  NATIONAL: "bg-flag/15 text-flag border-flag/40",
  INTERNATIONAL: "bg-amber-500/10 text-amber-300 border-amber-500/40",
  REGIONAL: "bg-sky-500/10 text-sky-300 border-sky-500/40",
};

const SORTS = [
  { value: "startDate,asc", labelKey: "sortStartAsc" },
  { value: "startDate,desc", labelKey: "sortStartDesc" },
  { value: "tournamentName,asc", labelKey: "sortNameAsc" },
  { value: "tournamentName,desc", labelKey: "sortNameDesc" },
] as const;

export default function TournamentsBrowsePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { lang } = useLangStore();
  const t = BROWSE_STRINGS[lang];

  const [status, setStatus] = useState<StatusTab>("");
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState<string>("startDate,asc");
  const [page, setPage] = useState(0);

  const debouncedQ = useDebouncedValue(q, 300);

  function withReset<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setPage(0);
    };
  }

  const listQ = useQuery({
    queryKey: ["tournaments", "browse", { status, q: debouncedQ, from, to, sort, page }],
    queryFn: () =>
      listTournaments({
        status: status || undefined,
        q: debouncedQ || undefined,
        from: from || undefined,
        to: to || undefined,
        sort,
        page,
        size: PAGE_SIZE,
      }),
  });

  if (!user) return null;

  const rows = listQ.data?.content ?? [];
  const totalElements = listQ.data?.totalElements ?? 0;
  const totalPages = listQ.data?.totalPages ?? 1;
  const hasFilter = !!q || !!from || !!to || !!status;

  return (
    <>
      <TopNav user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-6">
        <PageHeader
          title={t.tournamentsTitle}
          subtitle={t.tournamentsSub}
          back={{ label: t.backToDashboard, onClick: () => router.push("/dashboard") }}
        />

        <Tabs<StatusTab>
          items={[
            { value: "", label: t.statusAll },
            { value: "UPCOMING", label: t.statusUPCOMING },
            { value: "ONGOING", label: t.statusONGOING },
            { value: "COMPLETED", label: t.statusCOMPLETED },
            { value: "CANCELLED", label: t.statusCANCELLED },
          ]}
          active={status}
          onChange={withReset(setStatus)}
        />

        {/* Filters bar */}
        <div className="mt-5 bg-ink-700 border border-ink-600/70 rounded-xl p-4 mb-5 grid grid-cols-1 md:grid-cols-[1fr_160px_160px_220px_auto] gap-3 items-end">
          <Field id="q" label={t.search}>
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 -translate-y-1/2 ltr:left-3 rtl:right-3 text-slate-400">
                <Search size={16} />
              </span>
              <Input
                id="q"
                value={q}
                onChange={(e) => withReset(setQ)(e.target.value)}
                placeholder={t.tournamentsSearchPh}
                className="ltr:pl-10 rtl:pr-10"
              />
            </div>
          </Field>
          <Field id="from" label={t.fromDate}>
            <Input
              id="from"
              type="date"
              value={from}
              onChange={(e) => withReset(setFrom)(e.target.value)}
            />
          </Field>
          <Field id="to" label={t.toDate}>
            <Input
              id="to"
              type="date"
              value={to}
              onChange={(e) => withReset(setTo)(e.target.value)}
            />
          </Field>
          <Field id="sort" label={t.sortBy}>
            <Select id="sort" value={sort} onChange={(e) => withReset(setSort)(e.target.value)}>
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {t[s.labelKey]}
                </option>
              ))}
            </Select>
          </Field>
          <button
            type="button"
            onClick={() => {
              setQ("");
              setFrom("");
              setTo("");
              setStatus("");
              setPage(0);
            }}
            disabled={!hasFilter}
            className="text-sm text-slate-300 hover:text-flag px-3 py-2.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-slate-300 transition-colors"
          >
            {t.clearFilters}
          </button>
        </div>

        <div className="bg-ink-700 border border-ink-600/70 rounded-xl overflow-hidden">
          {listQ.isLoading && <TableSkeleton />}

          {listQ.isError && (
            <ErrorState
              message={t.loadFailed}
              retryLabel={t.retry}
              onRetry={() => listQ.refetch()}
            />
          )}

          {!listQ.isLoading && !listQ.isError && rows.length === 0 && (
            <div className="p-12 text-center">
              <div className="inline-flex w-12 h-12 rounded-full bg-ink-800 border border-ink-600 text-slate-400 items-center justify-center mb-3">
                <Trophy size={22} />
              </div>
              <p className="text-sm text-slate-400">{t.tournamentsEmpty}</p>
            </div>
          )}

          {!listQ.isLoading && !listQ.isError && rows.length > 0 && (
            <>
              <div className="hidden md:grid grid-cols-[2.2fr_1fr_1.6fr_1.4fr_110px] px-5 py-2.5 text-[10px] uppercase tracking-[0.16em] text-slate-500 border-b border-ink-600/60 font-medium">
                <div>{t.colTournament}</div>
                <div>{t.colType}</div>
                <div>{t.colVenue}</div>
                <div>{t.colDates}</div>
                <div>{t.colStatus}</div>
              </div>
              {rows.map((row) => (
                <TournamentRow key={row.tournamentId} row={row} t={t} />
              ))}
            </>
          )}
        </div>

        {totalElements > 0 && !listQ.isError && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={setPage}
            showingText={t.showing(
              page * PAGE_SIZE + 1,
              page * PAGE_SIZE + rows.length,
              totalElements,
            )}
            pageOfText={`${t.page} ${page + 1} ${t.of} ${totalPages}`}
          />
        )}
      </main>
    </>
  );
}

function TournamentRow({
  row,
  t,
}: {
  row: TournamentDTO;
  t: (typeof BROWSE_STRINGS)[keyof typeof BROWSE_STRINGS];
}) {
  const dates = `${format(new Date(row.startDate), "PP")} – ${format(new Date(row.endDate), "PP")}`;
  return (
    <div className="grid grid-cols-1 md:grid-cols-[2.2fr_1fr_1.6fr_1.4fr_110px] gap-1.5 md:gap-3 md:items-center px-5 py-3.5 text-sm border-t border-ink-600/60 first:border-0 hover:bg-ink-600/30 transition-colors">
      <div className="text-white font-medium">{row.tournamentName}</div>
      <div>
        {row.tournamentType && (
          <span
            className={`inline-flex items-center text-[10px] uppercase tracking-[0.14em] font-medium border rounded px-1.5 py-0.5 ${TYPE_STYLES[row.tournamentType] ?? TYPE_STYLES.NATIONAL}`}
          >
            {t[`type${row.tournamentType}` as keyof typeof t] as string}
          </span>
        )}
      </div>
      <div className="text-slate-300 text-xs truncate">{row.venue ?? "—"}</div>
      <div className="text-slate-400 text-xs tabular-nums">{dates}</div>
      <div>
        <span
          className={`inline-flex items-center text-[10px] uppercase tracking-[0.14em] font-medium border rounded px-1.5 py-0.5 ${STATUS_STYLES[row.status] ?? STATUS_STYLES.UPCOMING}`}
        >
          {(t[`status${row.status}` as keyof typeof t] as string) ?? row.status}
        </span>
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="grid grid-cols-[1fr] md:grid-cols-[2.2fr_1fr_1.6fr_1.4fr_110px] gap-3 items-center px-5 py-3.5 border-t border-ink-600/60 first:border-0"
        >
          <Skeleton width="70%" height={16} />
          <Skeleton width={70} height={18} className="hidden md:block" />
          <Skeleton width={120} height={13} className="hidden md:block" />
          <Skeleton width={140} height={13} className="hidden md:block" />
          <Skeleton width={70} height={18} className="hidden md:block" />
        </div>
      ))}
    </>
  );
}

