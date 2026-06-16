"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { TopNav } from "@/components/dashboard/top-nav";
import { PageHeader } from "@/components/ui/page-header";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup } from "@/components/ui/radio-group";
import { Stepper } from "@/components/apply/stepper";
import { StepNav } from "@/components/apply/step-nav";
import { ReviewRow } from "@/components/apply/review-row";
import { FileDrop, formatBytes } from "@/components/apply/file-drop";
import { SubmittedScreen } from "@/components/apply/submitted-screen";
import { useAuth } from "@/hooks/use-auth";
import { useLangStore } from "@/lib/i18n/store";
import { APPLY_STRINGS } from "@/lib/i18n/apply-strings";
import {
  submitOfficialApplication,
  uploadDocument,
} from "@/lib/applications/api";
import type {
  OfficialApplicationRequest,
  Gender,
  OfficialCertLevel,
  OfficialSpecialization,
} from "@/types/applications";

interface OfficialFormState {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  nationality: string;
  phone: string;
  email: string;
  certificationLevel: OfficialCertLevel;
  certificationExpiry: string;
  specialization: OfficialSpecialization;
  notes: string;
  docNationalId: File | null;
  docRefereeCert: File | null;
}

export default function ApplyOfficialPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { lang } = useLangStore();
  const t = APPLY_STRINGS[lang];

  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<OfficialFormState>(() => ({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    dateOfBirth: "",
    gender: "MALE",
    nationality: lang === "ar" ? "بحريني" : "Bahraini",
    phone: "",
    email: user?.email ?? "",
    certificationLevel: "NATIONAL",
    certificationExpiry: "",
    specialization: "REFEREE",
    notes: "",
    docNationalId: null,
    docRefereeCert: null,
  }));

  const set = <K extends keyof OfficialFormState>(
    k: K,
    v: OfficialFormState[K],
  ) => setForm((f) => ({ ...f, [k]: v }));

  const steps = useMemo(
    () => [
      { id: "s1", label: t.sPersonal },
      { id: "s2", label: t.sOfficiating },
      { id: "s3", label: t.sDocuments },
      { id: "s4", label: t.sReview },
    ],
    [t],
  );

  function validateStep(idx: number): boolean {
    const e: Record<string, string> = {};
    if (idx === 0) {
      if (!form.firstName.trim()) e.firstName = "Required";
      if (!form.lastName.trim()) e.lastName = "Required";
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        e.email = "Invalid email";
    } else if (idx === 2) {
      if (!form.docNationalId) e.docNationalId = t.docRequired;
      if (!form.docRefereeCert) e.docRefereeCert = t.docRequired;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: OfficialApplicationRequest = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        dateOfBirth: form.dateOfBirth || undefined,
        gender: form.gender,
        nationality: form.nationality || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        certificationLevel: form.certificationLevel,
        certificationExpiry: form.certificationExpiry || undefined,
        specialization: form.specialization,
        notes: form.notes || undefined,
      };
      const created = await submitOfficialApplication(payload);
      const uploads: Promise<unknown>[] = [];
      if (form.docNationalId) {
        uploads.push(
          uploadDocument({
            file: form.docNationalId,
            ownerType: "OFFICIAL_APPLICATION",
            ownerId: created.applicationId,
            documentType: "NATIONAL_ID",
          }),
        );
      }
      if (form.docRefereeCert) {
        uploads.push(
          uploadDocument({
            file: form.docRefereeCert,
            ownerType: "OFFICIAL_APPLICATION",
            ownerId: created.applicationId,
            documentType: "REFEREE_CERT",
          }),
        );
      }
      await Promise.all(uploads);
      return created;
    },
    onSuccess: () => setSubmitted(true),
    onError: () => toast.error(t.submitFailed),
  });

  function handleSubmit() {
    if (!validateStep(2)) {
      setStep(2);
      return;
    }
    mutation.mutate();
  }

  if (!user) return null;
  if (submitted)
    return (
      <>
        <TopNav user={user} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-6">
          <SubmittedScreen />
        </main>
      </>
    );

  return (
    <>
      <TopNav user={user} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-6">
        <PageHeader
          title={t.applyOfficialTitle}
          back={{
            label: t.backToDashboard,
            onClick: () => router.push("/dashboard"),
          }}
          action={
            <div className="text-xs text-slate-500 hidden sm:block">
              {t.stepOf(step + 1, steps.length)}
            </div>
          }
        />

        <div className="bg-ink-700 border border-ink-600/70 rounded-xl card-shadow">
          <div className="px-5 sm:px-7 pt-5 pb-3 border-b border-ink-600/70">
            <Stepper
              steps={steps}
              current={step}
              onJump={(i) => i <= step && setStep(i)}
            />
          </div>

          <div className="px-5 sm:px-7 py-6">
            {step === 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
                <Field id="fn" label={t.firstName} error={errors.firstName}>
                  <Input
                    id="fn"
                    value={form.firstName}
                    onChange={(e) => set("firstName", e.target.value)}
                    error={!!errors.firstName}
                  />
                </Field>
                <Field id="ln" label={t.lastName} error={errors.lastName}>
                  <Input
                    id="ln"
                    value={form.lastName}
                    onChange={(e) => set("lastName", e.target.value)}
                    error={!!errors.lastName}
                  />
                </Field>
                <Field id="dob" label={t.dob}>
                  <Input
                    id="dob"
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => set("dateOfBirth", e.target.value)}
                  />
                </Field>
                <Field id="gen" label={t.gender}>
                  <RadioGroup
                    name="gender"
                    value={form.gender}
                    onChange={(v) => set("gender", v)}
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
                <Field id="ph" label={t.phone}>
                  <Input
                    id="ph"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+973"
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field id="em" label={t.email} error={errors.email}>
                    <Input
                      id="em"
                      type="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      error={!!errors.email}
                    />
                  </Field>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
                <Field id="cl" label={t.certLevel}>
                  <Select
                    id="cl"
                    value={form.certificationLevel}
                    onChange={(e) =>
                      set("certificationLevel", e.target.value as OfficialCertLevel)
                    }
                  >
                    <option value="NATIONAL">{t.badgeNATIONAL}</option>
                    <option value="REGIONAL">{t.badgeREGIONAL}</option>
                    <option value="INTERNATIONAL">{t.badgeINTERNATIONAL}</option>
                  </Select>
                </Field>
                <Field id="cx" label={t.certExpiry}>
                  <Input
                    id="cx"
                    type="date"
                    value={form.certificationExpiry}
                    onChange={(e) => set("certificationExpiry", e.target.value)}
                  />
                </Field>
                <Field id="sp" label={t.specialization}>
                  <Select
                    id="sp"
                    value={form.specialization}
                    onChange={(e) =>
                      set("specialization", e.target.value as OfficialSpecialization)
                    }
                  >
                    <option value="REFEREE">{t.spec_REFEREE}</option>
                    <option value="JUDGE">{t.spec_JUDGE}</option>
                    <option value="COACH_REFEREE">{t.spec_COACH_REFEREE}</option>
                  </Select>
                </Field>
                <div className="sm:col-span-2">
                  <Field id="nt" label={`${t.notes} · ${t.optional}`}>
                    <Textarea
                      id="nt"
                      rows={4}
                      value={form.notes}
                      onChange={(e) => set("notes", e.target.value)}
                      placeholder={t.notesPh}
                    />
                  </Field>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <DocSlot
                  label={t.docNationalId}
                  file={form.docNationalId}
                  onFile={(f) => set("docNationalId", f)}
                  error={errors.docNationalId}
                />
                <DocSlot
                  label={t.docRefereeCert}
                  file={form.docRefereeCert}
                  onFile={(f) => set("docRefereeCert", f)}
                  error={errors.docRefereeCert}
                />
              </div>
            )}

            {step === 3 && <ReviewBlock form={form} lang={lang} />}

            <StepNav
              current={step}
              total={steps.length}
              onBack={() => setStep((s) => Math.max(0, s - 1))}
              onNext={() => {
                if (!validateStep(step)) return;
                setStep((s) => Math.min(steps.length - 1, s + 1));
              }}
              onSubmit={handleSubmit}
              submitting={mutation.isPending}
            />
          </div>
        </div>
      </main>
    </>
  );
}

function DocSlot({
  label,
  file,
  onFile,
  error,
}: {
  label: string;
  file: File | null;
  onFile: (f: File | null) => void;
  error?: string;
}) {
  const { lang } = useLangStore();
  const t = APPLY_STRINGS[lang];
  return (
    <div>
      <div className="text-sm font-medium text-white mb-2 flex items-center gap-2">
        {label}
        <span className="text-[10px] uppercase tracking-[0.14em] text-flag border border-flag/40 bg-flag/10 px-1.5 py-0.5 rounded">
          {t.docRequired}
        </span>
      </div>
      <FileDrop file={file} onFile={onFile} />
      {error && <div className="mt-1.5 text-[12px] text-red-400">{error}</div>}
    </div>
  );
}

function ReviewBlock({
  form,
  lang,
}: {
  form: OfficialFormState;
  lang: "en" | "ar";
}) {
  const t = APPLY_STRINGS[lang];
  return (
    <div>
      <h3 className="text-sm uppercase tracking-[0.16em] text-slate-500 mb-3">
        {t.sPersonal}
      </h3>
      <div className="bg-ink-800/50 border border-ink-600 rounded-lg px-5 mb-6">
        <ReviewRow label={t.firstName}>{form.firstName}</ReviewRow>
        <ReviewRow label={t.lastName}>{form.lastName}</ReviewRow>
        <ReviewRow label={t.dob}>
          {form.dateOfBirth && format(new Date(form.dateOfBirth), "PP")}
        </ReviewRow>
        <ReviewRow label={t.gender}>
          {form.gender === "MALE" ? t.genderMALE : t.genderFEMALE}
        </ReviewRow>
        <ReviewRow label={t.nationality}>{form.nationality}</ReviewRow>
        <ReviewRow label={t.phone}>{form.phone}</ReviewRow>
        <ReviewRow label={t.email}>{form.email}</ReviewRow>
      </div>
      <h3 className="text-sm uppercase tracking-[0.16em] text-slate-500 mb-3">
        {t.sOfficiating}
      </h3>
      <div className="bg-ink-800/50 border border-ink-600 rounded-lg px-5 mb-6">
        <ReviewRow label={t.certLevel}>
          {t[`badge${form.certificationLevel}` as const]}
        </ReviewRow>
        <ReviewRow label={t.certExpiry}>
          {form.certificationExpiry &&
            format(new Date(form.certificationExpiry), "PP")}
        </ReviewRow>
        <ReviewRow label={t.specialization}>
          {t[`spec_${form.specialization}` as const]}
        </ReviewRow>
        {form.notes && <ReviewRow label={t.notes}>{form.notes}</ReviewRow>}
      </div>
      <h3 className="text-sm uppercase tracking-[0.16em] text-slate-500 mb-3">
        {t.sDocuments}
      </h3>
      <div className="bg-ink-800/50 border border-ink-600 rounded-lg px-5">
        <ReviewRow label={t.docNationalId}>
          {form.docNationalId && (
            <span className="inline-flex items-center gap-2 text-slate-200">
              <span className="truncate">{form.docNationalId.name}</span>
              <span className="text-slate-500 text-xs">
                {formatBytes(form.docNationalId.size)}
              </span>
            </span>
          )}
        </ReviewRow>
        <ReviewRow label={t.docRefereeCert}>
          {form.docRefereeCert && (
            <span className="inline-flex items-center gap-2 text-slate-200">
              <span className="truncate">{form.docRefereeCert.name}</span>
              <span className="text-slate-500 text-xs">
                {formatBytes(form.docRefereeCert.size)}
              </span>
            </span>
          )}
        </ReviewRow>
      </div>
    </div>
  );
}
