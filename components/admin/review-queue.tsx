"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ChevronRight, ClipboardCheck } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Tabs } from "@/components/ui/tabs";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import { Pagination } from "@/components/ui/pagination";
import { StatusBadge } from "@/components/ui/status-badge";
import { TypeBadge } from "@/components/ui/type-badge";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { useLangStore } from "@/lib/i18n/store";
import { ADMIN_STRINGS } from "@/lib/i18n/admin-strings";
import { listReviewQueue } from "@/lib/admin/api";
import type { ReviewQueueItem, ReviewType } from "@/types/admin";
import type { ApplicationStatus } from "@/types/applications";

type AdminT = (typeof ADMIN_STRINGS)[keyof typeof ADMIN_STRINGS];
type TypeFilter = "ALL" | ReviewType;
type StatusFilter = ApplicationStatus | "ALL";
type SortOrder = "newest" | "oldest";

const PAGE_SIZE = 10;
const TYPES: TypeFilter[] = ["ALL", "PLAYER", "COACH", "OFFICIAL", "ACADEMY"];
const STATUSES: StatusFilter[] = ["PENDING", "APPROVED", "REJECTED", "WITHDRAWN", "ALL"];

const ROW_GRID =
  "grid-cols-[1fr_auto] md:grid-cols-[2fr_1fr_1.6fr_1.1fr_130px]";

/** Where a review row opens. Players have their own page; applications share one. */
export function reviewHref(type: ReviewType, id: number): string {
  return type === "PLAYER"
    ? `/admin/players/${id}`
    : `/admin/applications/${type.toLowerCase()}/${id}`;
}

export function isReviewType(value: string | null): value is ReviewType {
  return (
    value === "PLAYER" ||
    value === "COACH" ||
    value === "OFFICIAL" ||
    value === "ACADEMY"
  );
}

export function ReviewQueue({ initialType = "ALL" }: { initialType?: TypeFilter }) {
  const { lang } = useLangStore();
  const t = ADMIN_STRINGS[lang];

  const [type, setType] = useState<TypeFilter>(initialType);
  const [status, setStatus] = useState<StatusFilter>("PENDING");
  const [sort, setSort] = useState<SortOrder>("newest");
  const [page, setPage] = useState(0);

  const isDefault = type === "ALL" && status === "PENDING" && sort === "newest";

  const queueQ = useQuery({
    // Shares the ["admin", "queue"] prefix so approving/rejecting anywhere refreshes this table.
    queryKey: ["admin", "queue", "review", { type, status, sort, page }],
    queryFn: () => listReviewQueue({ type, status, sort, page, size: PAGE_SIZE }),
  });

  const rows = queueQ.data?.content ?? [];
  const totalElements = queueQ.data?.totalElements ?? 0;
  const totalPages = queueQ.data?.totalPages ?? 1;

  function reset() {
    setType("ALL");
    setStatus("PENDING");
    setSort("newest");
    setPage(0);
  }

  return (
    <section id="review-queue" className="mt-10 scroll-mt-6">
      <SectionHeader title={t.rqTitle} />
      <p className="-mt-2 mb-4 text-sm text-slate-400">{t.rqSub}</p>

      <Tabs<TypeFilter>
        items={TYPES.map((value) => ({
          value,
          label: t[`rqType${value}` as const],
        }))}
        active={type}
        onChange={(value) => {
          setType(value);
          setPage(0);
        }}
      />

      <div className="mt-5 bg-ink-700 border border-ink-600/70 rounded-xl p-4 mb-5 grid grid-cols-1 sm:grid-cols-[220px_220px_auto] gap-x-3 items-end">
        <Field id="rq-status" label={t.filterStatus}>
          <Select
            id="rq-status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as StatusFilter);
              setPage(0);
            }}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === "ALL" ? t.filterAllStatuses : t[`status${s}` as const]}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="rq-sort" label={t.rqSort}>
          <Select
            id="rq-sort"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as SortOrder);
              setPage(0);
            }}
          >
            <option value="newest">{t.rqSortNewest}</option>
            <option value="oldest">{t.rqSortOldest}</option>
          </Select>
        </Field>
        <div className="mb-4">
          <button
            type="button"
            onClick={reset}
            disabled={isDefault}
            className="text-sm text-slate-300 hover:text-flag px-3 py-2.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-slate-300 transition-colors"
          >
            {t.clearFilters}
          </button>
        </div>
      </div>

      <div className="bg-ink-700 border border-ink-600/70 rounded-xl overflow-hidden">
        {queueQ.isLoading && <QueueSkeleton />}

        {queueQ.isError && (
          <ErrorState
            message={t.loadFailed}
            retryLabel={t.retry}
            onRetry={() => queueQ.refetch()}
          />
        )}

        {!queueQ.isLoading && !queueQ.isError && rows.length === 0 && (
          <div className="p-12 text-center">
            <div className="inline-flex w-12 h-12 rounded-full bg-ink-800 border border-ink-600 text-slate-400 items-center justify-center mb-3">
              <ClipboardCheck size={22} />
            </div>
            <p className="text-sm text-slate-400">{t.rqEmpty}</p>
          </div>
        )}

        {!queueQ.isLoading && !queueQ.isError && rows.length > 0 && (
          <>
            <div
              className={`hidden md:grid ${ROW_GRID} px-5 py-2.5 text-[10px] uppercase tracking-[0.16em] text-slate-500 border-b border-ink-600/60 font-medium`}
            >
              <div>{t.rqColSubject}</div>
              <div>{t.rqColType}</div>
              <div>{t.rqColDetails}</div>
              <div>{t.colSubmitted}</div>
              <div className="text-right rtl:text-left">{t.colStatus}</div>
            </div>
            {rows.map((row) => (
              <ReviewRow key={`${row.type}-${row.id}`} row={row} t={t} lang={lang} />
            ))}
          </>
        )}
      </div>

      {totalElements > 0 && !queueQ.isError && (
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
    </section>
  );
}

function detailLabel(row: ReviewQueueItem, t: AdminT): string {
  if (!row.detail) return "—";
  if (row.type === "OFFICIAL") {
    const key = `spec_${row.detail}` as keyof AdminT;
    return (t[key] as string | undefined) ?? row.detail;
  }
  return row.detail;
}

function ReviewRow({
  row,
  t,
  lang,
}: {
  row: ReviewQueueItem;
  t: AdminT;
  lang: "en" | "ar";
}) {
  const parts = row.subject.split(" ").filter(Boolean);
  const initials = `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();

  return (
    <Link
      href={reviewHref(row.type, row.id)}
      className={`grid ${ROW_GRID} items-center gap-3 px-5 py-3.5 text-sm border-t border-ink-600/60 first:border-0 hover:bg-ink-600/30 transition-colors`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Avatar initials={initials} size={36} />
        <div className="min-w-0">
          <div className="text-white font-medium truncate">{row.subject}</div>
          <div className="md:hidden mt-0.5 flex items-center gap-2">
            <TypeBadge type={row.type} label={t[`type${row.type}` as const]} />
          </div>
          {row.email && (
            <div
              className="hidden md:block text-xs text-slate-500 truncate font-mono"
              style={{ direction: "ltr", textAlign: lang === "ar" ? "right" : "left" }}
            >
              {row.email}
            </div>
          )}
        </div>
      </div>
      <div className="hidden md:block">
        <TypeBadge type={row.type} label={t[`type${row.type}` as const]} />
      </div>
      <div className="hidden md:block text-slate-200 text-sm truncate">
        {detailLabel(row, t)}
      </div>
      <div className="hidden md:block text-slate-400 text-xs tabular-nums">
        {row.submittedAt ? format(new Date(row.submittedAt), "PP") : "—"}
      </div>
      <div className="flex items-center justify-end rtl:justify-start gap-2">
        <StatusBadge status={row.status} label={t[`status${row.status}` as const]} />
        <span className="text-slate-500 hidden md:inline-flex rtl:rotate-180">
          <ChevronRight size={16} />
        </span>
      </div>
    </Link>
  );
}

function QueueSkeleton() {
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`grid ${ROW_GRID} items-center gap-3 px-5 py-3.5 border-t border-ink-600/60 first:border-0`}
        >
          <div className="flex items-center gap-3">
            <Skeleton width={36} height={36} className="rounded-full" />
            <Skeleton width={140} height={16} />
          </div>
          <Skeleton width={70} height={18} className="hidden md:block" />
          <Skeleton width={120} height={14} className="hidden md:block" />
          <Skeleton width={80} height={14} className="hidden md:block" />
          <Skeleton width={80} height={20} />
        </div>
      ))}
    </>
  );
}
