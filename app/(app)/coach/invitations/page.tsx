"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { Building2, MailOpen } from "lucide-react";
import { TopNav } from "@/components/dashboard/top-nav";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useLangStore } from "@/lib/i18n/store";
import { COACH_STRINGS } from "@/lib/i18n/coach-strings";
import { getApiErrorMessage } from "@/lib/api/errors";
import { acceptInvitation, declineInvitation, getMyInvitations } from "@/lib/coach/api";

export default function CoachInvitationsPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { user } = useAuth();
  const { lang } = useLangStore();
  const t = COACH_STRINGS[lang];

  const listQ = useQuery({ queryKey: ["coach", "me", "invitations"], queryFn: getMyInvitations });

  function refresh() {
    qc.invalidateQueries({ queryKey: ["coach", "me"] });
  }

  const accept = useMutation({
    mutationFn: (id: number) => acceptInvitation(id),
    onSuccess: (academy) => {
      toast.success(t.accepted(academy.academyName));
      refresh();
      router.push(`/coach/academies/${academy.academyId}`);
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, t.alreadyTied));
      refresh();
    },
  });
  const decline = useMutation({
    mutationFn: (id: number) => declineInvitation(id),
    onSuccess: () => {
      toast.success(t.declined);
      refresh();
    },
    onError: (err) => toast.error(getApiErrorMessage(err, t.actionFailed)),
  });

  if (!user) return null;
  const invites = listQ.data ?? [];
  const busy = accept.isPending || decline.isPending;

  return (
    <>
      <TopNav user={user} />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-6">
        <PageHeader
          title={t.invitationsTitle}
          subtitle={t.invitationsSub}
          back={{ label: t.backToCoach, onClick: () => router.push("/coach") }}
        />

        {listQ.isLoading && (
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <Skeleton key={i} width="100%" height={96} />
            ))}
          </div>
        )}
        {listQ.isError && (
          <ErrorState message={t.actionFailed} retryLabel={t.retry} onRetry={() => listQ.refetch()} />
        )}
        {!listQ.isLoading && !listQ.isError && invites.length === 0 && (
          <EmptyState icon={MailOpen} title={t.noInvitations} />
        )}

        <div className="space-y-3">
          {invites.map((i) => (
            <div key={i.inviteId} className="bg-ink-700 border border-ink-600/70 rounded-xl p-5 flex flex-wrap items-center gap-4">
              <span className="shrink-0 w-11 h-11 rounded-lg bg-flag/10 border border-flag/30 text-flag flex items-center justify-center">
                <Building2 size={20} />
              </span>
              <div className="flex-1 min-w-[200px]">
                <div className="text-sm font-semibold text-white">{i.academyName}</div>
                {i.invitedByName && <div className="text-xs text-slate-400 mt-0.5">{t.invitedBy(i.invitedByName)}</div>}
                <div className="text-xs text-slate-300 mt-1.5">
                  {t[`access${i.access}` as const]} — {t[`accessHelp${i.access}` as const]}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">{t.inviteExpires(format(new Date(i.expiresAt), "PP"))}</div>
              </div>
              <div className="flex items-center gap-2">
                <SecondaryButton onClick={() => decline.mutate(i.inviteId)} disabled={busy}>
                  {t.decline}
                </SecondaryButton>
                <PrimaryButton
                  type="button"
                  onClick={() => accept.mutate(i.inviteId)}
                  disabled={busy}
                  loading={accept.isPending && accept.variables === i.inviteId}
                  loadingText={t.working}
                  className="w-auto px-4"
                >
                  {t.accept}
                </PrimaryButton>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
