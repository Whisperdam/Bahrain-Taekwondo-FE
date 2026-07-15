"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, Medal } from "lucide-react";
import { TopNav } from "@/components/dashboard/top-nav";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { ErrorState } from "@/components/ui/error-state";
import { useAuth } from "@/hooks/use-auth";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useLangStore } from "@/lib/i18n/store";
import { BROWSE_STRINGS } from "@/lib/i18n/browse-strings";
import { listRankings } from "@/lib/dashboard/api";
import type { NationalRankingDTO } from "@/types/dashboard";

const PAGE_SIZE = 15;
const DEFAULT_SEASON = "2026";

const SORTS = [
  { value: "rankPosition,asc", labelKey: "sortRankAsc" },
  { value: "totalPoints,desc", labelKey: "sortPointsDesc" },
] as const;

export default function RankingsBrowsePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { lang } = useLangStore();
  const t = BROWSE_STRINGS[lang];

  const [season, setSeason] = useState(DEFAULT_SEASON);
  const [q, setQ] = useState("");
  const [gender, setGender] = useState<"" | "MALE" | "FEMALE">("");
  const [sort, setSort] = useState<string>("rankPosition,asc");
  const [page, setPage] = useState(0);

  const debouncedQ = useDebouncedValue(q, 300);
  const debouncedSeason = useDebouncedValue(season, 300);

  const listQ = useQuery({
    queryKey: ["rankings", "browse", { season: debouncedSeason, q: debouncedQ, gender, sort, page }],
    queryFn: () =>
      listRankings({
        season: debouncedSeason || undefined,
        q: debouncedQ || undefined,
        gender: gender || undefined,
        sort,
        page,
        size: PAGE_SIZE,
      }),
  });

  if (!user) return null;

  const rows = listQ.data?.content ?? [];
  const totalElements = listQ.data?.totalElements ?? 0;
  const totalPages = listQ.data?.totalPages ?? 1;

  return (
    <>
      <TopNav user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-6">
        <PageHeader
          title={t.rankingsTitle}
          subtitle={t.rankingsSub}
          back={{ label: t.backToDashboard, onClick: () => router.push("/dashboard") }}
        />

        {/* Filters bar */}
        <div className="bg-ink-700 border border-ink-600/70 rounded-xl p-4 mb-5 grid grid-cols-1 md:grid-cols-[1fr_140px_150px_220px_auto] gap-3 items-end">
          <Field id="q" label={t.search}>
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 -translate-y-1/2 ltr:left-3 rtl:right-3 text-slate-400">
                <Search size={16} />
              </span>
              <Input
                id="q"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(0);
                }}
                placeholder={t.rankingsSearchPh}
                className="ltr:pl-10 rtl:pr-10"
              />
            </div>
          </Field>
          <Field id="season" label={t.season}>
            <Input
              id="season"
              value={season}
              onChange={(e) => {
                setSeason(e.target.value);
                setPage(0);
              }}
              placeholder={DEFAULT_SEASON}
            />
          </Field>
          <Field id="gender" label={t.gender}>
            <Select
              id="gender"
              value={gender}
              onChange={(e) => {
                setGender(e.target.value as "" | "MALE" | "FEMALE");
                setPage(0);
              }}
            >
              <option value="">{t.genderAll}</option>
              <option value="MALE">{t.genderMALE}</option>
              <option value="FEMALE">{t.genderFEMALE}</option>
            </Select>
          </Field>
          <Field id="sort" label={t.sortBy}>
            <Select
              id="sort"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(0);
              }}
            >
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
              setSeason(DEFAULT_SEASON);
              setGender("");
              setPage(0);
            }}
            disabled={!q && !gender && season === DEFAULT_SEASON}
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
                <Medal size={22} />
              </div>
              <p className="text-sm text-slate-400">{t.rankingsEmpty}</p>
            </div>
          )}

          {!listQ.isLoading && !listQ.isError && rows.length > 0 && (
            <>
              <div className="hidden md:grid grid-cols-[56px_2fr_1.6fr_1.2fr_90px_130px_90px] px-5 py-2.5 text-[10px] uppercase tracking-[0.16em] text-slate-500 border-b border-ink-600/60 font-medium">
                <div>{t.colRank}</div>
                <div>{t.colPlayer}</div>
                <div>{t.colAcademy}</div>
                <div>{t.colCategory}</div>
                <div>{t.colPoints}</div>
                <div>{t.colMedals}</div>
                <div>{t.colEvents}</div>
              </div>
              {rows.map((row) => (
                <RankingRow key={row.rankingId} row={row} />
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

function RankingRow({ row }: { row: NationalRankingDTO }) {
  const initials =
    `${row.playerFirstName?.[0] ?? ""}${row.playerLastName?.[0] ?? ""}`.toUpperCase();
  return (
    <div className="grid grid-cols-[56px_1fr] md:grid-cols-[56px_2fr_1.6fr_1.2fr_90px_130px_90px] gap-3 items-center px-5 py-3 text-sm border-t border-ink-600/60 first:border-0 hover:bg-ink-600/30 transition-colors">
      <div className="text-white font-semibold tabular-nums">
        {row.rankPosition ?? "—"}
      </div>
      <div className="flex items-center gap-3 min-w-0">
        <Avatar initials={initials} size={32} />
        <div className="min-w-0">
          <div className="text-white font-medium truncate">
            {row.playerFirstName} {row.playerLastName}
          </div>
          <div className="text-xs text-slate-500 md:hidden truncate">
            {row.academyName}
          </div>
        </div>
      </div>
      <div className="hidden md:block text-slate-300 text-xs truncate">
        {row.academyName ?? "—"}
      </div>
      <div className="hidden md:block text-slate-300 text-xs truncate">
        {row.categoryName ?? "—"}
      </div>
      <div className="hidden md:block text-white font-semibold tabular-nums">
        {row.totalPoints}
      </div>
      <div className="hidden md:flex items-center gap-2 text-xs tabular-nums">
        <span className="text-amber-300">{row.goldMedals}</span>
        <span className="text-slate-600">/</span>
        <span className="text-slate-300">{row.silverMedals}</span>
        <span className="text-slate-600">/</span>
        <span className="text-orange-400">{row.bronzeMedals}</span>
      </div>
      <div className="hidden md:block text-slate-400 text-xs tabular-nums">
        {row.tournamentsParticipated}
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="grid grid-cols-[56px_1fr] md:grid-cols-[56px_2fr_1.6fr_1.2fr_90px_130px_90px] gap-3 items-center px-5 py-3 border-t border-ink-600/60 first:border-0"
        >
          <Skeleton width={24} height={16} />
          <div className="flex items-center gap-3">
            <Skeleton width={32} height={32} className="rounded-full" />
            <Skeleton width={130} height={16} />
          </div>
          <Skeleton width={110} height={13} className="hidden md:block" />
          <Skeleton width={80} height={13} className="hidden md:block" />
          <Skeleton width={40} height={16} className="hidden md:block" />
          <Skeleton width={70} height={13} className="hidden md:block" />
          <Skeleton width={30} height={13} className="hidden md:block" />
        </div>
      ))}
    </>
  );
}
