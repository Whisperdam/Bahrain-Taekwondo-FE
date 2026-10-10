"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { format, parseISO } from "date-fns";
import { Pencil } from "lucide-react";
import { TopNav } from "@/components/dashboard/top-nav";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { Avatar } from "@/components/ui/avatar";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ErrorState } from "@/components/ui/error-state";
import { PhotoUploadModal } from "@/components/profile/photo-upload-modal";
import {
  DetailsModal,
  EmailModal,
  NameModal,
  PasswordModal,
  UsernameModal,
} from "@/components/profile/profile-editors";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/lib/auth/store";
import { useLangStore } from "@/lib/i18n/store";
import { PORTAL_STRINGS } from "@/lib/i18n/portal-strings";
import { PROFILE_STRINGS, type ProfileStrings } from "@/lib/i18n/profile-strings";
import { fetchMyProfile, uploadProfilePhoto, removeProfilePhoto } from "@/lib/profile/api";
import type { MyProfile } from "@/types/profile";

function initialsFrom(firstName?: string, lastName?: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
}

type Editor = "name" | "username" | "email" | "password" | "details" | null;

export default function ProfilePage() {
  const { user } = useAuth();
  const { lang } = useLangStore();
  const t = PORTAL_STRINGS[lang];
  const p = PROFILE_STRINGS[lang];
  const qc = useQueryClient();
  const [photoOpen, setPhotoOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [editor, setEditor] = useState<Editor>(null);

  const profileQ = useQuery({
    queryKey: ["profile", "me"],
    queryFn: fetchMyProfile,
    staleTime: 0,
  });
  const profile = profileQ.data;

  /** Something about the account changed: refresh everything that shows it. */
  function refreshProfile() {
    qc.invalidateQueries({ queryKey: ["profile", "me"] });
    qc.invalidateQueries({ queryKey: ["auth", "me"] });
    qc.invalidateQueries({ queryKey: ["players", "me"] });
  }

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadProfilePhoto(file),
    onSuccess: () => {
      // Pull a fresh /api/auth/me so user.profilePhotoUrl is populated.
      qc.invalidateQueries({ queryKey: ["auth", "me"] });
      toast.success(t.photoUploadedToast);
      setPhotoOpen(false);
    },
    onError: (err) => {
      const detail = isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message ??
          err.message
        : (err as Error)?.message;
      toast.error(detail ? `${t.photoUploadFailed} — ${detail}` : t.photoUploadFailed);
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeProfilePhoto,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auth", "me"] });
      setRemoveOpen(false);
      toast.success(t.photoRemovedToast);
    },
    onError: () => toast.error(t.photoRemoveFailed),
  });

  if (!user) return null;

  const initials = initialsFrom(user.firstName, user.lastName);
  const photoUrl = user.profilePhotoUrl ?? null;
  const hasPhoto = !!photoUrl;

  return (
    <>
      <TopNav user={user} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-6">
        <PageHeader title={t.profileTitle} subtitle={t.profileSub} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Photo card */}
          <section className="card lg:col-span-1 bg-ink-700 border border-ink-600/70 rounded-xl p-6">
            <SectionHeader title={t.yourPhoto} />
            <div className="flex flex-col items-center text-center">
              <div className="mb-4">
                <Avatar
                  photoUrl={photoUrl}
                  initials={initials}
                  size={160}
                  alt={user.fullName}
                />
              </div>
              <div className="flex flex-col gap-2 w-full">
                <PrimaryButton type="button" onClick={() => setPhotoOpen(true)}>
                  {hasPhoto ? t.photoChange : t.photoUpload}
                </PrimaryButton>
                {hasPhoto && (
                  <button
                    type="button"
                    onClick={() => setRemoveOpen(true)}
                    className="text-xs text-slate-400 hover:text-red-400 transition-colors py-1.5"
                  >
                    {t.photoRemove}
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Account info */}
          <section className="card lg:col-span-2 bg-ink-700 border border-ink-600/70 rounded-xl p-6">
            <SectionHeader title={t.accountInfo} />
            <div>
              <Row
                label={t.fullName}
                action={
                  profile && (
                    <EditButton
                      p={p}
                      left={profile.allowances.name.remaining}
                      onClick={() => setEditor("name")}
                    />
                  )
                }
              >
                <span className="text-white font-medium">{profile ? `${profile.firstName} ${profile.lastName}` : user.fullName}</span>
              </Row>
              <Row
                label={t.username}
                action={
                  profile && (
                    <EditButton
                      p={p}
                      left={profile.allowances.username.remaining}
                      onClick={() => setEditor("username")}
                    />
                  )
                }
              >
                <span className="font-mono text-slate-200">{profile?.username ?? user.username}</span>
              </Row>
              <Row
                label={t.email}
                action={
                  profile && (
                    <EditButton
                      p={p}
                      left={profile.allowances.email.remaining}
                      onClick={() => setEditor("email")}
                    />
                  )
                }
              >
                <span
                  className="font-mono text-slate-200 inline-block"
                  style={{ direction: "ltr" }}
                >
                  {profile?.email ?? user.email}
                </span>
                {profile?.pendingEmail && (
                  <div className="mt-1 text-xs text-amber-300">{p.emailPending(profile.pendingEmail)}</div>
                )}
              </Row>
              <Row label={t.yourRoles}>
                <div className="flex flex-wrap gap-1.5">
                  {user.roles.map((r) => (
                    <RolePill key={r} role={r} lang={lang} />
                  ))}
                </div>
              </Row>
              <Row label={t.accountStatus}>
                <span className="text-slate-200">{user.status}</span>
              </Row>
            </div>

            <div className="mt-6 pt-5 border-t border-ink-600/50 flex items-center justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <div className="text-sm font-medium text-white">
                  {t.changePassword}
                </div>
                <div className="text-xs text-slate-500 mt-0.5 max-w-md">
                  {t.changePasswordHint}
                </div>
              </div>
              <SecondaryButton onClick={() => setEditor("password")} disabled={!profile}>
                {p.edit}
              </SecondaryButton>
            </div>

            {profileQ.isError && !profile && (
              <div className="mt-4">
                <ErrorState message={p.loadFailed} retryLabel={p.retry} onRetry={() => profileQ.refetch()} />
              </div>
            )}
          </section>

          {/* A player's own details */}
          {profile?.player && (
            <PlayerDetailsCard profile={profile} p={p} onEdit={() => setEditor("details")} />
          )}
        </div>
      </main>

      <PhotoUploadModal
        open={photoOpen}
        onClose={() => setPhotoOpen(false)}
        onUpload={async (file) => {
          await uploadMutation.mutateAsync(file);
        }}
        uploading={uploadMutation.isPending}
        initials={initials}
      />

      <ConfirmModal
        open={removeOpen}
        onClose={() => setRemoveOpen(false)}
        onConfirm={() => removeMutation.mutate()}
        title={t.removePhotoTitle}
        body={t.removePhotoBody}
        confirmLabel={t.photoRemove}
        cancelLabel={t.cancel}
        loading={removeMutation.isPending}
        loadingLabel={t.photoRemoving}
        danger
      />

      {profile && editor === "name" && (
        <NameModal
          profile={profile}
          t={p}
          onClose={() => setEditor(null)}
          onSaved={(updated) => {
            useAuthStore.getState().setUser({ ...user, ...updated });
            setEditor(null);
            refreshProfile();
          }}
        />
      )}
      {profile && editor === "username" && (
        <UsernameModal
          profile={profile}
          t={p}
          onClose={() => setEditor(null)}
          onSaved={(login) => {
            // the old token named the old username: carry on with the new one
            useAuthStore.getState().login(login);
            setEditor(null);
            refreshProfile();
          }}
        />
      )}
      {profile && editor === "email" && (
        <EmailModal
          profile={profile}
          t={p}
          onClose={() => setEditor(null)}
          onRequested={() => {
            setEditor(null);
            refreshProfile();
          }}
        />
      )}
      {profile && editor === "password" && (
        <PasswordModal profile={profile} t={p} onClose={() => setEditor(null)} />
      )}
      {profile?.player && editor === "details" && (
        <DetailsModal
          player={profile.player}
          allowances={profile.allowances}
          t={p}
          onClose={() => setEditor(null)}
          onSaved={() => {
            setEditor(null);
            refreshProfile();
          }}
        />
      )}
    </>
  );
}

function PlayerDetailsCard({
  profile,
  p,
  onEdit,
}: {
  profile: MyProfile;
  p: ProfileStrings;
  onEdit: () => void;
}) {
  const player = profile.player!;
  const details = profile.allowances.details;
  const canEdit = details.remaining > 0;
  const next = details.nextAvailableAt ? format(parseISO(details.nextAvailableAt), "PP") : null;

  return (
    <section className="card lg:col-span-3 bg-ink-700 border border-ink-600/70 rounded-xl p-6">
      <SectionHeader title={p.detailsTitle} />
      <p className="text-xs text-slate-500 -mt-2 mb-3">{p.detailsSub}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
        <div>
          <Row label={p.phone}>{player.phone ?? <Muted p={p} />}</Row>
          <Row label={p.emergencyName}>{player.emergencyContactName ?? <Muted p={p} />}</Row>
          <Row label={p.emergencyPhone}>{player.emergencyContactPhone ?? <Muted p={p} />}</Row>
          <Row label={p.weightKg}>{player.weight ?? <Muted p={p} />}</Row>
          <Row label={p.heightCm}>{player.height ?? <Muted p={p} />}</Row>
          <Row label={p.bloodType}>{player.bloodType ?? <Muted p={p} />}</Row>
        </div>
        <div>
          <Row label={p.academy}>{player.academyName}</Row>
          <Row label={p.belt}>{player.beltName}</Row>
          <Row label={p.status}>{player.status}</Row>
          <Row label={p.rankingPoints}>{player.rankingPoints ?? 0}</Row>
          <Row label={p.dob}>{format(parseISO(player.dateOfBirth), "PP")}</Row>
          <Row label={p.nationalId}>
            <span className="font-mono" style={{ direction: "ltr", display: "inline-block" }}>
              {player.cprMasked ?? <Muted p={p} />}
            </span>
          </Row>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-ink-600/50 flex items-center justify-between gap-4 flex-wrap">
        <div className="text-xs text-slate-500 max-w-xl">
          <div>{p.detailsHint(details.remaining, details.max, details.windowDays)}</div>
          {!canEdit && next && <div className="text-amber-300 mt-0.5">{p.detailsWait(next)}</div>}
          <div className="mt-0.5">{p.federationOnly}</div>
        </div>
        <SecondaryButton onClick={onEdit} disabled={!canEdit}>
          {p.detailsEdit}
        </SecondaryButton>
      </div>
    </section>
  );
}

function Muted({ p }: { p: ProfileStrings }) {
  return <span className="text-slate-500">{p.notSet}</span>;
}

/** The pencil button of a row, with how many changes are left under it. */
function EditButton({
  p,
  left,
  onClick,
}: {
  p: ProfileStrings;
  left: number;
  onClick: () => void;
}) {
  const none = left === 0;
  return (
    <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0.5 shrink-0">
      <button
        type="button"
        onClick={onClick}
        disabled={none}
        title={none ? p.noChangesLeft : undefined}
        className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-ink-600/60 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-300 transition-colors"
      >
        <Pencil size={13} aria-hidden="true" />
        {p.edit}
      </button>
      <span className={`text-[10px] ${none ? "text-amber-300" : "text-slate-500"}`}>{p.changesLeft(left)}</span>
    </div>
  );
}

function Row({
  label,
  children,
  action,
}: {
  label: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="py-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 border-b border-ink-600/50 last:border-0">
      <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500 sm:w-40 shrink-0">
        {label}
      </div>
      <div className="text-sm text-slate-100 flex-1 min-w-0">{children}</div>
      {action}
    </div>
  );
}

function RolePill({ role, lang }: { role: string; lang: "en" | "ar" }) {
  const t = PORTAL_STRINGS[lang];
  const key = `role_${role}` as keyof typeof t;
  const label = (t[key] as string | undefined) ?? role;
  return (
    <span className="inline-flex items-center text-[10px] uppercase tracking-[0.14em] font-medium border border-flag/40 bg-flag/10 text-flag rounded px-1.5 py-0.5">
      {label}
    </span>
  );
}
