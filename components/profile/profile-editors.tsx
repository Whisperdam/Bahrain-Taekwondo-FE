"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { ErrorBanner } from "@/components/ui/error-banner";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PasswordInput } from "@/components/ui/password-input";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { getApiErrorMessage } from "@/lib/api/errors";
import { forgotPasswordApi } from "@/lib/auth/api";
import {
  changeMyName,
  changeMyPassword,
  changeMyUsername,
  requestMyEmailChange,
  updateMyPlayerDetails,
} from "@/lib/profile/api";
import type { ProfileStrings } from "@/lib/i18n/profile-strings";
import type { LoginResponse, UserProfile } from "@/types/auth";
import type {
  MyPlayer,
  MyProfile,
  PlayerDetailsUpdate,
  ProfileAllowances,
} from "@/types/profile";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

/** Same rule as sign-up: 8+ characters with a letter, a digit and a symbol. */
const STRONG_PASSWORD = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

interface ShellProps {
  title: string;
  t: ProfileStrings;
  onClose: () => void;
  onSubmit: () => void;
  pending: boolean;
  error: string | null;
  children: React.ReactNode;
}

/** The dialog every editor shares: title, error banner, Cancel and Save. Enter saves. */
function EditShell({ title, t, onClose, onSubmit, pending, error, children }: ShellProps) {
  return (
    <Modal
      open
      onClose={() => !pending && onClose()}
      title={title}
      dismissible={!pending}
      footer={
        <>
          <SecondaryButton onClick={onClose} disabled={pending}>
            {t.cancel}
          </SecondaryButton>
          <PrimaryButton
            type="button"
            className="w-auto px-4"
            onClick={onSubmit}
            loading={pending}
            loadingText={t.saving}
          >
            {t.save}
          </PrimaryButton>
        </>
      }
    >
      {error && <ErrorBanner>{error}</ErrorBanner>}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!pending) onSubmit();
        }}
        noValidate
      >
        {children}
        <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
      </form>
    </Modal>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-slate-500 mb-4 leading-relaxed">{children}</p>;
}

// ── Name ─────────────────────────────────────────────────────────────────

export function NameModal({
  profile,
  t,
  onClose,
  onSaved,
}: {
  profile: MyProfile;
  t: ProfileStrings;
  onClose: () => void;
  onSaved: (user: UserProfile) => void;
}) {
  const [first, setFirst] = useState(profile.firstName);
  const [last, setLast] = useState(profile.lastName);
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: () => changeMyName({ firstName: first.trim(), lastName: last.trim() }),
    onSuccess: (user) => {
      toast.success(t.nameSaved);
      onSaved(user);
    },
    onError: (err) => setError(getApiErrorMessage(err, t.loadFailed)),
  });

  return (
    <EditShell
      title={t.nameTitle}
      t={t}
      onClose={onClose}
      pending={save.isPending}
      error={error}
      onSubmit={() => {
        setError(null);
        save.mutate();
      }}
    >
      <Hint>{t.nameHint(profile.allowances.name.remaining)}</Hint>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <Field id="pf-first" label={t.firstName}>
          <Input id="pf-first" english="name" value={first} onChange={(e) => setFirst(e.target.value)} />
        </Field>
        <Field id="pf-last" label={t.lastName}>
          <Input id="pf-last" english="name" value={last} onChange={(e) => setLast(e.target.value)} />
        </Field>
      </div>
    </EditShell>
  );
}

// ── Username ─────────────────────────────────────────────────────────────

export function UsernameModal({
  profile,
  t,
  onClose,
  onSaved,
}: {
  profile: MyProfile;
  t: ProfileStrings;
  onClose: () => void;
  onSaved: (login: LoginResponse) => void;
}) {
  const [username, setUsername] = useState(profile.username);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: () => changeMyUsername({ username: username.trim(), currentPassword: password }),
    onSuccess: (login) => {
      toast.success(t.usernameSaved);
      onSaved(login);
    },
    onError: (err) => setError(getApiErrorMessage(err, t.loadFailed)),
  });

  return (
    <EditShell
      title={t.usernameTitle}
      t={t}
      onClose={onClose}
      pending={save.isPending}
      error={error}
      onSubmit={() => {
        setError(null);
        save.mutate();
      }}
    >
      <Hint>{t.usernameHint(profile.allowances.username.remaining)}</Hint>
      <Field id="pf-username" label={t.newUsername}>
        <Input
          id="pf-username"
          english="username"
          autoComplete="off"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </Field>
      <Field id="pf-username-pw" label={t.currentPassword} hint={t.currentPasswordHint}>
        <PasswordInput
          id="pf-username-pw"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>
    </EditShell>
  );
}

// ── Email ────────────────────────────────────────────────────────────────

export function EmailModal({
  profile,
  t,
  onClose,
  onRequested,
}: {
  profile: MyProfile;
  t: ProfileStrings;
  onClose: () => void;
  onRequested: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: () => requestMyEmailChange({ newEmail: email.trim(), currentPassword: password }),
    onSuccess: (res) => {
      toast.success(res.message || t.emailRequested);
      onRequested();
    },
    onError: (err) => setError(getApiErrorMessage(err, t.loadFailed)),
  });

  return (
    <EditShell
      title={t.emailTitle}
      t={t}
      onClose={onClose}
      pending={save.isPending}
      error={error}
      onSubmit={() => {
        setError(null);
        save.mutate();
      }}
    >
      <Hint>{t.emailHint(profile.allowances.email.remaining)}</Hint>
      <Field id="pf-email" label={t.newEmail}>
        <Input
          id="pf-email"
          type="email"
          autoComplete="off"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>
      <Field id="pf-email-pw" label={t.currentPassword} hint={t.currentPasswordHint}>
        <PasswordInput
          id="pf-email-pw"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>
    </EditShell>
  );
}

// ── Password ─────────────────────────────────────────────────────────────

export function PasswordModal({
  profile,
  t,
  onClose,
}: {
  profile: MyProfile;
  t: ProfileStrings;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: () => changeMyPassword({ currentPassword: current, newPassword: next }),
    onSuccess: () => {
      toast.success(t.passwordSaved);
      onClose();
    },
    onError: (err) => setError(getApiErrorMessage(err, t.loadFailed)),
  });

  const sendReset = useMutation({
    mutationFn: () => forgotPasswordApi(profile.email),
    onSuccess: () => {
      toast.success(t.resetSent);
      onClose();
    },
    onError: (err) => setError(getApiErrorMessage(err, t.loadFailed)),
  });

  function submit() {
    setError(null);
    if (!STRONG_PASSWORD.test(next)) {
      setError(t.passwordHint);
      return;
    }
    if (next !== again) {
      setError(t.passwordMismatch);
      return;
    }
    save.mutate();
  }

  return (
    <EditShell
      title={t.passwordTitle}
      t={t}
      onClose={onClose}
      pending={save.isPending}
      error={error}
      onSubmit={submit}
    >
      <Field id="pf-pw-current" label={t.currentPassword}>
        <PasswordInput
          id="pf-pw-current"
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        />
      </Field>
      <Field id="pf-pw-new" label={t.newPassword} hint={t.passwordHint}>
        <PasswordInput
          id="pf-pw-new"
          autoComplete="new-password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
        />
      </Field>
      <Field id="pf-pw-again" label={t.confirmPassword}>
        <PasswordInput
          id="pf-pw-again"
          autoComplete="new-password"
          value={again}
          onChange={(e) => setAgain(e.target.value)}
        />
      </Field>
      <button
        type="button"
        onClick={() => sendReset.mutate()}
        disabled={sendReset.isPending}
        className="text-xs text-slate-400 hover:text-flag transition-colors min-h-[32px]"
      >
        {t.forgotInstead}
      </button>
    </EditShell>
  );
}

// ── A player's contact and physical details ──────────────────────────────

export function DetailsModal({
  player,
  allowances,
  t,
  onClose,
  onSaved,
}: {
  player: MyPlayer;
  allowances: ProfileAllowances;
  t: ProfileStrings;
  onClose: () => void;
  onSaved: (player: MyPlayer) => void;
}) {
  const [phone, setPhone] = useState(player.phone ?? "");
  const [emergencyName, setEmergencyName] = useState(player.emergencyContactName ?? "");
  const [emergencyPhone, setEmergencyPhone] = useState(player.emergencyContactPhone ?? "");
  const [weight, setWeight] = useState(player.weight != null ? String(player.weight) : "");
  const [height, setHeight] = useState(player.height != null ? String(player.height) : "");
  const [bloodType, setBloodType] = useState(player.bloodType ?? "");
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: (body: PlayerDetailsUpdate) => updateMyPlayerDetails(body),
    onSuccess: (updated) => {
      toast.success(t.detailsSaved);
      onSaved(updated);
    },
    onError: (err) => setError(getApiErrorMessage(err, t.loadFailed)),
  });

  /** Only what actually changed is sent, so an untouched edit never uses up one of the few allowed. */
  function submit() {
    setError(null);
    const body: PlayerDetailsUpdate = {};
    if (phone.trim() !== (player.phone ?? "")) body.phone = phone.trim();
    if (emergencyName.trim() !== (player.emergencyContactName ?? ""))
      body.emergencyContactName = emergencyName.trim();
    if (emergencyPhone.trim() !== (player.emergencyContactPhone ?? ""))
      body.emergencyContactPhone = emergencyPhone.trim();
    if (weight !== (player.weight != null ? String(player.weight) : "") && weight.trim() !== "")
      body.weight = Number(weight);
    if (height !== (player.height != null ? String(player.height) : "") && height.trim() !== "")
      body.height = Number(height);
    if (bloodType !== (player.bloodType ?? "")) body.bloodType = bloodType;

    if (Object.keys(body).length === 0) {
      setError(t.nothingChanged);
      return;
    }
    save.mutate(body);
  }

  return (
    <EditShell
      title={t.detailsEdit}
      t={t}
      onClose={onClose}
      pending={save.isPending}
      error={error}
      onSubmit={submit}
    >
      <Hint>{t.detailsHint(allowances.details.remaining, allowances.details.max, allowances.details.windowDays)}</Hint>
      <Field id="pd-phone" label={t.phone}>
        <Input id="pd-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <Field id="pd-ename" label={t.emergencyName}>
          <Input
            id="pd-ename"
            english="name"
            value={emergencyName}
            onChange={(e) => setEmergencyName(e.target.value)}
          />
        </Field>
        <Field id="pd-ephone" label={t.emergencyPhone}>
          <Input
            id="pd-ephone"
            type="tel"
            value={emergencyPhone}
            onChange={(e) => setEmergencyPhone(e.target.value)}
          />
        </Field>
        <Field id="pd-weight" label={t.weightKg}>
          <Input
            id="pd-weight"
            type="number"
            inputMode="decimal"
            step="0.1"
            min="1"
            max="300"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </Field>
        <Field id="pd-height" label={t.heightCm}>
          <Input
            id="pd-height"
            type="number"
            inputMode="decimal"
            step="0.1"
            min="1"
            max="300"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />
        </Field>
      </div>
      <Field id="pd-blood" label={t.bloodType}>
        <Select id="pd-blood" value={bloodType} onChange={(e) => setBloodType(e.target.value)}>
          <option value="">—</option>
          {BLOOD_TYPES.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </Select>
      </Field>
    </EditShell>
  );
}
