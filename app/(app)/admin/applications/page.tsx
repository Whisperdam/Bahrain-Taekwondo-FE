"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ChevronRight, FileText } from "lucide-react";
import { TopNav } from "@/components/dashboard/top-nav";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { Tabs } from "@/components/ui/tabs";
import { Pagination } from "@/components/ui/pagination";
import { StatusBadge } from "@/components/ui/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useLangStore } from "@/lib/i18n/store";
import { ADMIN_STRINGS } from "@/lib/i18n/admin-strings";
import {
  listCoachQueue,
  listOfficialQueue,
  listAcademyQueue,
} from "@/lib/admin/api";
import type {
  ApplicationStatus,
  ApplicationType,
  CoachApplicationSummary,
  OfficialApplicationSummary,
  AcademyApplicationSummary,
} from "@/types/applications";

type QueueKey = "coaches" | "officials" | "academies";

const TYPE_BY_KEY: Record<QueueKey, ApplicationType> = {
  coaches: "COACH",
  officials: "OFFICIAL",
  academies: "ACADEMY",
};

const PAGE_SIZE = 10;

const STATUSES: ApplicationStatus[] = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "WITHDRAWN",
];

export default function AdminApplicationsPage() {
  return (
    <Suspense fallback={null}>
      <Content />
    </Suspense>
  );
}

function Content() {
  const router = useRouter();
  const params = useSearchParams();
  const initialType =
    (params.get("type") as QueueKey | null) ?? "coaches";

  const { user } = useAuth();
  const { lang } = useLangStore();
  const t = ADMIN_STRINGS[lang];

  const [queueType, setQueueType] = useState<QueueKey>(initialType);
  const [status, setStatus] = useState<ApplicationStatus>("PENDING");
  const [page, setPage] = useState(0);

  function changeType(next: QueueKey) {
    setQueueType(next);
    setPage(0);
    // Reflect choice in URL so deep-linking works
    const sp = new URLSearchParams(params);
    sp.set("type", next);
    router.replace(`/admin/applications?${sp.toString()}`);
  }

  function changeStatus(next: ApplicationStatus) {
    setStatus(next);
    setPage(0);
  }

  type QueueRow =
    | CoachApplicationSummary
    | OfficialApplicationSummary
    | AcademyApplicationSummary;

  const queueQ = useQuery({
    queryKey: ["admin", "queue", queueType, status, page] as const,
    queryFn: async (): Promise<{
      content: QueueRow[];
      totalElements: number;
      totalPages: number;
    }> => {
      const q = { status, page, size: PAGE_SIZE };
      if (queueType === "coaches") return listCoachQueue(q);
      if (queueType === "officials") return listOfficialQueue(q);
      return listAcademyQueue(q);
    },
  });

  if (!user) return null;

  const data = queueQ.data;
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const rows = data?.content ?? [];

  return (
    <>
      <TopNav user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-6">
        <PageHeader
          title={t.queueTitle}
          back={{
            label: t.backToAdmin,
            onClick: () => router.push("/admin"),
          }}
          action={
            <div className="min-w-[180px]">
              <Select
                value={queueType}
                onChange={(e) => changeType(e.target.value as QueueKey)}
                aria-label={t.queueType}
              >
                <option value="coaches">{t.queueCoaches}</option>
                <option value="officials">{t.queueOfficials}</option>
                <option value="academies">{t.queueAcademies}</option>
              </Select>
            </div>
          }
        />

        <Tabs<ApplicationStatus>
          items={STATUSES.map((s) => ({
            value: s,
            label: t[`status${s}` as const],
          }))}
          active={status}
          onChange={changeStatus}
        />

        <div className="mt-5 bg-ink-700 border border-ink-600/70 rounded-xl overflow-hidden">
          {queueQ.isLoading && <QueueSkeleton />}

          {!queueQ.isLoading && rows.length === 0 && (
            <div className="p-12 text-center">
              <div className="inline-flex w-12 h-12 rounded-full bg-ink-800 border border-ink-600 text-slate-400 items-center justify-center mb-3">
                <FileText size={22} />
              </div>
              <p className="text-sm text-slate-400">{t.queueEmpty}</p>
            </div>
          )}

          {!queueQ.isLoading && rows.length > 0 && (
            <QueueTable type={TYPE_BY_KEY[queueType]} rows={rows} />
          )}
        </div>

        {totalElements > 0 && (
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

function QueueSkeleton() {
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="grid grid-cols-[1fr_120px] md:grid-cols-[2fr_2fr_1.4fr_1.1fr_120px] items-center gap-3 px-5 py-3.5 border-t border-ink-600/60 first:border-0"
        >
          <div className="flex items-center gap-3">
            <Skeleton width={36} height={36} className="rounded-full" />
            <Skeleton width={140} height={16} />
          </div>
          <Skeleton width={120} height={14} className="hidden md:block" />
          <Skeleton width={90} height={14} className="hidden md:block" />
          <Skeleton width={80} height={14} className="hidden md:block" />
          <Skeleton width={80} height={20} />
        </div>
      ))}
    </>
  );
}

function QueueTable({
  type,
  rows,
}: {
  type: ApplicationType;
  rows: (
    | CoachApplicationSummary
    | OfficialApplicationSummary
    | AcademyApplicationSummary
  )[];
}) {
  const router = useRouter();
  const { lang } = useLangStore();
  const t = ADMIN_STRINGS[lang];

  // Column 3 (the "extra") differs per type
  const extraColLabel =
    type === "COACH"
      ? t.colCertLevel
      : type === "OFFICIAL"
        ? t.colSpecialization
        : t.colProposedName;

  return (
    <>
      <div className="hidden md:grid grid-cols-[2fr_2fr_1.4fr_1.1fr_120px] px-5 py-2.5 text-[10px] uppercase tracking-[0.16em] text-slate-500 border-b border-ink-600/60 font-medium">
        <div>{t.colApplicant}</div>
        <div>{t.colContact}</div>
        <div>{extraColLabel}</div>
        <div>{t.colSubmitted}</div>
        <div className="text-right rtl:text-left">{t.colStatus}</div>
      </div>
      {rows.map((r) => {
        const id = r.applicationId;
        return (
          <button
            key={id}
            type="button"
            onClick={() =>
              router.push(
                `/admin/applications/${type.toLowerCase()}/${id}`,
              )
            }
            className="w-full grid grid-cols-[1fr_120px] md:grid-cols-[2fr_2fr_1.4fr_1.1fr_120px] items-center gap-3 px-5 py-3.5 text-sm border-t border-ink-600/60 first:border-0 hover:bg-ink-600/30 transition-colors text-left"
          >
            <ApplicantCell row={r} type={type} lang={lang} />
            <ContactCell row={r} type={type} lang={lang} />
            <ExtraCell row={r} type={type} t={t} />
            <div className="hidden md:block text-slate-400 text-xs tabular-nums">
              {format(new Date(r.submittedAt), "PP")}
            </div>
            <div className="flex items-center justify-end rtl:justify-start gap-2">
              <StatusBadge
                status={r.status}
                label={t[`status${r.status}` as const]}
              />
              <span className="text-slate-500 hidden md:inline-flex rtl:rotate-180">
                <ChevronRight size={16} />
              </span>
            </div>
          </button>
        );
      })}
    </>
  );
}

function ApplicantCell({
  row,
  type,
  lang,
}: {
  row:
    | CoachApplicationSummary
    | OfficialApplicationSummary
    | AcademyApplicationSummary;
  type: ApplicationType;
  lang: "en" | "ar";
}) {
  if (type === "ACADEMY") {
    const r = row as AcademyApplicationSummary;
    const parts = r.applicantCoachName?.split(" ") ?? [];
    const initials = `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
    return (
      <div className="flex items-center gap-3 min-w-0">
        <Avatar initials={initials} size={36} />
        <div className="min-w-0">
          <div className="text-white font-medium truncate">
            {r.applicantCoachName}
          </div>
        </div>
      </div>
    );
  }
  const r = row as CoachApplicationSummary | OfficialApplicationSummary;
  const initials = `${r.applicantFirstName?.[0] ?? ""}${r.applicantLastName?.[0] ?? ""}`.toUpperCase();
  return (
    <div className="flex items-center gap-3 min-w-0">
      <Avatar initials={initials} size={36} />
      <div className="min-w-0">
        <div className="text-white font-medium truncate">
          {r.applicantFirstName} {r.applicantLastName}
        </div>
        <div
          className="text-xs text-slate-500 md:hidden truncate font-mono"
          style={{
            direction: "ltr",
            textAlign: lang === "ar" ? "right" : "left",
          }}
        >
          {r.email}
        </div>
      </div>
    </div>
  );
}

function ContactCell({
  row,
  type,
  lang,
}: {
  row:
    | CoachApplicationSummary
    | OfficialApplicationSummary
    | AcademyApplicationSummary;
  type: ApplicationType;
  lang: "en" | "ar";
}) {
  if (type === "ACADEMY") {
    const r = row as AcademyApplicationSummary;
    return (
      <div className="hidden md:block min-w-0 text-slate-300 text-xs truncate">
        {r.proposedLocation ?? "—"}
      </div>
    );
  }
  const r = row as CoachApplicationSummary | OfficialApplicationSummary;
  return (
    <div className="hidden md:block min-w-0">
      <div
        className="text-slate-300 truncate font-mono text-xs"
        style={{
          direction: "ltr",
          textAlign: lang === "ar" ? "right" : "left",
        }}
      >
        {r.email}
      </div>
      <div
        className="text-slate-500 text-xs mt-0.5 font-mono"
        style={{
          direction: "ltr",
          textAlign: lang === "ar" ? "right" : "left",
        }}
      >
        {r.phone}
      </div>
    </div>
  );
}

function ExtraCell({
  row,
  type,
  t,
}: {
  row:
    | CoachApplicationSummary
    | OfficialApplicationSummary
    | AcademyApplicationSummary;
  type: ApplicationType;
  // Use the union of language string objects so either lang's t is assignable.
  t: (typeof ADMIN_STRINGS)[keyof typeof ADMIN_STRINGS];
}) {
  if (type === "COACH") {
    return (
      <div className="hidden md:block text-slate-200 text-sm truncate">
        {(row as CoachApplicationSummary).certificationLevel ?? "—"}
      </div>
    );
  }
  if (type === "OFFICIAL") {
    const r = row as OfficialApplicationSummary;
    const label = r.specialization
      ? t[`spec_${r.specialization}` as const]
      : "—";
    return (
      <div className="hidden md:block text-slate-200 text-sm truncate">
        {label}
      </div>
    );
  }
  const r = row as AcademyApplicationSummary;
  return (
    <div className="hidden md:block text-slate-200 text-sm truncate">
      {r.proposedName}
    </div>
  );
}
