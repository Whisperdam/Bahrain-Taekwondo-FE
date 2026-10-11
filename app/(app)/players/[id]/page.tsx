"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { format, parseISO } from "date-fns";
import { Lock, Medal, UserRound } from "lucide-react";
import { TopNav } from "@/components/dashboard/top-nav";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { Skeleton } from "@/components/ui/skeleton";
import { InfoRow } from "@/components/admin/info-row";
import { DocumentsCard } from "@/components/admin/documents-card";
import { AcademyLink } from "@/components/shared/person-link";
import { useAuth } from "@/hooks/use-auth";
import { useLangStore } from "@/lib/i18n/store";
import { PEOPLE_STRINGS, type PeopleStrings } from "@/lib/i18n/people-strings";
import { ADMIN_STRINGS } from "@/lib/i18n/admin-strings";
import { fetchPlayerProfile } from "@/lib/people/api";
import { adminReleasePlayer, getPlayerMembershipHistory, getPlayerReviewDetail } from "@/lib/admin/api";
import { getCoachPlayer, getMyAcademies, releasePlayer } from "@/lib/coach/api";
import { getApiErrorMessage } from "@/lib/api/errors";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { MembershipHistory } from "@/components/admin/membership-history";
import type { DocumentSummary } from "@/types/applications";

/** The private fields, whichever audience's view they came from. */
interface PrivateView {
  dateOfBirth: string | null;
  gender: "MALE" | "FEMALE" | null;
  nationality: string | null;
  /** Full for admins, masked for the coach: shown exactly as received. */
  nationalId: string | null;
  phone: string | null;
  email: string | null;
  emergencyContact: string | null;
  weight: number | null;
  height: number | null;
  bloodType: string | null;
  status: string | null;
  registrationDate: string | null;
  account: string | null;
  pendingReview: boolean;
  academyId: number | null;
  name: string;
  documents: DocumentSummary[] | null;
}

export default function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = use(params);
  const id = Number(idStr);
  const router = useRouter();
  const { user } = useAuth();
  const { lang } = useLangStore();
  const t = PEOPLE_STRINGS[lang];

  const profileQ = useQuery({
    queryKey: ["players", "profile", id],
    queryFn: () => fetchPlayerProfile(id),
    enabled: Number.isFinite(id),
    retry: (count, err) => !(isAxiosError(err) && err.response?.status === 404) && count < 2,
  });

  if (!user) return null;

  const profile = profileQ.data;
  const notFound = isAxiosError(profileQ.error) && profileQ.error.response?.status === 404;
  const isAdmin = user.roles.includes("ROLE_ADMIN");

  return (
    <>
      <TopNav user={user} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-6">
        <PageHeader title={profile ? `${profile.firstName} ${profile.lastName}` : ""} back={{ label: t.back, onClick: () => router.back() }} />

        {profileQ.isLoading && <PageSkeleton />}

        {notFound && (
          <EmptyState
            icon={UserRound}
            title={t.playerNotFound}
            body={t.playerNotFoundBody}
            action={
              <PrimaryButton type="button" onClick={() => router.back()} className="w-auto px-5">
                {t.back}
              </PrimaryButton>
            }
          />
        )}

        {profileQ.isError && !notFound && (
          <ErrorState message={t.loadFailed} retryLabel={t.retry} onRetry={() => profileQ.refetch()} />
        )}

        {profile && (
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
            <aside className="bg-ink-700 border border-ink-600/70 rounded-xl p-6 self-start">
              <div className="flex flex-col items-center text-center mb-5">
                <Avatar
                  initials={`${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase()}
                  photoUrl={profile.profilePhotoUrl}
                  size={120}
                />
                <div className="text-base font-semibold text-white mt-3">
                  {profile.firstName} {profile.lastName}
                </div>
              </div>
              <div>
                <InfoRow label={t.academy}>
                  {profile.academyId != null && profile.academyName ? (
                    <AcademyLink academyId={profile.academyId}>{profile.academyName}</AcademyLink>
                  ) : (
                    <span className="text-slate-300">{t.noAcademy}</span>
                  )}
                </InfoRow>
                <InfoRow label={t.belt}>{profile.beltName}</InfoRow>
                <InfoRow label={t.rankingPoints}>
                  <span className="tabular-nums">{profile.rankingPoints}</span>
                </InfoRow>
              </div>
            </aside>

            <div className="space-y-5">
              <MedalsCard profile={profile} t={t} />
              {profile.canViewPrivate && <PrivateDetails playerId={id} isAdmin={isAdmin} lang={lang} t={t} />}
            </div>
          </div>
        )}
      </main>
    </>
  );
}

// ─── Medals ──────────────────────────────────────────────────────────────────

function MedalsCard({
  profile,
  t,
}: {
  profile: { goldMedals: number; silverMedals: number; bronzeMedals: number };
  t: PeopleStrings;
}) {
  const total = profile.goldMedals + profile.silverMedals + profile.bronzeMedals;
  const cells = [
    { label: t.gold, value: profile.goldMedals, tone: "text-amber-300 bg-amber-500/10 border-amber-500/30" },
    { label: t.silver, value: profile.silverMedals, tone: "text-slate-200 bg-slate-400/10 border-slate-400/30" },
    { label: t.bronze, value: profile.bronzeMedals, tone: "text-orange-300 bg-orange-500/10 border-orange-500/30" },
  ];
  return (
    <section className="bg-ink-700 border border-ink-600/70 rounded-xl p-6">
      <SectionHeader title={t.medals} />
      {total === 0 ? (
        <p className="text-sm text-slate-500 italic">{t.noMedals}</p>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {cells.map((c) => (
            <div key={c.label} className={`rounded-lg border px-4 py-3 text-center ${c.tone}`}>
              <Medal size={18} className="mx-auto mb-1.5" />
              <div className="text-2xl font-semibold tabular-nums">{c.value}</div>
              <div className="text-[11px] uppercase tracking-[0.14em] opacity-80">{c.label}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Private details: the admin's or the coach's own view ────────────────────

function PrivateDetails({
  playerId,
  isAdmin,
  lang,
  t,
}: {
  playerId: number;
  isAdmin: boolean;
  lang: "en" | "ar";
  t: PeopleStrings;
}) {
  const adminT = ADMIN_STRINGS[lang];
  const router = useRouter();
  const qc = useQueryClient();
  const [confirmRelease, setConfirmRelease] = useState(false);

  // a coach may release only the players of academies they own
  const myAcademiesQ = useQuery({
    queryKey: ["coach", "me", "academies"],
    queryFn: getMyAcademies,
    enabled: !isAdmin,
  });
  const historyQ = useQuery({
    queryKey: ["players", "history", playerId],
    queryFn: () => getPlayerMembershipHistory(playerId),
    enabled: isAdmin,
  });
  const release = useMutation({
    mutationFn: () => (isAdmin ? adminReleasePlayer(playerId) : releasePlayer(playerId)),
    onSuccess: () => {
      toast.success(t.released);
      setConfirmRelease(false);
      qc.invalidateQueries({ queryKey: ["players"] });
      qc.invalidateQueries({ queryKey: ["coach", "me"] });
    },
    onError: (err) => {
      // the server says why, for example that the player is still entered in a tournament
      toast.error(getApiErrorMessage(err, t.releaseFailed));
      setConfirmRelease(false);
    },
  });

  // Admins read the admin view (full ID, documents); a coach reads the coach view (ID masked).
  // The server checks again, so asking for the wrong one just fails.
  const q = useQuery<PrivateView>({
    queryKey: ["players", "private", isAdmin ? "admin" : "coach", playerId],
    queryFn: async () => {
      if (isAdmin) {
        const d = await getPlayerReviewDetail(playerId);
        return {
          dateOfBirth: d.dateOfBirth,
          gender: d.gender,
          nationality: d.nationality,
          nationalId: d.cprNumber,
          phone: d.phone,
          email: d.email,
          emergencyContact: null,
          weight: null,
          height: null,
          bloodType: null,
          status: d.playerStatus,
          registrationDate: d.registrationDate,
          account: d.username ? `${d.username}${d.userEmail ? ` · ${d.userEmail}` : ""}` : null,
          pendingReview: d.reviewStatus === "PENDING",
          academyId: d.academyId,
          name: `${d.firstName} ${d.lastName}`,
          documents: d.documents,
        };
      }
      const c = await getCoachPlayer(playerId);
      return {
        dateOfBirth: c.dateOfBirth,
        gender: c.gender,
        nationality: c.nationality,
        nationalId: c.cprMasked,
        phone: c.phone,
        email: c.email,
        emergencyContact: [c.emergencyContactName, c.emergencyContactPhone].filter(Boolean).join(" · ") || null,
        weight: c.weight,
        height: c.height,
        bloodType: c.bloodType,
        status: c.status,
        registrationDate: c.registrationDate,
        account: null,
        pendingReview: false,
        academyId: c.academyId,
        name: `${c.firstName} ${c.lastName}`,
        documents: null,
      };
    },
  });

  const d = q.data;
  const canRelease =
    !!d && d.status === "ACTIVE" && d.academyId != null &&
    (isAdmin || (myAcademiesQ.data ?? []).some((a) => a.academyId === d.academyId && a.role === "OWNER"));
  const birthYear = d?.dateOfBirth ? Number(d.dateOfBirth.slice(0, 4)) : null;

  return (
    <>
      <section className="bg-ink-700 border border-flag/30 rounded-xl p-6">
        <SectionHeader
          title={t.privateTitle}
          action={
            <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
              <Lock size={12} />
              {isAdmin ? t.privateNoteAdmin : t.privateNoteCoach}
            </span>
          }
        />
        {q.isLoading && <Skeleton width="100%" height={160} />}
        {q.isError && <p className="text-sm text-red-300">{t.privateLoadFailed}</p>}
        {d && (
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-8">
            <div>
              <InfoRow label={t.dob}>
                {d.dateOfBirth && (
                  <>
                    {format(parseISO(d.dateOfBirth), "PP")}
                    {birthYear != null && (
                      <span className="block text-xs text-slate-500">
                        {t.age(new Date().getFullYear() - birthYear)}
                      </span>
                    )}
                  </>
                )}
              </InfoRow>
              <InfoRow label={t.gender}>{d.gender && t[`gender${d.gender}` as const]}</InfoRow>
              <InfoRow label={t.nationality}>{d.nationality}</InfoRow>
              <InfoRow label={t.nationalId}>
                {d.nationalId && <span className="font-mono text-xs">{d.nationalId}</span>}
              </InfoRow>
              <InfoRow label={t.status}>{d.status}</InfoRow>
              <InfoRow label={t.registeredOn}>
                {d.registrationDate && format(parseISO(d.registrationDate), "PP")}
              </InfoRow>
            </div>
            <div>
              <InfoRow label={t.phone}>
                {d.phone && (
                  <span className="font-mono text-xs inline-block" style={{ direction: "ltr" }}>
                    {d.phone}
                  </span>
                )}
              </InfoRow>
              <InfoRow label={t.email}>
                {d.email && (
                  <span className="font-mono text-xs inline-block" style={{ direction: "ltr" }}>
                    {d.email}
                  </span>
                )}
              </InfoRow>
              {!isAdmin && (
                <>
                  <InfoRow label={t.emergencyContact}>{d.emergencyContact}</InfoRow>
                  <InfoRow label={t.weight}>{d.weight != null && `${d.weight} kg`}</InfoRow>
                  <InfoRow label={t.height}>{d.height != null && `${d.height} cm`}</InfoRow>
                  <InfoRow label={t.bloodType}>{d.bloodType}</InfoRow>
                </>
              )}
              {isAdmin && <InfoRow label={t.account}>{d.account}</InfoRow>}
            </div>
          </div>
        )}
        {canRelease && (
          <div className="mt-4">
            <SecondaryButton type="button" onClick={() => setConfirmRelease(true)}>
              {t.releaseAction}
            </SecondaryButton>
          </div>
        )}
        {d?.pendingReview && (
          <div className="mt-4">
            <SecondaryButton type="button" onClick={() => router.push(`/admin/players/${playerId}`)}>
              {t.openReview}
            </SecondaryButton>
          </div>
        )}
      </section>

      {isAdmin && d?.documents && <DocumentsCard documents={d.documents} t={adminT} />}
      {isAdmin && (
        <MembershipHistory events={historyQ.data} loading={historyQ.isLoading} failed={historyQ.isError} t={t} />
      )}

      <ConfirmModal
        open={confirmRelease}
        onClose={() => setConfirmRelease(false)}
        onConfirm={() => release.mutate()}
        title={t.releaseTitle}
        body={d ? t.releaseBody(d.name) : undefined}
        confirmLabel={t.releaseAction}
        cancelLabel={t.cancel}
        loading={release.isPending}
        loadingLabel={t.working}
        danger
      />
    </>
  );
}

function PageSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
      <Skeleton width="100%" height={320} />
      <Skeleton width="100%" height={220} />
    </div>
  );
}
