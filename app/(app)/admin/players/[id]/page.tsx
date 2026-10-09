"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { format } from "date-fns";
import { AlertTriangle, Check, Users } from "lucide-react";
import { TopNav } from "@/components/dashboard/top-nav";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { TypeBadge } from "@/components/ui/type-badge";
import { Avatar } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { DangerButton } from "@/components/ui/danger-button";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { InfoRow } from "@/components/admin/info-row";
import { DocumentsCard } from "@/components/admin/documents-card";
import { useAuth } from "@/hooks/use-auth";
import { useLangStore } from "@/lib/i18n/store";
import { ADMIN_STRINGS } from "@/lib/i18n/admin-strings";
import {
  approvePlayer,
  getPlayerReviewDetail,
  rejectPlayer,
} from "@/lib/admin/api";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { ApplicationStatus } from "@/types/applications";

type AdminT = (typeof ADMIN_STRINGS)[keyof typeof ADMIN_STRINGS];

/** Only these three outcomes exist in the review flow; anything else has no badge. */
function asReviewStatus(value: string): ApplicationStatus | null {
  return value === "PENDING" || value === "APPROVED" || value === "REJECTED"
    ? value
    : null;
}

export default function AdminPlayerReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = use(params);
  const id = Number(idStr);
  const router = useRouter();
  const qc = useQueryClient();
  const { user } = useAuth();
  const { lang } = useLangStore();
  const t = ADMIN_STRINGS[lang];

  const [confirmApprove, setConfirmApprove] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectErr, setRejectErr] = useState("");

  const detailQ = useQuery({
    queryKey: ["admin", "player", id],
    queryFn: () => getPlayerReviewDetail(id),
    enabled: Number.isFinite(id),
    retry: (count, err) =>
      !(isAxiosError(err) && err.response?.status === 404) && count < 1,
  });

  function refreshAfterDecision() {
    qc.invalidateQueries({ queryKey: ["admin", "player", id] });
    qc.invalidateQueries({ queryKey: ["admin", "queue"] });
  }

  const approveMutation = useMutation({
    mutationFn: () => approvePlayer(id),
    onSuccess: () => {
      refreshAfterDecision();
      setConfirmApprove(false);
      toast.success(t.toastPlayerApproved);
    },
    onError: (err) => {
      setConfirmApprove(false);
      toast.error(getApiErrorMessage(err, t.toastAppActionFailed));
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => rejectPlayer(id, { reason: rejectReason.trim() }),
    onSuccess: () => {
      refreshAfterDecision();
      setRejectOpen(false);
      setRejectReason("");
      toast.success(t.toastPlayerRejected);
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, t.toastAppActionFailed)),
  });

  function tryReject() {
    if (rejectReason.trim().length < 5) {
      setRejectErr(t.rejectReasonRequired);
      return;
    }
    setRejectErr("");
    rejectMutation.mutate();
  }

  if (!user) return null;

  const player = detailQ.data;
  const notFound =
    !Number.isFinite(id) ||
    (detailQ.isError &&
      isAxiosError(detailQ.error) &&
      detailQ.error.response?.status === 404);
  const reviewStatus = player ? asReviewStatus(player.reviewStatus) : null;
  const isPending = player?.reviewStatus === "PENDING";
  const hasCertificate = (player?.documents.length ?? 0) > 0;

  return (
    <>
      <TopNav user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-6">
        <PageHeader
          title={t.playerVerification}
          back={{
            label: t.backToAdmin,
            onClick: () => router.push("/admin?type=PLAYER#review-queue"),
          }}
          action={
            player && (
              <div className="flex items-center gap-2">
                <TypeBadge type="PLAYER" label={t.typePLAYER} />
                {reviewStatus && (
                  <StatusBadge
                    status={reviewStatus}
                    label={t[`status${reviewStatus}` as const]}
                  />
                )}
              </div>
            )
          }
        />

        {detailQ.isLoading && <DetailSkeleton />}

        {notFound && (
          <EmptyState
            icon={Users}
            title={t.playerNotFound}
            body={t.playerNotFoundBody}
            action={
              <PrimaryButton
                type="button"
                onClick={() => router.push("/admin")}
                className="w-auto px-5"
              >
                {t.backToAdmin}
              </PrimaryButton>
            }
          />
        )}

        {detailQ.isError && !notFound && (
          <ErrorState
            message={t.loadFailed}
            retryLabel={t.retry}
            onRetry={() => detailQ.refetch()}
          />
        )}

        {player && (
          <>
            {(reviewStatus === "APPROVED" || reviewStatus === "REJECTED") && (
              <DecisionBanner
                approved={reviewStatus === "APPROVED"}
                reviewedAt={player.reviewedAt}
                reason={player.rejectionReason}
                t={t}
              />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
              <aside className="bg-ink-700 border border-ink-600/70 rounded-xl p-6 self-start">
                <SectionHeader title={t.playerInfo} />
                <div className="flex flex-col items-center text-center mb-5">
                  <Avatar
                    initials={`${player.firstName?.[0] ?? ""}${player.lastName?.[0] ?? ""}`.toUpperCase()}
                    size={120}
                  />
                  <div className="text-base font-semibold text-white mt-3">
                    {player.firstName} {player.lastName}
                  </div>
                  {player.email && (
                    <div
                      className="text-xs text-slate-400 mt-0.5 font-mono"
                      style={{ direction: "ltr" }}
                    >
                      {player.email}
                    </div>
                  )}
                </div>
                <div>
                  <InfoRow label={t.phone}>
                    {player.phone && (
                      <span
                        className="font-mono text-xs inline-block"
                        style={{ direction: "ltr" }}
                      >
                        {player.phone}
                      </span>
                    )}
                  </InfoRow>
                  <InfoRow label={t.dob}>
                    {player.dateOfBirth && format(new Date(player.dateOfBirth), "PP")}
                  </InfoRow>
                  <InfoRow label={t.gender}>
                    {player.gender && t[`gender${player.gender}` as const]}
                  </InfoRow>
                  <InfoRow label={t.nationality}>{player.nationality}</InfoRow>
                  <InfoRow label={t.cpr}>
                    {player.cprNumber && (
                      <span className="font-mono text-xs">{player.cprNumber}</span>
                    )}
                  </InfoRow>
                  <InfoRow label={t.appSubmittedOn}>
                    {player.submittedAt && format(new Date(player.submittedAt), "PP")}
                  </InfoRow>
                </div>
              </aside>

              <div className="space-y-5">
                <section className="bg-ink-700 border border-ink-600/70 rounded-xl p-6">
                  <SectionHeader title={t.playerBeltDetails} />
                  <InfoRow label={t.claimedBelt}>{player.beltName}</InfoRow>
                  <InfoRow label={t.academy}>
                    {player.academyId && player.academyName && (
                      <Link
                        href={`/academies/${player.academyId}`}
                        className="hover:text-flag transition-colors"
                      >
                        {player.academyName}
                      </Link>
                    )}
                  </InfoRow>
                  <InfoRow label={t.addedBy}>{player.addedBy}</InfoRow>
                  <InfoRow label={t.registeredOn}>
                    {player.registrationDate &&
                      format(new Date(player.registrationDate), "PP")}
                  </InfoRow>
                </section>

                {isPending && !hasCertificate && <NoCertificateWarning t={t} />}

                <DocumentsCard documents={player.documents} t={t} />
              </div>
            </div>

            {isPending && (
              <div className="sticky bottom-0 z-20 mt-6 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 bg-ink-800/95 backdrop-blur border-t border-ink-600/70 flex items-center justify-end gap-3">
                <DangerButton onClick={() => setRejectOpen(true)}>
                  {t.rejectCta}
                </DangerButton>
                <button
                  type="button"
                  onClick={() => setConfirmApprove(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg py-2.5 px-4 inline-flex items-center gap-2 transition-colors"
                >
                  <Check size={14} />
                  {t.approveCta}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <ConfirmModal
        open={confirmApprove}
        onClose={() => setConfirmApprove(false)}
        onConfirm={() => approveMutation.mutate()}
        title={t.approvePlayerTitle}
        body={t.approvePlayerBody}
        confirmLabel={t.approveCta}
        cancelLabel={t.cancel}
        loading={approveMutation.isPending}
        loadingLabel={t.approving}
      />

      <Modal
        open={rejectOpen}
        onClose={() => !rejectMutation.isPending && setRejectOpen(false)}
        title={t.rejectPlayerTitle}
        size="md"
        dismissible={!rejectMutation.isPending}
        footer={
          <>
            <SecondaryButton
              onClick={() => setRejectOpen(false)}
              disabled={rejectMutation.isPending}
            >
              {t.cancel}
            </SecondaryButton>
            <DangerButton
              onClick={tryReject}
              loading={rejectMutation.isPending}
              loadingText={t.rejecting}
            >
              {t.rejectCta}
            </DangerButton>
          </>
        }
      >
        <Field id="rr" label={t.rejectPlayerReasonLabel} error={rejectErr}>
          <Textarea
            id="rr"
            rows={5}
            value={rejectReason}
            onChange={(e) => {
              setRejectReason(e.target.value);
              if (rejectErr) setRejectErr("");
            }}
            placeholder={t.rejectReasonPh}
            error={!!rejectErr}
          />
        </Field>
      </Modal>
    </>
  );
}

function DecisionBanner({
  approved,
  reviewedAt,
  reason,
  t,
}: {
  approved: boolean;
  reviewedAt: string | null;
  reason: string | null;
  t: AdminT;
}) {
  return (
    <div
      className={`mb-6 p-4 rounded-lg border flex items-start gap-3 ${
        approved
          ? "bg-emerald-500/10 border-emerald-500/30"
          : "bg-red-500/10 border-red-500/30"
      }`}
    >
      <span className={approved ? "text-emerald-400" : "text-red-400"}>
        {approved ? <Check size={18} /> : <AlertTriangle size={18} />}
      </span>
      <div className="text-sm text-slate-200 flex-1">
        <div>
          {approved ? t.decisionApproved : t.decisionRejected}
          {reviewedAt && (
            <>
              {" · "}
              <span className="text-slate-400">
                {format(new Date(reviewedAt), "PP")}
              </span>
            </>
          )}
        </div>
        {!approved && reason && (
          <div className="mt-2 text-xs">
            <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
              {t.rejectionReason}
            </div>
            <div className="mt-1 text-slate-200">{reason}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function NoCertificateWarning({ t }: { t: AdminT }) {
  return (
    <div
      role="status"
      className="p-4 rounded-lg border bg-amber-500/10 border-amber-500/30 flex items-start gap-3"
    >
      <span className="text-amber-300 mt-0.5">
        <AlertTriangle size={16} />
      </span>
      <p className="text-sm text-amber-100 text-pretty">{t.noCertWarning}</p>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
      <div className="bg-ink-700 border border-ink-600/70 rounded-xl p-6 space-y-3">
        <Skeleton width="100%" height={120} className="rounded-full mx-auto" />
        <Skeleton width="60%" height={18} className="mx-auto" />
        <div className="mt-4 space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} width="100%" height={14} />
          ))}
        </div>
      </div>
      <div className="space-y-5">
        <div className="bg-ink-700 border border-ink-600/70 rounded-xl p-6 space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} width="100%" height={14} />
          ))}
        </div>
      </div>
    </div>
  );
}
