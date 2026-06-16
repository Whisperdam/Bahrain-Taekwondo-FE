"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { ChevronRight, FileText, Trash2 } from "lucide-react";
import { TopNav } from "@/components/dashboard/top-nav";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { TypeBadge } from "@/components/ui/type-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useAuth } from "@/hooks/use-auth";
import { useLangStore } from "@/lib/i18n/store";
import { PORTAL_STRINGS } from "@/lib/i18n/portal-strings";
import {
  listMyCoachApplications,
  listMyOfficialApplications,
  listMyAcademyApplications,
  withdrawCoachApplication,
  withdrawOfficialApplication,
  withdrawAcademyApplication,
} from "@/lib/applications/api";
import type { ApplicationListItem } from "@/types/applications";

export default function MyApplicationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { lang } = useLangStore();
  const t = PORTAL_STRINGS[lang];
  const qc = useQueryClient();
  const [confirmTarget, setConfirmTarget] =
    useState<ApplicationListItem | null>(null);

  const coach = useQuery({
    queryKey: ["applications", "coach", "my"],
    queryFn: listMyCoachApplications,
  });
  const official = useQuery({
    queryKey: ["applications", "official", "my"],
    queryFn: listMyOfficialApplications,
  });
  const academy = useQuery({
    queryKey: ["applications", "academy", "my"],
    queryFn: listMyAcademyApplications,
  });

  const isLoading = coach.isLoading || official.isLoading || academy.isLoading;

  // Unify the three lists into one feed, newest first.
  const items: ApplicationListItem[] = useMemo(() => {
    const out: ApplicationListItem[] = [];
    coach.data?.forEach((a) =>
      out.push({
        type: "COACH",
        applicationId: a.applicationId,
        status: a.status,
        submittedAt: a.submittedAt,
        reviewedAt: a.reviewedAt,
        summary:
          a.certificationLevel ??
          `${a.applicantFirstName} ${a.applicantLastName}`,
      }),
    );
    official.data?.forEach((a) =>
      out.push({
        type: "OFFICIAL",
        applicationId: a.applicationId,
        status: a.status,
        submittedAt: a.submittedAt,
        reviewedAt: a.reviewedAt,
        summary: [
          a.specialization ? specLabel(a.specialization, lang) : null,
          a.certificationLevel ? certLabel(a.certificationLevel, lang) : null,
        ]
          .filter(Boolean)
          .join(" · "),
      }),
    );
    academy.data?.forEach((a) =>
      out.push({
        type: "ACADEMY",
        applicationId: a.applicationId,
        status: a.status,
        submittedAt: a.submittedAt,
        reviewedAt: a.reviewedAt,
        summary: a.proposedName,
      }),
    );
    return out.sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
    );
  }, [coach.data, official.data, academy.data, lang]);

  const withdrawMutation = useMutation({
    mutationFn: async (item: ApplicationListItem) => {
      if (item.type === "COACH")
        return withdrawCoachApplication(item.applicationId);
      if (item.type === "OFFICIAL")
        return withdrawOfficialApplication(item.applicationId);
      return withdrawAcademyApplication(item.applicationId);
    },
    onSuccess: (_data, item) => {
      qc.invalidateQueries({
        queryKey: ["applications", item.type.toLowerCase(), "my"],
      });
      setConfirmTarget(null);
      toast.success(t.withdrawDone);
    },
    onError: () => toast.error(t.withdrawFailed),
  });

  if (!user) return null;

  return (
    <>
      <TopNav user={user} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-6">
        <PageHeader title={t.myAppsTitle} subtitle={t.myAppsSub} />

        {isLoading && <ListSkeleton />}

        {!isLoading && items.length === 0 && (
          <EmptyState
            icon={FileText}
            title={t.myAppsEmpty}
            body={t.myAppsEmptySub}
            action={
              <>
                <PrimaryButton
                  type="button"
                  onClick={() => router.push("/apply/coach")}
                  className="w-auto px-4"
                >
                  {t.applyCoachNav}
                </PrimaryButton>
                <SecondaryButton onClick={() => router.push("/apply/official")}>
                  {t.applyOfficialNav}
                </SecondaryButton>
              </>
            }
          />
        )}

        {!isLoading && items.length > 0 && (
          <div className="space-y-3">
            {items.map((item) => (
              <AppCard
                key={`${item.type}-${item.applicationId}`}
                item={item}
                onWithdraw={() => setConfirmTarget(item)}
              />
            ))}
          </div>
        )}
      </main>

      <ConfirmModal
        open={!!confirmTarget}
        onClose={() => !withdrawMutation.isPending && setConfirmTarget(null)}
        onConfirm={() => confirmTarget && withdrawMutation.mutate(confirmTarget)}
        title={t.withdrawTitle}
        body={t.withdrawBody}
        confirmLabel={t.withdraw}
        cancelLabel={t.cancel}
        loading={withdrawMutation.isPending}
        loadingLabel={t.withdrawing}
        danger
      />
    </>
  );
}

function AppCard({
  item,
  onWithdraw,
}: {
  item: ApplicationListItem;
  onWithdraw: () => void;
}) {
  const { lang } = useLangStore();
  const t = PORTAL_STRINGS[lang];
  return (
    <article className="card bg-ink-700 border border-ink-600/70 rounded-xl">
      <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <TypeBadge type={item.type} label={t[`type${item.type}` as const]} />
            <StatusBadge
              status={item.status}
              label={t[`status${item.status}` as const]}
            />
            <span className="text-xs text-slate-500">
              {t.appSubmitted}:{" "}
              <span className="text-slate-300">
                {format(new Date(item.submittedAt), "PP")}
              </span>
            </span>
          </div>
          <div className="text-base text-white font-medium truncate">
            {item.summary || "—"}
          </div>
        </div>
        <div className="flex items-center gap-2 ltr:sm:ml-auto rtl:sm:mr-auto">
          {item.status === "PENDING" && (
            <SecondaryButton
              onClick={onWithdraw}
              className="!py-2 !px-3 text-xs"
            >
              <Trash2 size={13} />
              {t.withdraw}
            </SecondaryButton>
          )}
          <span className="text-slate-500 hidden sm:inline-flex rtl:rotate-180">
            <ChevronRight size={18} />
          </span>
        </div>
      </div>
    </article>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="bg-ink-700 border border-ink-600/70 rounded-xl p-5 flex items-center gap-4"
        >
          <div className="flex-1 space-y-2">
            <div className="flex gap-2">
              <Skeleton width={70} height={18} />
              <Skeleton width={80} height={18} />
            </div>
            <Skeleton width="60%" height={20} />
          </div>
          <Skeleton width={92} height={32} />
        </div>
      ))}
    </div>
  );
}

// ── tiny helpers to render official summaries with localized enum labels ──
function specLabel(spec: string, lang: "en" | "ar"): string {
  const dict: Record<string, { en: string; ar: string }> = {
    REFEREE: { en: "Referee", ar: "حكم" },
    JUDGE: { en: "Judge", ar: "حكم جانبي" },
    COACH_REFEREE: { en: "Coach-Referee", ar: "مدرب وحكم" },
  };
  return dict[spec]?.[lang] ?? spec;
}
function certLabel(cert: string, lang: "en" | "ar"): string {
  const dict: Record<string, { en: string; ar: string }> = {
    NATIONAL: { en: "National", ar: "محلي" },
    REGIONAL: { en: "Regional", ar: "إقليمي" },
    INTERNATIONAL: { en: "International", ar: "دولي" },
  };
  return dict[cert]?.[lang] ?? cert;
}
