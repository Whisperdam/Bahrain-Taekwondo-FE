"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { TopNav } from "@/components/dashboard/top-nav";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { Avatar } from "@/components/ui/avatar";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { PhotoUploadModal } from "@/components/profile/photo-upload-modal";
import { useAuth } from "@/hooks/use-auth";
import { useLangStore } from "@/lib/i18n/store";
import { PORTAL_STRINGS } from "@/lib/i18n/portal-strings";
import { uploadProfilePhoto, removeProfilePhoto } from "@/lib/profile/api";
import { forgotPasswordApi } from "@/lib/auth/api";

function initialsFrom(firstName?: string, lastName?: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { lang } = useLangStore();
  const t = PORTAL_STRINGS[lang];
  const qc = useQueryClient();
  const [photoOpen, setPhotoOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);

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

  const resetPwMutation = useMutation({
    mutationFn: () => forgotPasswordApi(user?.email ?? ""),
    onSuccess: () => toast.success(t.resetLinkSent),
    onError: () => toast.error(t.resetLinkFailed),
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
              <Row label={t.fullName}>
                <span className="text-white font-medium">{user.fullName}</span>
              </Row>
              <Row label={t.username}>
                <span className="font-mono text-slate-200">{user.username}</span>
              </Row>
              <Row label={t.email}>
                <span
                  className="font-mono text-slate-200 inline-block"
                  style={{ direction: "ltr" }}
                >
                  {user.email}
                </span>
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
              <SecondaryButton
                onClick={() => resetPwMutation.mutate()}
                disabled={resetPwMutation.isPending}
              >
                {t.sendResetLink}
              </SecondaryButton>
            </div>
          </section>
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
    </>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 border-b border-ink-600/50 last:border-0">
      <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500 sm:w-40 shrink-0">
        {label}
      </div>
      <div className="text-sm text-slate-100 flex-1">{children}</div>
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
