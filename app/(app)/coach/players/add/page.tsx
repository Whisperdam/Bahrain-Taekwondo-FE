"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, Check, CheckCircle2, Copy, User } from "lucide-react";
import { isAxiosError } from "axios";
import { TopNav } from "@/components/dashboard/top-nav";
import { PageHeader } from "@/components/ui/page-header";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { RadioGroup } from "@/components/ui/radio-group";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Avatar } from "@/components/ui/avatar";
import { Stepper } from "@/components/apply/stepper";
import { StepNav } from "@/components/apply/step-nav";
import { FileDrop } from "@/components/apply/file-drop";
import { PhotoUploadModal } from "@/components/profile/photo-upload-modal";
import { useAuth } from "@/hooks/use-auth";
import { useLangStore } from "@/lib/i18n/store";
import { COACH_STRINGS } from "@/lib/i18n/coach-strings";
import {
  getMyAcademies,
  searchUserByEmail,
  createPlayer,
} from "@/lib/coach/api";
import { uploadDocument } from "@/lib/applications/api";
import { uploadProfilePhotoFor } from "@/lib/profile/api";
import { BELTS, type PublicUserSummary } from "@/types/coach";

interface PlayerFormState {
  academyId: string;
  beltId: number;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE";
  nationality: string;
  cprNumber: string;
  phone: string;
  registrationDate: string;
  weight: string;
  height: string;
  bloodType: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  blackBeltCert: File | null;
}

export default function AddPlayerPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { lang } = useLangStore();
  const t = COACH_STRINGS[lang];

  const academiesQ = useQuery({
    queryKey: ["coach", "me", "academies"],
    queryFn: getMyAcademies,
  });

  const [step, setStep] = useState(0);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchedEmail, setSearchedEmail] = useState<string | null>(null);
  const [selected, setSelected] = useState<PublicUserSummary | null>(null);
  const [searchNotFound, setSearchNotFound] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState<PlayerFormState>({
    academyId: "",
    beltId: BELTS[0].beltId,
    dateOfBirth: "",
    gender: "MALE",
    nationality: t.nationalityDefault,
    cprNumber: "",
    phone: "",
    registrationDate: today,
    weight: "",
    height: "",
    bloodType: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    blackBeltCert: null,
  });

  function set<K extends keyof PlayerFormState>(
    key: K,
    value: PlayerFormState[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  }

  // Derived step list — black-belt + photo steps are conditional.
  const requiresBlackBeltCert = useMemo(
    () => BELTS.find((b) => b.beltId === form.beltId)?.isBlack ?? false,
    [form.beltId],
  );
  const requiresPhoto = selected ? !selected.hasProfilePhoto : false;

  const steps = useMemo(() => {
    const list: { id: string; label: string }[] = [
      { id: "find", label: t.findUserStep },
      { id: "details", label: t.playerDetailsStep },
    ];
    if (requiresBlackBeltCert)
      list.push({ id: "cert", label: t.blackBeltStep });
    if (requiresPhoto) list.push({ id: "photo", label: t.playerPhotoStep });
    return list;
  }, [t, requiresBlackBeltCert, requiresPhoto]);

  // ── Search ─────────────────────────────────────────────────────────────
  const searchMutation = useMutation({
    mutationFn: () => searchUserByEmail(searchEmail.trim()),
    onSuccess: (data) => {
      setSelected(data);
      setSearchedEmail(searchEmail.trim());
      setSearchNotFound(false);
    },
    onError: (err) => {
      setSelected(null);
      setSearchedEmail(searchEmail.trim());
      // 404 → not found, anything else → toast
      if (isAxiosError(err) && err.response?.status === 404) {
        setSearchNotFound(true);
      } else {
        toast.error(t.addPlayerFailed);
      }
    },
  });

  function copyInviteLink() {
    const link = `${window.location.origin}/register`;
    navigator.clipboard.writeText(link).catch(() => {});
    setLinkCopied(true);
    toast.success(t.linkCopied);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  // ── Submit ─────────────────────────────────────────────────────────────
  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!selected) throw new Error("No user selected");
      const academyIdNum = Number(
        form.academyId || academiesQ.data?.[0]?.academyId,
      );
      const player = await createPlayer({
        userId: selected.userId,
        academyId: academyIdNum,
        beltId: form.beltId,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        nationality: form.nationality || undefined,
        cprNumber: form.cprNumber || undefined,
        phone: form.phone || undefined,
        emergencyContactName: form.emergencyContactName || undefined,
        emergencyContactPhone: form.emergencyContactPhone || undefined,
        weight: form.weight ? Number(form.weight) : undefined,
        height: form.height ? Number(form.height) : undefined,
        bloodType: form.bloodType || undefined,
        registrationDate: form.registrationDate || undefined,
      });

      const tasks: Promise<unknown>[] = [];
      if (requiresBlackBeltCert && form.blackBeltCert) {
        tasks.push(
          uploadDocument({
            file: form.blackBeltCert,
            ownerType: "PLAYER",
            ownerId: player.playerId,
            documentType: "BLACK_BELT_CERT",
          }),
        );
      }
      // Photo was uploaded eagerly via the modal — nothing to do here.
      if (tasks.length) await Promise.all(tasks);
      return player;
    },
    onSuccess: () => {
      setDone(true);
      toast.success(t.addPlayerSuccess);
    },
    onError: () => toast.error(t.addPlayerFailed),
  });

  // ── Validation per step ────────────────────────────────────────────────
  function validateStep(i: number): boolean {
    const e: Record<string, string> = {};
    const stepId = steps[i]?.id;
    if (stepId === "find") {
      if (!selected) e.search = t.errPickUser;
      else if (selected.hasPlayerProfile) e.search = t.errAlreadyPlayer;
    } else if (stepId === "details") {
      const eff = form.academyId || String(academies[0]?.academyId ?? "");
      if (!eff) e.academyId = t.errAcademy;
      if (!form.dateOfBirth || new Date(form.dateOfBirth) >= new Date())
        e.dateOfBirth = t.errDob;
      if (!form.gender) e.gender = t.errGender;
    } else if (stepId === "cert") {
      if (!form.blackBeltCert) e.blackBeltCert = t.errBlackBeltCert;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (validateStep(step)) setStep((s) => Math.min(steps.length - 1, s + 1));
  }
  function prev() {
    setStep((s) => Math.max(0, s - 1));
  }
  function submit() {
    if (!validateStep(step)) return;
    submitMutation.mutate();
  }

  if (!user) return null;

  // ── Done screen ────────────────────────────────────────────────────────
  if (done) {
    return (
      <>
        <TopNav user={user} />
        <main className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
          <div className="flex justify-center mb-5 text-emerald-400">
            <CheckCircle2 size={64} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            {t.addPlayerDoneTitle}
          </h1>
          <p className="text-sm text-slate-400 mt-3 max-w-md mx-auto leading-relaxed">
            {t.addPlayerDoneSub}
          </p>
          <div className="mt-8">
            <PrimaryButton
              type="button"
              onClick={() => router.push("/coach")}
              className="w-auto px-5"
            >
              {t.backToPlayers}
            </PrimaryButton>
          </div>
        </main>
      </>
    );
  }

  const academies = academiesQ.data ?? [];
  // We don't store a fallback in form.academyId — instead we resolve it at
  // render time so academies-loading doesn't cause a render-phase setState.
  const effectiveAcademyId =
    form.academyId || (academies[0] ? String(academies[0].academyId) : "");

  return (
    <>
      <TopNav user={user} />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-6">
        <PageHeader
          title={t.addPlayerTitle}
          subtitle={t.addPlayerSub}
          back={{
            label: t.coachPortalTitle,
            onClick: () => router.push("/coach"),
          }}
        />

        <div className="bg-ink-700 border border-ink-600/70 rounded-xl card-shadow">
          <div className="px-5 sm:px-7 pt-5 pb-3 border-b border-ink-600/70">
            <Stepper
              steps={steps}
              current={step}
              onJump={(i) => i < step && setStep(i)}
            />
          </div>

          <div className="px-5 sm:px-7 py-6">
            {steps[step]?.id === "find" && (
              <FindUserStep
                email={searchEmail}
                onEmailChange={setSearchEmail}
                searching={searchMutation.isPending}
                onSearch={() =>
                  searchEmail.trim() && searchMutation.mutate()
                }
                selected={selected}
                searchedEmail={searchedEmail}
                notFound={searchNotFound}
                linkCopied={linkCopied}
                onCopyLink={copyInviteLink}
                error={errors.search}
                t={t}
                lang={lang}
              />
            )}

            {steps[step]?.id === "details" && (
              <DetailsStep
                form={form}
                set={set}
                effectiveAcademyId={effectiveAcademyId}
                academies={academies.map((a) => ({
                  id: a.academyId,
                  name: a.academyName,
                }))}
                errors={errors}
                t={t}
              />
            )}

            {steps[step]?.id === "cert" && (
              <BlackBeltStep
                file={form.blackBeltCert}
                onFile={(f) => set("blackBeltCert", f)}
                error={errors.blackBeltCert}
                t={t}
              />
            )}

            {steps[step]?.id === "photo" && selected && (
              <PhotoStep
                selected={selected}
                photoUploaded={photoUploaded}
                onOpenUpload={() => setPhotoOpen(true)}
                t={t}
              />
            )}

            <StepNav
              current={step}
              total={steps.length}
              onBack={prev}
              onNext={next}
              onSubmit={submit}
              submitting={submitMutation.isPending}
              submitLabel={t.submit}
            />
          </div>
        </div>
      </main>

      {selected && (
        <PhotoUploadModal
          open={photoOpen}
          onClose={() => setPhotoOpen(false)}
          uploading={false}
          initials={`${selected.firstName?.[0] ?? ""}${selected.lastName?.[0] ?? ""}`.toUpperCase()}
          onUpload={async (file) => {
            await uploadProfilePhotoFor(selected.userId, file);
            setPhotoUploaded(true);
            setPhotoOpen(false);
            toast.success(t.userFound);
          }}
        />
      )}
    </>
  );
}

// ─── Steps ────────────────────────────────────────────────────────────────

function FindUserStep({
  email,
  onEmailChange,
  searching,
  onSearch,
  selected,
  searchedEmail,
  notFound,
  linkCopied,
  onCopyLink,
  error,
  t,
  lang,
}: {
  email: string;
  onEmailChange: (v: string) => void;
  searching: boolean;
  onSearch: () => void;
  selected: PublicUserSummary | null;
  searchedEmail: string | null;
  notFound: boolean;
  linkCopied: boolean;
  onCopyLink: () => void;
  error?: string;
  t: (typeof COACH_STRINGS)[keyof typeof COACH_STRINGS];
  lang: "en" | "ar";
}) {
  return (
    <div>
      <Field id="su" label={t.searchByEmail} error={error}>
        <div className="flex gap-2">
          <Input
            id="su"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder={t.searchUserPh}
            autoComplete="off"
            error={!!error}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSearch();
              }
            }}
          />
          <PrimaryButton
            type="button"
            onClick={onSearch}
            loading={searching}
            loadingText={t.searching}
            className="!w-auto px-4 shrink-0"
          >
            {t.search}
          </PrimaryButton>
        </div>
      </Field>

      {searchedEmail && selected && (
        <div
          className={`mt-3 p-4 rounded-lg border flex items-center gap-3 ${
            selected.hasPlayerProfile
              ? "border-amber-500/40 bg-amber-500/5"
              : "border-emerald-500/40 bg-emerald-500/5"
          }`}
        >
          <Avatar
            initials={`${selected.firstName?.[0] ?? ""}${selected.lastName?.[0] ?? ""}`.toUpperCase()}
            photoUrl={selected.profilePhotoUrl}
            size={44}
          />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">
              {selected.fullName}
            </div>
            <div
              className="text-xs text-slate-400 truncate font-mono"
              style={{
                direction: "ltr",
                textAlign: lang === "ar" ? "right" : "left",
              }}
            >
              {selected.email}
            </div>
          </div>
          {selected.hasPlayerProfile ? (
            <span className="text-xs text-amber-300 inline-flex items-center gap-1.5 shrink-0">
              <AlertTriangle size={14} />
              {t.alreadyPlayer}
            </span>
          ) : (
            <span className="text-xs text-emerald-300 inline-flex items-center gap-1.5 shrink-0">
              <Check size={14} />
              {t.userFound}
            </span>
          )}
        </div>
      )}

      {searchedEmail && notFound && (
        <div className="mt-3 p-4 rounded-lg border border-red-500/40 bg-red-500/5">
          <div className="flex items-start gap-3">
            <span className="text-red-400 mt-0.5">
              <AlertTriangle size={18} />
            </span>
            <div className="flex-1">
              <div className="text-sm font-medium text-white">
                {t.noUserFound}
              </div>
              <p className="text-xs text-slate-400 mt-1">{t.askToRegister}</p>
              <div className="mt-3 flex items-center gap-2 bg-ink-800 border border-ink-600 rounded-md px-3 py-2">
                <span
                  className="font-mono text-xs text-slate-300 flex-1 truncate"
                  style={{ direction: "ltr" }}
                >
                  {t.inviteLink}
                </span>
                <button
                  type="button"
                  onClick={onCopyLink}
                  className="text-xs text-flag hover:text-flag-hover font-medium inline-flex items-center gap-1.5"
                >
                  {linkCopied ? <Check size={14} /> : <Copy size={14} />}
                  {linkCopied ? t.linkCopied : t.copyLink}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailsStep({
  form,
  set,
  effectiveAcademyId,
  academies,
  errors,
  t,
}: {
  form: PlayerFormState;
  set: <K extends keyof PlayerFormState>(
    key: K,
    value: PlayerFormState[K],
  ) => void;
  effectiveAcademyId: string;
  academies: { id: number; name: string }[];
  errors: Record<string, string>;
  t: (typeof COACH_STRINGS)[keyof typeof COACH_STRINGS];
}) {
  const { lang } = useLangStore();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field id="ac" label={t.academy} error={errors.academyId}>
        <Select
          id="ac"
          // Defaults to academies[0] until the coach explicitly picks one.
          value={effectiveAcademyId}
          onChange={(e) => set("academyId", e.target.value)}
          error={!!errors.academyId}
        >
          {academies.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field id="bl" label={t.beltLevel}>
        <Select
          id="bl"
          value={String(form.beltId)}
          onChange={(e) => set("beltId", Number(e.target.value))}
        >
          {BELTS.map((b) => (
            <option key={b.beltId} value={b.beltId}>
              {b.label[lang]}
            </option>
          ))}
        </Select>
      </Field>
      <Field id="dob" label={t.dob} error={errors.dateOfBirth}>
        <Input
          id="dob"
          type="date"
          value={form.dateOfBirth}
          onChange={(e) => set("dateOfBirth", e.target.value)}
          error={!!errors.dateOfBirth}
        />
      </Field>
      <Field id="gender" label={t.gender}>
        <RadioGroup
          name="gender"
          value={form.gender}
          onChange={(v) => set("gender", v as "MALE" | "FEMALE")}
          options={[
            { value: "MALE", label: t.genderMALE },
            { value: "FEMALE", label: t.genderFEMALE },
          ]}
        />
      </Field>
      <Field id="nat" label={t.nationality}>
        <Input
          id="nat"
          value={form.nationality}
          onChange={(e) => set("nationality", e.target.value)}
        />
      </Field>
      <Field id="cpr" label={t.cpr}>
        <Input
          id="cpr"
          value={form.cprNumber}
          onChange={(e) => set("cprNumber", e.target.value)}
          placeholder="000000000"
        />
      </Field>
      <Field id="ph" label={t.phone}>
        <Input
          id="ph"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
          placeholder="+973"
        />
      </Field>
      <Field id="rd" label={t.registrationDate}>
        <Input
          id="rd"
          type="date"
          value={form.registrationDate}
          onChange={(e) => set("registrationDate", e.target.value)}
        />
      </Field>
      <Field id="wt" label={t.weight}>
        <Input
          id="wt"
          type="number"
          min="0"
          value={form.weight}
          onChange={(e) => set("weight", e.target.value)}
        />
      </Field>
      <Field id="ht" label={t.height}>
        <Input
          id="ht"
          type="number"
          min="0"
          value={form.height}
          onChange={(e) => set("height", e.target.value)}
        />
      </Field>
      <Field id="bt" label={t.bloodType}>
        <Select
          id="bt"
          value={form.bloodType}
          onChange={(e) => set("bloodType", e.target.value)}
        >
          <option value="">—</option>
          {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </Select>
      </Field>
      <Field id="en" label={t.emergencyName}>
        <Input
          id="en"
          value={form.emergencyContactName}
          onChange={(e) => set("emergencyContactName", e.target.value)}
        />
      </Field>
      <Field id="ep" label={t.emergencyPhone}>
        <Input
          id="ep"
          value={form.emergencyContactPhone}
          onChange={(e) => set("emergencyContactPhone", e.target.value)}
          placeholder="+973"
        />
      </Field>
    </div>
  );
}

function BlackBeltStep({
  file,
  onFile,
  error,
  t,
}: {
  file: File | null;
  onFile: (f: File | null) => void;
  error?: string;
  t: (typeof COACH_STRINGS)[keyof typeof COACH_STRINGS];
}) {
  return (
    <div>
      <div className="mb-5 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
        <span className="text-amber-300 mt-0.5 shrink-0">
          <AlertTriangle size={18} />
        </span>
        <div>
          <div className="text-sm font-medium text-white">
            {t.blackBeltBannerTitle}
          </div>
          <p className="text-xs text-amber-200/80 mt-1 leading-relaxed">
            {t.blackBeltBannerBody}
          </p>
        </div>
      </div>
      <div className="text-sm font-medium text-white mb-2 flex items-center gap-2 flex-wrap">
        {t.docBlackBelt}{" "}
        <span className="text-[10px] uppercase tracking-[0.14em] text-flag border border-flag/40 bg-flag/10 px-1.5 py-0.5 rounded">
          {t.docRequired}
        </span>
      </div>
      <FileDrop file={file} onFile={onFile} />
      {error && <div className="mt-2 text-[12px] text-red-400">{error}</div>}
    </div>
  );
}

function PhotoStep({
  selected,
  photoUploaded,
  onOpenUpload,
  t,
}: {
  selected: PublicUserSummary;
  photoUploaded: boolean;
  onOpenUpload: () => void;
  t: (typeof COACH_STRINGS)[keyof typeof COACH_STRINGS];
}) {
  return (
    <div className="text-center py-4">
      <div className="inline-flex w-14 h-14 rounded-full bg-flag/10 border border-flag/30 text-flag items-center justify-center mb-3">
        <User size={24} />
      </div>
      <h3 className="text-lg font-semibold">{selected.fullName}</h3>
      <p className="text-sm text-slate-400 mt-2 mb-5 max-w-md mx-auto">
        {t.playerPhotoIntro}
      </p>
      <p className="text-xs text-slate-500 mb-5">{t.photoConstraints}</p>
      <PrimaryButton
        type="button"
        onClick={onOpenUpload}
        className="!w-auto px-5"
      >
        {photoUploaded ? <Check size={16} /> : null}
        {photoUploaded ? t.userFound : t.photoUpload}
      </PrimaryButton>
    </div>
  );
}
