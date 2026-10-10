"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { ErrorBanner } from "@/components/ui/error-banner";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { getApiErrorMessage } from "@/lib/api/errors";
import { updateUserProfile } from "@/lib/admin/api";
import { useLangStore } from "@/lib/i18n/store";
import { PROFILE_STRINGS } from "@/lib/i18n/profile-strings";
import type { AdminUser } from "@/types/admin";

/**
 * An admin correcting someone's name, username or email: the way out for a person who has
 * used up the changes they get on their own profile. Corrections here are not counted
 * against that person, and a new email takes effect straight away.
 */
export function EditUserDetailsModal({
  target,
  onClose,
}: {
  target: AdminUser | null;
  onClose: () => void;
}) {
  const { lang } = useLangStore();
  const p = PROFILE_STRINGS[lang];
  const qc = useQueryClient();

  const [first, setFirst] = useState(target?.firstName ?? "");
  const [last, setLast] = useState(target?.lastName ?? "");
  const [username, setUsername] = useState(target?.username ?? "");
  const [email, setEmail] = useState(target?.email ?? "");
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: () =>
      updateUserProfile(target!.userId, {
        firstName: first.trim(),
        lastName: last.trim(),
        username: username.trim(),
        email: email.trim(),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      // could be the signed-in admin correcting their own details
      qc.invalidateQueries({ queryKey: ["auth", "me"] });
      toast.success(p.adminSaved);
      onClose();
    },
    onError: (err) => setError(getApiErrorMessage(err, p.loadFailed)),
  });

  if (!target) return null;

  function submit() {
    setError(null);
    save.mutate();
  }

  return (
    <Modal
      open
      onClose={() => !save.isPending && onClose()}
      title={p.adminEditTitle}
      dismissible={!save.isPending}
      footer={
        <>
          <SecondaryButton onClick={onClose} disabled={save.isPending}>
            {p.cancel}
          </SecondaryButton>
          <PrimaryButton
            type="button"
            className="w-auto px-4"
            onClick={submit}
            loading={save.isPending}
            loadingText={p.saving}
          >
            {p.save}
          </PrimaryButton>
        </>
      }
    >
      {error && <ErrorBanner>{error}</ErrorBanner>}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!save.isPending) submit();
        }}
        noValidate
      >
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">{p.adminEditHint}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <Field id="au-first" label={p.firstName}>
            <Input id="au-first" english="name" value={first} onChange={(e) => setFirst(e.target.value)} />
          </Field>
          <Field id="au-last" label={p.lastName}>
            <Input id="au-last" english="name" value={last} onChange={(e) => setLast(e.target.value)} />
          </Field>
        </div>
        <Field id="au-username" label={p.username}>
          <Input
            id="au-username"
            english="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Field>
        <Field id="au-email" label={p.email}>
          <Input id="au-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
      </form>
    </Modal>
  );
}
