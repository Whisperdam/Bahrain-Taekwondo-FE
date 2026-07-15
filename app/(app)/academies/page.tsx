"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Search, Building2 } from "lucide-react";
import { TopNav } from "@/components/dashboard/top-nav";
import { PageHeader } from "@/components/ui/page-header";
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
import { listAcademies } from "@/lib/dashboard/api";
import type { AcademyDTO } from "@/types/dashboard";

const PAGE_SIZE = 10;

const SORTS = [
  { value: "academyName,asc", labelKey: "sortAcadNameAsc" },
  { value: "academyName,desc", labelKey: "sortAcadNameDesc" },
  { value: "establishedDate,desc", labelKey: "sortEstablishedDesc" },
  { value: "establishedDate,asc", labelKey: "sortEstablishedAsc" },
] as const;

export default function AcademiesBrowsePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { lang } = useLangStore();
  const t = BROWSE_STRINGS[lang];

  const [q, setQ] = useState("");
  const [sort, setSort] = useState<string>("academyName,asc");
  const [page, setPage] = useState(0);

  const debouncedQ = useDebouncedValue(q, 300);

  const listQ = useQuery({
    queryKey: ["academies", "browse", { q: debouncedQ, sort, page }],
    queryFn: () =>
      listAcademies({
        q: debouncedQ || undefined,
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
          title={t.academiesTitle}
          subtitle={t.academiesSub}
          back={{ label: t.backToDashboard, onClick: () => router.push("/dashboard") }}
        />

        {/* Filters bar */}
        <div className="bg-ink-700 border border-ink-600/70 rounded-xl p-4 mb-5 grid grid-cols-1 md:grid-cols-[1fr_260px_auto] gap-3 items-end">
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
                placeholder={t.academiesSearchPh}
                className="ltr:pl-10 rtl:pr-10"
              />
            </div>
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
              setPage(0);
            }}
            disabled={!q}
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
                <Building2 size={22} />
              </div>
              <p className="text-sm text-slate-400">{t.academiesEmpty}</p>
            </div>
          )}

          {!listQ.isLoading && !listQ.isError && rows.length > 0 && (
            <>
              <div className="hidden md:grid grid-cols-[2fr_1.6fr_1.8fr_1.2fr] px-5 py-2.5 text-[10px] uppercase tracking-[0.16em] text-slate-500 border-b border-ink-600/60 font-medium">
                <div>{t.colAcademy}</div>
                <div>{t.colLocation}</div>
                <div>{t.colContact}</div>
                <div>{t.colEstablished}</div>
              </div>
              {rows.map((row) => (
                <AcademyRow key={row.academyId} row={row} lang={lang} />
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

function AcademyRow({ row, lang }: { row: AcademyDTO; lang: "en" | "ar" }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[2fr_1.6fr_1.8fr_1.2fr] gap-1.5 md:gap-3 md:items-center px-5 py-3.5 text-sm border-t border-ink-600/60 first:border-0 hover:bg-ink-600/30 transition-colors">
      <div className="text-white font-medium">{row.academyName}</div>
      <div className="text-slate-300 text-xs truncate">{row.location || "—"}</div>
      <div className="min-w-0">
        {row.email && (
          <div
            className="text-slate-300 truncate font-mono text-xs"
            style={{ direction: "ltr", textAlign: lang === "ar" ? "right" : "left" }}
          >
            {row.email}
          </div>
        )}
        {row.phone && (
          <div
            className="text-slate-500 text-xs mt-0.5 font-mono"
            style={{ direction: "ltr", textAlign: lang === "ar" ? "right" : "left" }}
          >
            {row.phone}
          </div>
        )}
        {!row.email && !row.phone && <span className="text-slate-500 text-xs">—</span>}
      </div>
      <div className="text-slate-400 text-xs tabular-nums">
        {row.establishedDate ? format(new Date(row.establishedDate), "PP") : "—"}
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
          className="grid grid-cols-[1fr] md:grid-cols-[2fr_1.6fr_1.8fr_1.2fr] gap-3 items-center px-5 py-3.5 border-t border-ink-600/60 first:border-0"
        >
          <Skeleton width="65%" height={16} />
          <Skeleton width={110} height={13} className="hidden md:block" />
          <Skeleton width={140} height={13} className="hidden md:block" />
          <Skeleton width={80} height={13} className="hidden md:block" />
        </div>
      ))}
    </>
  );
}
