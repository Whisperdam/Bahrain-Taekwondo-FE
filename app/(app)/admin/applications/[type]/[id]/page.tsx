"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { Check, FileIcon, ExternalLink, AlertTriangle } from "lucide-react";
import { TopNav } from "@/components/dashboard/top-nav";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { TypeBadge } from "@/components/ui/type-badge";
import { Avatar } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { DangerButton } from "@/components/ui/danger-button";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useLangStore } from "@/lib/i18n/store";
import { ADMIN_STRINGS } from "@/lib/i18n/admin-strings";
import {
  getCoachApplicationDetail,
  getOfficialApplicationDetail,
  getAcademyApplicationDetail,
  approveApplication,
  rejectApplication,
} from "@/lib/admin/api";
import { getDocumentUrl } from "@/lib/applications/api";
import type {
  ApplicationType,
  CoachApplicationDetail,
  OfficialApplicationDetail,
  AcademyApplicationDetail,
  DocumentSummary,
} from "@/types/applications";

type DetailUnion =
  | CoachApplicationDetail
  | OfficialApplicationDetail
  | AcademyApplicationDetail;

function urlTypeToEnum(urlType: string): ApplicationType | null {
  if (urlType === "coach") return "COACH";
  if (urlType === "official") return "OFFICIAL";
  if (urlType === "academy") return "ACADEMY";
  return null;
}

export default function AdminApplicationDetailPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type: urlType, id: idStr } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { lang } = useLangStore();
  const t = ADMIN_STRINGS[lang];
  const qc = useQueryClient();

  const type = urlTypeToEnum(urlType);
  const id = Number(idStr);

  const [confirmApprove, setConfirmApprove] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectErr, setRejectErr] = useState("");

  const detailQ = useQuery({
    queryKey: ["admin", "application", type, id],
    queryFn: async (): Promise<DetailUnion> => {
      if (type === "COACH") return getCoachApplicationDetail(id);
      if (type === "OFFICIAL") return getOfficialApplicationDetail(id);
      if (type === "ACADEMY") return getAcademyApplicationDetail(id);
      throw new Error("Unknown application type");
    },
    enabled: !!type && Number.isFinite(id),
  });

  const approveMutation = useMutation({
    mutationFn: () => approveApplication(type!, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "application", type, id] });
      qc.invalidateQueries({ queryKey: ["admin", "queue"] });
      // Approving grants a role server-side. If the admin happens to be
      // approving their own application, force-refresh the auth store so
      // the new role shows up in TopNav / Profile immediately.
      qc.invalidateQueries({ queryKey: ["auth", "me"] });
      setConfirmApprove(false);
      toast.success(t.toastAppApproved);
    },
    onError: () => toast.error(t.toastAppActionFailed),
  });

  const rejectMutation = useMutation({
    mutationFn: () => rejectApplication(type!, id, { reason: rejectReason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "application", type, id] });
      qc.invalidateQueries({ queryKey: ["admin", "queue"] });
      qc.invalidateQueries({ queryKey: ["auth", "me"] });
      setRejectOpen(false);
      setRejectReason("");
      toast.success(t.toastAppRejected);
    },
    onError: () => toast.error(t.toastAppActionFailed),
  });

  function tryReject() {
    if (rejectReason.trim().length < 5) {
      setRejectErr(t.rejectReasonRequired);
      return;
    }
    setRejectErr("");
    rejectMutation.mutate();
  }

  if (!user || !type) return null;

  const app = detailQ.data;

  return (
    <>
      <TopNav user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-6">
        <PageHeader
          title={t.applicationDetails}
          back={{
            label: t.backToQueue,
            onClick: () =>
              router.push(
                `/admin/applications?type=${pluralizeType(type)}`,
              ),
          }}
          action={
            app && (
              <div className="flex items-center gap-2">
                <TypeBadge type={type} label={t[`type${type}` as const]} />
                <StatusBadge
                  status={app.status}
                  label={t[`status${app.status}` as const]}
                />
              </div>
            )
          }
        />

        {detailQ.isLoading && <DetailSkeleton />}

        {!detailQ.isLoading && app && (
          <>
            {/* Decision banner when not actionable anymore */}
            {app.status !== "PENDING" && app.status !== "UNDER_REVIEW" && (
              <DecisionBanner app={app} t={t} lang={lang} />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
              <ApplicantCard app={app} type={type} t={t} lang={lang} />

              <div className="space-y-5">
                <ApplicationFieldsCard app={app} type={type} t={t} lang={lang} />
                <DocumentsCard documents={app.documents ?? []} t={t} lang={lang} />
              </div>
            </div>

            {app.status === "PENDING" && (
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
        title={t.approveTitle}
        body={
          type === "COACH"
            ? t.approveBodyCoach
            : type === "OFFICIAL"
              ? t.approveBodyOfficial
              : t.approveBodyAcademy
        }
        confirmLabel={t.approveCta}
        cancelLabel={t.cancel}
        loading={approveMutation.isPending}
        loadingLabel={t.approving}
      />

      <Modal
        open={rejectOpen}
        onClose={() => !rejectMutation.isPending && setRejectOpen(false)}
        title={t.rejectTitle}
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
        <Field id="rr" label={t.rejectReasonLabel} error={rejectErr}>
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

function pluralizeType(type: ApplicationType): string {
  if (type === "COACH") return "coaches";
  if (type === "OFFICIAL") return "officials";
  return "academies";
}

function DetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
      <div className="bg-ink-700 border border-ink-600/70 rounded-xl p-6 space-y-3">
        <Skeleton width="100%" height={120} className="rounded-full mx-auto" />
        <Skeleton width="60%" height={18} className="mx-auto" />
        <Skeleton width="80%" height={14} className="mx-auto" />
        <div className="mt-4 space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} width="100%" height={14} />
          ))}
        </div>
      </div>
      <div className="space-y-5">
        <div className="bg-ink-700 border border-ink-600/70 rounded-xl p-6 space-y-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} width="100%" height={14} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DecisionBanner({
  app,
  t,
  lang,
}: {
  app: DetailUnion;
  t: (typeof ADMIN_STRINGS)[keyof typeof ADMIN_STRINGS];
  lang: "en" | "ar";
}) {
  void lang;
  const approved = app.status === "APPROVED";
  const withdrawn = app.status === "WITHDRAWN";
  const decision = approved
    ? t.decisionApproved
    : withdrawn
      ? t.decisionWithdrawn
      : t.decisionRejected;
  return (
    <div
      className={`mb-6 p-4 rounded-lg border flex items-start gap-3 ${
        approved
          ? "bg-emerald-500/10 border-emerald-500/30"
          : withdrawn
            ? "bg-slate-500/10 border-slate-500/30"
            : "bg-red-500/10 border-red-500/30"
      }`}
    >
      <span
        className={
          approved
            ? "text-emerald-400"
            : withdrawn
              ? "text-slate-300"
              : "text-red-400"
        }
      >
        {approved ? <Check size={18} /> : <AlertTriangle size={18} />}
      </span>
      <div className="text-sm text-slate-200 flex-1">
        <div>
          {decision}
          {app.reviewedAt && (
            <>
              {" · "}
              <span className="text-slate-400">
                {format(new Date(app.reviewedAt), "PP")}
              </span>
            </>
          )}
        </div>
        {!approved && !withdrawn && app.rejectionReason && (
          <div className="mt-2 text-xs">
            <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
              {t.rejectionReason}
            </div>
            <div className="mt-1 text-slate-200">{app.rejectionReason}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function ApplicantCard({
  app,
  type,
  t,
  lang,
}: {
  app: DetailUnion;
  type: ApplicationType;
  t: (typeof ADMIN_STRINGS)[keyof typeof ADMIN_STRINGS];
  lang: "en" | "ar";
}) {
  void lang;
  // Academy applications don't include personal applicant fields — they carry only the coach reference.
  // Coach + Official have firstName/lastName/dob/etc.
  const isAcademy = type === "ACADEMY";
  const personal = !isAcademy
    ? (app as CoachApplicationDetail | OfficialApplicationDetail)
    : null;
  const academy = isAcademy ? (app as AcademyApplicationDetail) : null;

  // Academy applicant is the owning coach (applicantCoach* fields). Coach &
  // Official carry firstName/lastName directly.
  const fullName = personal
    ? `${personal.firstName} ${personal.lastName}`
    : academy
      ? `${academy.applicantCoachFirstName ?? ""} ${academy.applicantCoachLastName ?? ""}`.trim() ||
        "—"
      : "—";
  const applicantEmail = personal?.email ?? academy?.applicantCoachEmail ?? null;
  const applicantPhone = personal?.phone ?? academy?.applicantCoachPhone ?? null;
  const initials = (
    personal
      ? `${personal.firstName?.[0] ?? ""}${personal.lastName?.[0] ?? ""}`
      : academy
        ? `${academy.applicantCoachFirstName?.[0] ?? ""}${academy.applicantCoachLastName?.[0] ?? ""}`
        : ""
  ).toUpperCase();

  return (
    <aside className="bg-ink-700 border border-ink-600/70 rounded-xl p-6">
      <SectionHeader title={t.applicantInfo} />
      <div className="flex flex-col items-center text-center mb-5">
        <Avatar initials={initials} size={120} />
        <div className="text-base font-semibold text-white mt-3">
          {fullName}
        </div>
        {applicantEmail && (
          <div
            className="text-xs text-slate-400 mt-0.5 font-mono"
            style={{ direction: "ltr" }}
          >
            {applicantEmail}
          </div>
        )}
      </div>
      <div>
        {applicantPhone && (
          <InfoRow label={t.phone}>
            <span
              className="font-mono text-xs inline-block"
              style={{ direction: "ltr" }}
            >
              {applicantPhone}
            </span>
          </InfoRow>
        )}
        {personal && (
          <>
            {"dateOfBirth" in personal && personal.dateOfBirth && (
              <InfoRow label={t.dob}>
                {format(new Date(personal.dateOfBirth), "PP")}
              </InfoRow>
            )}
            {personal.gender && (
              <InfoRow label={t.gender}>
                {t[`gender${personal.gender}` as const]}
              </InfoRow>
            )}
            {personal.nationality && (
              <InfoRow label={t.nationality}>{personal.nationality}</InfoRow>
            )}
            {"cprNumber" in personal && personal.cprNumber && (
              <InfoRow label={t.cpr}>
                <span className="font-mono text-xs">{personal.cprNumber}</span>
              </InfoRow>
            )}
          </>
        )}
        <InfoRow label={t.appSubmittedOn}>
          {format(new Date(app.submittedAt), "PP")}
        </InfoRow>
      </div>
    </aside>
  );
}

function ApplicationFieldsCard({
  app,
  type,
  t,
  lang,
}: {
  app: DetailUnion;
  type: ApplicationType;
  t: (typeof ADMIN_STRINGS)[keyof typeof ADMIN_STRINGS];
  lang: "en" | "ar";
}) {
  void lang;
  return (
    <section className="bg-ink-700 border border-ink-600/70 rounded-xl p-6">
      <SectionHeader title={t.applicationDetails} />
      {type === "COACH" && <CoachFields app={app as CoachApplicationDetail} t={t} />}
      {type === "OFFICIAL" && (
        <OfficialFields app={app as OfficialApplicationDetail} t={t} />
      )}
      {type === "ACADEMY" && (
        <AcademyFields app={app as AcademyApplicationDetail} t={t} />
      )}
    </section>
  );
}

function CoachFields({
  app,
  t,
}: {
  app: CoachApplicationDetail;
  t: (typeof ADMIN_STRINGS)[keyof typeof ADMIN_STRINGS];
}) {
  return (
    <>
      <InfoRow label={t.certLevel}>{app.certificationLevel}</InfoRow>
      <InfoRow label={t.certNumber}>
        {app.certificationNumber && (
          <span className="font-mono text-xs">{app.certificationNumber}</span>
        )}
      </InfoRow>
      <InfoRow label={t.certDate}>
        {app.certificationDate && format(new Date(app.certificationDate), "PP")}
      </InfoRow>
      <InfoRow label={t.yearsExperience}>{app.yearsExperience}</InfoRow>
      <InfoRow label={t.specialization}>{app.specialization}</InfoRow>
      <InfoRow label={t.notes}>{app.notes}</InfoRow>
    </>
  );
}

function OfficialFields({
  app,
  t,
}: {
  app: OfficialApplicationDetail;
  t: (typeof ADMIN_STRINGS)[keyof typeof ADMIN_STRINGS];
}) {
  return (
    <>
      <InfoRow label={t.certLevel}>
        {app.certificationLevel &&
          t[`badge${app.certificationLevel}` as const]}
      </InfoRow>
      <InfoRow label={t.certExpiry}>
        {app.certificationExpiry &&
          format(new Date(app.certificationExpiry), "PP")}
      </InfoRow>
      <InfoRow label={t.specialization}>
        {app.specialization && t[`spec_${app.specialization}` as const]}
      </InfoRow>
      <InfoRow label={t.notes}>{app.notes}</InfoRow>
    </>
  );
}

function AcademyFields({
  app,
  t,
}: {
  app: AcademyApplicationDetail;
  t: (typeof ADMIN_STRINGS)[keyof typeof ADMIN_STRINGS];
}) {
  return (
    <>
      <InfoRow label={t.proposedName}>{app.proposedName}</InfoRow>
      <InfoRow label={t.proposedLocation}>{app.proposedLocation}</InfoRow>
      <InfoRow label={t.proposedPhone}>
        {app.proposedPhone && (
          <span
            className="font-mono text-xs inline-block"
            style={{ direction: "ltr" }}
          >
            {app.proposedPhone}
          </span>
        )}
      </InfoRow>
      <InfoRow label={t.proposedEmail}>
        {app.proposedEmail && (
          <span
            className="font-mono text-xs inline-block"
            style={{ direction: "ltr" }}
          >
            {app.proposedEmail}
          </span>
        )}
      </InfoRow>
      <InfoRow label={t.proposedEstablishedDate}>
        {app.proposedEstablishedDate &&
          format(new Date(app.proposedEstablishedDate), "PP")}
      </InfoRow>
      <InfoRow label={t.notes}>{app.notes}</InfoRow>
    </>
  );
}

function DocumentsCard({
  documents,
  t,
  lang,
}: {
  documents: DocumentSummary[];
  t: (typeof ADMIN_STRINGS)[keyof typeof ADMIN_STRINGS];
  lang: "en" | "ar";
}) {
  void lang;
  return (
    <section className="bg-ink-700 border border-ink-600/70 rounded-xl p-6">
      <SectionHeader title={t.documents} />
      {documents.length === 0 ? (
        <div className="text-sm text-slate-500 italic">—</div>
      ) : (
        <div className="space-y-2.5">
          {documents.map((d) => (
            <div
              key={d.documentId}
              className="flex items-center gap-3 p-3.5 bg-ink-800/40 border border-ink-600/70 rounded-lg"
            >
              <span className="w-10 h-10 rounded-md bg-flag/10 border border-flag/30 text-flag flex items-center justify-center shrink-0">
                <FileIcon size={18} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white font-medium truncate">
                  {d.fileName}
                </div>
                <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                  <span>{d.documentType}</span>
                  <span className="text-slate-600">·</span>
                  <span className="tabular-nums">
                    {(d.fileSizeBytes / 1024).toFixed(0)} KB
                  </span>
                  <span className="text-slate-600">·</span>
                  <span>{format(new Date(d.uploadedAt), "PP")}</span>
                </div>
              </div>
              <SecondaryButton
                className="shrink-0 !py-2 !px-3 text-xs"
                onClick={async () => {
                  try {
                    // Fetch the presigned URL via the auth-aware api client, then open it in a new tab.
                    const { url } = await getDocumentUrl(d.documentId);
                    if (url) window.open(url, "_blank", "noopener,noreferrer");
                  } catch {
                    toast.error(t.toastAppActionFailed);
                  }
                }}
              >
                <ExternalLink size={14} />
                {t.preview}
              </SecondaryButton>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children?: React.ReactNode;
}) {
  const hasContent =
    children != null && children !== "" && children !== undefined;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-4 py-2.5 border-b border-ink-600/40 last:border-0">
      <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
        {label}
      </div>
      <div className="text-sm text-slate-100">
        {hasContent ? children : <span className="text-slate-500 italic">—</span>}
      </div>
    </div>
  );
}
