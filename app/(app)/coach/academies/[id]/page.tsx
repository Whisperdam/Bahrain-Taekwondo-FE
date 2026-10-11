"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { isAxiosError } from "axios";
import { Building2, Check, UserPlus, X } from "lucide-react";
import { TopNav } from "@/components/dashboard/top-nav";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ErrorBanner } from "@/components/ui/error-banner";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { RadioGroup } from "@/components/ui/radio-group";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PlayerLink, UserLink } from "@/components/shared/person-link";
import { useAuth } from "@/hooks/use-auth";
import { useLangStore } from "@/lib/i18n/store";
import { COACH_STRINGS, type CoachStrings } from "@/lib/i18n/coach-strings";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  cancelInvite,
  changeCoachAccess,
  getAcademyCoaches,
  getMyAcademies,
  getPlayersByAcademy,
  getSentInvites,
  inviteCoach,
  leaveAcademy,
  releaseCoach,
  releasePlayer,
  searchUserByEmail,
} from "@/lib/coach/api";
import type { AcademyAccess, CoachMember, CoachPlayer, PublicUserSummary } from "@/types/coach";

const ACCESS_LEVELS: AcademyAccess[] = ["NONE", "VIEW", "EDIT"];

export default function ManageAcademyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = use(params);
  const academyId = Number(idStr);
  const router = useRouter();
  const qc = useQueryClient();
  const { user } = useAuth();
  const { lang } = useLangStore();
  const t = COACH_STRINGS[lang];

  const [inviting, setInviting] = useState(false);
  const [releasingCoach, setReleasingCoach] = useState<CoachMember | null>(null);
  const [releasingPlayer, setReleasingPlayer] = useState<CoachPlayer | null>(null);
  const [leaving, setLeaving] = useState(false);

  const academiesQ = useQuery({ queryKey: ["coach", "me", "academies"], queryFn: getMyAcademies });
  const academy = academiesQ.data?.find((a) => a.academyId === academyId);
  const isOwner = academy?.role === "OWNER";
  const canSeePlayers = !!academy && academy.access !== "NONE";

  const coachesQ = useQuery({
    queryKey: ["coach", "me", "academy", academyId, "coaches"],
    queryFn: () => getAcademyCoaches(academyId),
    enabled: !!academy,
  });
  const invitesQ = useQuery({
    queryKey: ["coach", "me", "academy", academyId, "invites"],
    queryFn: () => getSentInvites(academyId),
    enabled: isOwner,
  });
  const playersQ = useQuery({
    queryKey: ["coach", "me", "players", [academyId]],
    queryFn: () => getPlayersByAcademy(academyId),
    enabled: canSeePlayers,
  });

  function refresh() {
    qc.invalidateQueries({ queryKey: ["coach", "me"] });
  }

  const changeAccess = useMutation({
    mutationFn: (v: { coachId: number; access: AcademyAccess }) => changeCoachAccess(academyId, v.coachId, v.access),
    onSuccess: () => {
      toast.success(t.accessChanged);
      refresh();
    },
    onError: (err) => toast.error(getApiErrorMessage(err, t.actionFailed)),
  });
  const cancel = useMutation({
    mutationFn: (inviteId: number) => cancelInvite(inviteId),
    onSuccess: () => {
      toast.success(t.inviteCancelled);
      refresh();
    },
    onError: (err) => toast.error(getApiErrorMessage(err, t.actionFailed)),
  });
  const releaseC = useMutation({
    mutationFn: (m: CoachMember) => releaseCoach(academyId, m.coachId),
    onSuccess: () => {
      toast.success(t.coachReleased);
      setReleasingCoach(null);
      refresh();
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, t.actionFailed));
      setReleasingCoach(null);
    },
  });
  const releaseP = useMutation({
    mutationFn: (p: CoachPlayer) => releasePlayer(p.playerId),
    onSuccess: () => {
      toast.success(t.playerReleased);
      setReleasingPlayer(null);
      refresh();
    },
    onError: (err) => {
      // the server says why, e.g. the player is still entered in a tournament
      toast.error(getApiErrorMessage(err, t.releaseFailed));
      setReleasingPlayer(null);
    },
  });
  const leave = useMutation({
    mutationFn: leaveAcademy,
    onSuccess: () => {
      toast.success(t.leftAcademy);
      setLeaving(false);
      refresh();
      router.push("/coach");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, t.actionFailed));
      setLeaving(false);
    },
  });

  if (!user) return null;

  const notMine = !academiesQ.isLoading && !academy;
  const members = coachesQ.data ?? [];
  const sent = invitesQ.data ?? [];
  const players = playersQ.data ?? [];

  return (
    <>
      <TopNav user={user} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-6">
        <PageHeader
          title={academy?.academyName ?? ""}
          subtitle={academy ? t.manageSub : undefined}
          back={{ label: t.backToCoach, onClick: () => router.push("/coach") }}
          action={
            academy && !isOwner ? (
              <SecondaryButton onClick={() => setLeaving(true)}>{t.leaveAcademy}</SecondaryButton>
            ) : undefined
          }
        />

        {academiesQ.isLoading && <Skeleton width="100%" height={200} />}
        {academiesQ.isError && (
          <ErrorState message={t.actionFailed} retryLabel={t.retry} onRetry={() => academiesQ.refetch()} />
        )}
        {notMine && (
          <EmptyState
            icon={Building2}
            title={t.noAcademiesTitle}
            action={
              <PrimaryButton type="button" onClick={() => router.push("/coach")} className="w-auto px-5">
                {t.backToCoach}
              </PrimaryButton>
            }
          />
        )}

        {academy && (
          <div className="space-y-8">
            {academy.access === "NONE" && (
              <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-100">
                {t.noAccessNote}
              </p>
            )}
            {!isOwner && <p className="text-xs text-slate-500">{t.ownerOnlyNote}</p>}

            {/* ── Coaches ── */}
            <section>
              <SectionHeader
                title={t.coachesTitle}
                action={
                  isOwner ? (
                    <PrimaryButton
                      type="button"
                      onClick={() => setInviting(true)}
                      className="!py-2 !px-3.5 text-xs w-auto"
                    >
                      <UserPlus size={14} />
                      {t.inviteCoach}
                    </PrimaryButton>
                  ) : undefined
                }
              />
              <div className="bg-ink-700 border border-ink-600/70 rounded-xl overflow-hidden">
                {coachesQ.isLoading && <Skeleton width="100%" height={64} />}
                {members.map((m) => (
                  <div
                    key={m.coachId}
                    className="flex flex-wrap items-center gap-3 px-5 py-3 border-t border-ink-600/60 first:border-0"
                  >
                    <Avatar initials={m.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()} size={36} />
                    <div className="flex-1 min-w-[160px]">
                      <div className="text-sm text-white font-medium">
                        <UserLink userId={m.userId}>{m.name}</UserLink>
                      </div>
                      <div className="text-xs text-slate-500">{m.beltName}</div>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.12em] font-medium border border-flag/40 bg-flag/10 text-flag rounded px-1.5 py-0.5">
                      {m.role === "OWNER" ? t.roleOwner : t.roleCoach}
                    </span>
                    {m.role === "COACH" && isOwner ? (
                      <>
                        <div className="w-40">
                          <Select
                            value={m.access}
                            aria-label={t.changeAccess}
                            disabled={changeAccess.isPending}
                            onChange={(e) =>
                              changeAccess.mutate({ coachId: m.coachId, access: e.target.value as AcademyAccess })
                            }
                          >
                            {ACCESS_LEVELS.map((a) => (
                              <option key={a} value={a}>
                                {t[`access${a}` as const]}
                              </option>
                            ))}
                          </Select>
                        </div>
                        <SecondaryButton onClick={() => setReleasingCoach(m)}>{t.releaseCoach}</SecondaryButton>
                      </>
                    ) : (
                      m.role === "COACH" && <span className="text-xs text-slate-400">{t[`access${m.access}` as const]}</span>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* ── Invitations waiting (owner) ── */}
            {isOwner && (
              <section>
                <SectionHeader title={t.invitesTitle} />
                <div className="bg-ink-700 border border-ink-600/70 rounded-xl overflow-hidden">
                  {sent.length === 0 && <p className="px-5 py-4 text-sm text-slate-500">{t.noPendingInvites}</p>}
                  {sent.map((i) => (
                    <div
                      key={i.inviteId}
                      className="flex flex-wrap items-center gap-3 px-5 py-3 border-t border-ink-600/60 first:border-0"
                    >
                      <div className="flex-1 min-w-[160px]">
                        <div className="text-sm text-white">{i.coachName}</div>
                        <div className="text-xs text-slate-500">
                          {t[`access${i.access}` as const]} · {t.inviteExpires(format(new Date(i.expiresAt), "PP"))}
                        </div>
                      </div>
                      <SecondaryButton onClick={() => cancel.mutate(i.inviteId)} disabled={cancel.isPending}>
                        {t.cancelInvite}
                      </SecondaryButton>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── Players ── */}
            {canSeePlayers && (
              <section>
                <SectionHeader
                  title={`${t.playersTitle} · ${players.length}`}
                  action={
                    academy.access === "EDIT" ? (
                      <PrimaryButton
                        type="button"
                        onClick={() => router.push("/coach/players/add")}
                        className="!py-2 !px-3.5 text-xs w-auto"
                      >
                        {t.addPlayer}
                      </PrimaryButton>
                    ) : undefined
                  }
                />
                <div className="bg-ink-700 border border-ink-600/70 rounded-xl overflow-hidden">
                  {playersQ.isLoading && <Skeleton width="100%" height={64} />}
                  {!playersQ.isLoading && players.length === 0 && (
                    <p className="px-5 py-4 text-sm text-slate-500">{t.noPlayersTitle}</p>
                  )}
                  {players.map((p) => (
                    <div
                      key={p.playerId}
                      className="flex flex-wrap items-center gap-3 px-5 py-3 border-t border-ink-600/60 first:border-0"
                    >
                      <Avatar initials={`${p.firstName?.[0] ?? ""}${p.lastName?.[0] ?? ""}`.toUpperCase()} size={32} />
                      <div className="flex-1 min-w-[160px]">
                        <div className="text-sm text-white font-medium">
                          <PlayerLink playerId={p.playerId}>
                            {p.firstName} {p.lastName}
                          </PlayerLink>
                        </div>
                        <div className="text-xs text-slate-500">{p.beltName}</div>
                      </div>
                      {isOwner && p.status === "ACTIVE" && (
                        <SecondaryButton onClick={() => setReleasingPlayer(p)}>{t.releasePlayer}</SecondaryButton>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {inviting && academy && (
        <InviteCoachModal
          academyId={academyId}
          t={t}
          onClose={() => setInviting(false)}
          onSent={() => {
            setInviting(false);
            refresh();
          }}
        />
      )}

      <ConfirmModal
        open={!!releasingCoach}
        onClose={() => setReleasingCoach(null)}
        onConfirm={() => releasingCoach && releaseC.mutate(releasingCoach)}
        title={t.releaseCoachTitle}
        body={releasingCoach ? t.releaseCoachBody(releasingCoach.name) : undefined}
        confirmLabel={t.releaseCoach}
        cancelLabel={t.cancel}
        loading={releaseC.isPending}
        loadingLabel={t.working}
        danger
      />
      <ConfirmModal
        open={!!releasingPlayer}
        onClose={() => setReleasingPlayer(null)}
        onConfirm={() => releasingPlayer && releaseP.mutate(releasingPlayer)}
        title={t.releasePlayerTitle}
        body={releasingPlayer ? t.releasePlayerBody(`${releasingPlayer.firstName} ${releasingPlayer.lastName}`) : undefined}
        confirmLabel={t.releasePlayer}
        cancelLabel={t.cancel}
        loading={releaseP.isPending}
        loadingLabel={t.working}
        danger
      />
      <ConfirmModal
        open={leaving}
        onClose={() => setLeaving(false)}
        onConfirm={() => leave.mutate()}
        title={t.leaveTitle}
        body={t.leaveBody}
        confirmLabel={t.leaveAcademy}
        cancelLabel={t.cancel}
        loading={leave.isPending}
        loadingLabel={t.working}
        danger
      />
    </>
  );
}

// ─── Invite a coach ──────────────────────────────────────────────────────────

function InviteCoachModal({
  academyId,
  t,
  onClose,
  onSent,
}: {
  academyId: number;
  t: CoachStrings;
  onClose: () => void;
  onSent: () => void;
}) {
  const [email, setEmail] = useState("");
  const [found, setFound] = useState<PublicUserSummary | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [access, setAccess] = useState<AcademyAccess>("VIEW");
  const [error, setError] = useState<string | null>(null);

  const search = useMutation({
    mutationFn: () => searchUserByEmail(email.trim()),
    onSuccess: (u) => {
      setFound(u);
      setNotFound(false);
      setError(null);
    },
    onError: (err) => {
      setFound(null);
      if (isAxiosError(err) && err.response?.status === 404) setNotFound(true);
      else setError(getApiErrorMessage(err, t.actionFailed));
    },
  });
  const send = useMutation({
    mutationFn: () => inviteCoach(academyId, { userId: found!.userId, access }),
    onSuccess: () => {
      toast.success(t.inviteSent);
      onSent();
    },
    onError: (err) => setError(getApiErrorMessage(err, t.actionFailed)),
  });

  const eligible = found?.coachState === "FREE";

  return (
    <Modal
      open
      onClose={() => !send.isPending && onClose()}
      title={t.inviteCoach}
      dismissible={!send.isPending}
      footer={
        <>
          <SecondaryButton onClick={onClose} disabled={send.isPending}>
            {t.cancel}
          </SecondaryButton>
          <PrimaryButton
            type="button"
            onClick={() => {
              setError(null);
              send.mutate();
            }}
            disabled={!eligible}
            loading={send.isPending}
            loadingText={t.sending}
            className="w-auto px-4"
          >
            {t.sendInvite}
          </PrimaryButton>
        </>
      }
    >
      <p className="text-xs text-slate-400 mb-3">{t.inviteCoachSub}</p>
      {error && <ErrorBanner>{error}</ErrorBanner>}
      <Field id="ic-email" label={t.emailLabel}>
        <div className="flex gap-2">
          <Input
            id="ic-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.searchUserPh}
            autoComplete="off"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (email.trim()) search.mutate();
              }
            }}
          />
          <PrimaryButton
            type="button"
            onClick={() => email.trim() && search.mutate()}
            loading={search.isPending}
            loadingText={t.searching}
            className="!w-auto px-4 shrink-0"
          >
            {t.search}
          </PrimaryButton>
        </div>
      </Field>

      {notFound && <p className="text-sm text-red-300">{t.searchNotFound}</p>}

      {found && (
        <div className="mt-2 rounded-lg border border-ink-600 p-3 flex items-center gap-3">
          <Avatar
            initials={`${found.firstName?.[0] ?? ""}${found.lastName?.[0] ?? ""}`.toUpperCase()}
            photoUrl={found.profilePhotoUrl}
            size={40}
          />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">{found.fullName}</div>
            <div
              className={`text-xs inline-flex items-center gap-1 ${eligible ? "text-emerald-300" : "text-amber-300"}`}
            >
              {eligible ? <Check size={12} /> : <X size={12} />}
              {found.coachState === "FREE"
                ? t.coachFree
                : found.coachState === "TIED"
                  ? t.coachTied
                  : t.notACoach}
            </div>
          </div>
        </div>
      )}

      {eligible && (
        <div className="mt-4">
          <div className="text-sm font-medium text-slate-200 mb-2">{t.chooseAccess}</div>
          <RadioGroup<AcademyAccess>
            name="invite-access"
            value={access}
            onChange={setAccess}
            options={ACCESS_LEVELS.map((a) => ({ value: a, label: t[`access${a}` as const] }))}
          />
          <p className="text-xs text-slate-400 mt-2">{t[`accessHelp${access}` as const]}</p>
        </div>
      )}
    </Modal>
  );
}
