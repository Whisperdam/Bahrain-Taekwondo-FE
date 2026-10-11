"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { format } from "date-fns";
import { Lock, UserRound } from "lucide-react";
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
import { AcademyLink } from "@/components/shared/person-link";
import { useAuth } from "@/hooks/use-auth";
import { useLangStore } from "@/lib/i18n/store";
import { PEOPLE_STRINGS } from "@/lib/i18n/people-strings";
import { ADMIN_STRINGS } from "@/lib/i18n/admin-strings";
import { fetchUserProfile } from "@/lib/people/api";
import { adminReleaseCoach, getAdminUser, getCoachMembershipHistory } from "@/lib/admin/api";
import { getApiErrorMessage } from "@/lib/api/errors";
import { MembershipHistory } from "@/components/admin/membership-history";

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center text-[10px] uppercase tracking-[0.14em] font-medium border border-flag/40 bg-flag/10 text-flag rounded px-1.5 py-0.5">
      {children}
    </span>
  );
}

/**
 * The page of a coach or an official (and the account of a player). Everyone signed in sees the public
 * part; admins also get the account details.
 */
export default function UserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = use(params);
  const id = Number(idStr);
  const router = useRouter();
  const { user } = useAuth();
  const { lang } = useLangStore();
  const t = PEOPLE_STRINGS[lang];
  const adminT = ADMIN_STRINGS[lang];

  const profileQ = useQuery({
    queryKey: ["users", "profile", id],
    queryFn: () => fetchUserProfile(id),
    enabled: Number.isFinite(id),
    retry: (count, err) => !(isAxiosError(err) && err.response?.status === 404) && count < 2,
  });
  const profile = profileQ.data;

  // Only admins are told they may (canViewPrivate), and only then is the admin view asked for.
  const accountQ = useQuery({
    queryKey: ["users", "account", id],
    queryFn: () => getAdminUser(id),
    enabled: !!profile?.canViewPrivate,
  });

  const qc = useQueryClient();
  const historyQ = useQuery({
    queryKey: ["users", "coach-history", id],
    queryFn: () => getCoachMembershipHistory(id),
    enabled: !!profile?.canViewPrivate && !!profile?.coach,
  });
  const releaseCoach = useMutation({
    mutationFn: () => adminReleaseCoach(id),
    onSuccess: () => {
      toast.success(t.coachReleasedAdmin);
      qc.invalidateQueries({ queryKey: ["users", "coach-history", id] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, t.releaseFailed)),
  });

  if (!user) return null;

  const notFound = isAxiosError(profileQ.error) && profileQ.error.response?.status === 404;
  const account = accountQ.data;

  return (
    <>
      <TopNav user={user} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-6">
        <PageHeader
          title={profile ? `${profile.firstName} ${profile.lastName}` : ""}
          back={{ label: t.back, onClick: () => router.back() }}
        />

        {profileQ.isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
            <Skeleton width="100%" height={280} />
            <Skeleton width="100%" height={200} />
          </div>
        )}

        {notFound && (
          <EmptyState
            icon={UserRound}
            title={t.userNotFound}
            body={t.userNotFoundBody}
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
              <div className="flex flex-col items-center text-center">
                <Avatar
                  initials={`${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase()}
                  photoUrl={profile.profilePhotoUrl}
                  size={120}
                />
                <div className="text-base font-semibold text-white mt-3">
                  {profile.firstName} {profile.lastName}
                </div>
                <div className="mt-2 flex items-center justify-center gap-1.5 flex-wrap">
                  {profile.coach && <Badge>{t.coachBadge}</Badge>}
                  {profile.official && <Badge>{t.officialBadge}</Badge>}
                  {profile.playerId != null && <Badge>{t.playerBadge}</Badge>}
                </div>
              </div>
            </aside>

            <div className="space-y-5">
              {profile.coach && (
                <section className="bg-ink-700 border border-ink-600/70 rounded-xl p-6">
                  <SectionHeader title={t.coachBadge} />
                  <InfoRow label={t.belt}>{profile.coachBeltName}</InfoRow>
                  <InfoRow label={t.ownedAcademies}>
                    {profile.academies.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {profile.academies.map((a) => (
                          <AcademyLink key={a.academyId} academyId={a.academyId}>
                            {a.academyName}
                          </AcademyLink>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">{t.noAcademies}</span>
                    )}
                  </InfoRow>
                </section>
              )}

              {profile.official && (
                <section className="bg-ink-700 border border-ink-600/70 rounded-xl p-6">
                  <SectionHeader title={t.officialDetails} />
                  <InfoRow label={t.specialization}>{profile.officialSpecialization}</InfoRow>
                  <InfoRow label={t.certification}>{profile.officialCertificationLevel}</InfoRow>
                </section>
              )}

              {profile.playerId != null && (
                <section className="bg-ink-700 border border-ink-600/70 rounded-xl p-6">
                  <SectionHeader title={t.playerBadge} />
                  <SecondaryButton type="button" onClick={() => router.push(`/players/${profile.playerId}`)}>
                    {t.viewPlayer}
                  </SecondaryButton>
                </section>
              )}

              {profile.canViewPrivate && profile.coach && (
                <>
                  <div>
                    <SecondaryButton type="button" onClick={() => releaseCoach.mutate()} disabled={releaseCoach.isPending}>
                      {t.releaseCoachAdmin}
                    </SecondaryButton>
                  </div>
                  <MembershipHistory events={historyQ.data} loading={historyQ.isLoading} failed={historyQ.isError} t={t} />
                </>
              )}

              {profile.canViewPrivate && (
                <section className="bg-ink-700 border border-flag/30 rounded-xl p-6">
                  <SectionHeader
                    title={t.accountTitle}
                    action={
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Lock size={12} />
                        {t.accountNote}
                      </span>
                    }
                  />
                  {accountQ.isLoading && <Skeleton width="100%" height={120} />}
                  {accountQ.isError && <p className="text-sm text-red-300">{t.privateLoadFailed}</p>}
                  {account && (
                    <div>
                      <InfoRow label={t.username}>{account.username}</InfoRow>
                      <InfoRow label={t.email}>
                        <span className="font-mono text-xs inline-block" style={{ direction: "ltr" }}>
                          {account.email}
                        </span>
                      </InfoRow>
                      <InfoRow label={t.roles}>
                        <div className="flex flex-wrap gap-1">
                          {account.roles.map((r) => (
                            <Badge key={r}>{adminT[`role_${r}` as const]}</Badge>
                          ))}
                        </div>
                      </InfoRow>
                      <InfoRow label={t.accountStatus}>{account.status}</InfoRow>
                      <InfoRow label={t.lastLogin}>
                        {account.lastLogin ? format(new Date(account.lastLogin), "PPp") : t.never}
                      </InfoRow>
                    </div>
                  )}
                </section>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
