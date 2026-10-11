"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, Building2, GitBranch } from "lucide-react";
import { TopNav } from "@/components/dashboard/top-nav";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PrimaryButton } from "@/components/ui/primary-button";
import { FileDrop } from "@/components/apply/file-drop";
import { SubmittedScreen } from "@/components/apply/submitted-screen";
import { useAuth } from "@/hooks/use-auth";
import { useLangStore } from "@/lib/i18n/store";
import { APPLY_STRINGS } from "@/lib/i18n/apply-strings";
import {
  submitAcademyApplication,
  uploadDocument,
} from "@/lib/applications/api";
import { getMyAcademies } from "@/lib/coach/api";
import { getApiErrorMessage } from "@/lib/api/errors";
import { Select } from "@/components/ui/select";
import type { CoachAcademy } from "@/types/coach";
import type { AcademyApplicationRequest } from "@/types/applications";

interface AcademyFormState {
  proposedName: string;
  proposedLocation: string;
  proposedPhone: string;
  proposedEmail: string;
  proposedEstablishedDate: string;
  notes: string;
  docTradeLicense: File | null;
  docAcademyReg: File | null;
  docInsurance: File | null;
}

export default function ApplyAcademyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { lang } = useLangStore();
  const t = APPLY_STRINGS[lang];

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<AcademyFormState>({
    proposedName: "",
    proposedLocation: "",
    proposedPhone: "",
    proposedEmail: "",
    proposedEstablishedDate: "",
    notes: "",
    docTradeLicense: null,
    docAcademyReg: null,
    docInsurance: null,
  });

  const set = <K extends keyof AcademyFormState>(
    k: K,
    v: AcademyFormState[K],
  ) => setForm((f) => ({ ...f, [k]: v }));

  const isCoach = user?.roles.includes("ROLE_COACH") ?? false;

  // A coach with an academy chooses between a new academy and a branch of one of theirs.
  // Both send the same application; a branch just starts filled in and remembers its root.
  const academiesQ = useQuery({
    queryKey: ["coach", "me", "academies"],
    queryFn: getMyAcademies,
    enabled: isCoach,
  });
  const owned = (academiesQ.data ?? []).filter((a) => a.role === "OWNER");
  const memberOf = (academiesQ.data ?? []).find((a) => a.role === "COACH");
  const [mode, setMode] = useState<"choose" | "new" | "branch">("choose");
  const [branchSourceId, setBranchSourceId] = useState<number | null>(null);
  const branchSource: CoachAcademy | undefined =
    owned.find((a) => a.academyId === (branchSourceId ?? owned[0]?.academyId)) ?? owned[0];

  function startBranch() {
    if (!branchSource) return;
    setForm((f) => ({
      ...f,
      proposedName: branchSource.suggestedBranchName ?? `${branchSource.academyName} 2`,
      proposedLocation: branchSource.location ?? "",
      proposedPhone: branchSource.phone ?? "",
      proposedEmail: branchSource.email ?? "",
      proposedEstablishedDate: branchSource.establishedDate ?? "",
    }));
    setBranchSourceId(branchSource.academyId);
    setMode("branch");
  }
  function startNew() {
    setMode("new");
  }
  // no academy yet: nothing to choose, it is simply a new academy
  const effectiveMode = owned.length === 0 && !academiesQ.isLoading ? "new" : mode;

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.proposedName.trim()) e.proposedName = "Required";
    if (
      form.proposedEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.proposedEmail)
    )
      e.proposedEmail = "Invalid email";
    if (!form.docTradeLicense) e.docTradeLicense = t.docRequired;
    if (!form.docAcademyReg) e.docAcademyReg = t.docRequired;
    if (!form.docInsurance) e.docInsurance = t.docRequired;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: AcademyApplicationRequest = {
        proposedName: form.proposedName.trim(),
        proposedLocation: form.proposedLocation || undefined,
        proposedPhone: form.proposedPhone || undefined,
        proposedEmail: form.proposedEmail || undefined,
        proposedEstablishedDate: form.proposedEstablishedDate || undefined,
        notes: form.notes || undefined,
        branchOfAcademyId: effectiveMode === "branch" ? branchSource?.academyId : undefined,
      };
      const created = await submitAcademyApplication(payload);
      const uploads: Promise<unknown>[] = [];
      if (form.docTradeLicense)
        uploads.push(
          uploadDocument({
            file: form.docTradeLicense,
            ownerType: "ACADEMY_APPLICATION",
            ownerId: created.applicationId,
            documentType: "TRADE_LICENSE",
          }),
        );
      if (form.docAcademyReg)
        uploads.push(
          uploadDocument({
            file: form.docAcademyReg,
            ownerType: "ACADEMY_APPLICATION",
            ownerId: created.applicationId,
            documentType: "ACADEMY_REGISTRATION",
          }),
        );
      if (form.docInsurance)
        uploads.push(
          uploadDocument({
            file: form.docInsurance,
            ownerType: "ACADEMY_APPLICATION",
            ownerId: created.applicationId,
            documentType: "INSURANCE",
          }),
        );
      await Promise.all(uploads);
      return created;
    },
    onSuccess: () => setSubmitted(true),
    onError: (err) => toast.error(getApiErrorMessage(err, t.submitFailed)),
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
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

  if (!isCoach) {
    return (
      <>
        <TopNav user={user} />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-16">
          <div className="text-center">
            <div className="inline-flex w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 items-center justify-center mb-4">
              <AlertTriangle size={22} />
            </div>
            <h1 className="text-xl font-semibold text-white">{t.coachOnly}</h1>
            <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
              {t.notACoach}
            </p>
            <div className="mt-6">
              <PrimaryButton
                type="button"
                onClick={() => router.push("/apply/coach")}
                className="w-auto px-5"
              >
                {t.applyCoachTitle}
              </PrimaryButton>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (academiesQ.isLoading) return null;

  if (memberOf) {
    return (
      <>
        <TopNav user={user} />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-16 text-center">
          <h1 className="text-xl font-semibold text-white">{t.applyAcademyTitle}</h1>
          <p className="text-sm text-slate-400 mt-2">{t.belongsToAcademy(memberOf.academyName)}</p>
          <div className="mt-6">
            <PrimaryButton
              type="button"
              onClick={() => router.push(`/coach/academies/${memberOf.academyId}`)}
              className="w-auto px-5"
            >
              {t.manageThatAcademy}
            </PrimaryButton>
          </div>
        </main>
      </>
    );
  }

  if (effectiveMode === "choose") {
    return (
      <>
        <TopNav user={user} />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-6">
          <PageHeader
            title={t.newOrBranchTitle}
            back={{ label: t.backToDashboard, onClick: () => router.push("/coach") }}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-ink-700 border border-ink-600/70 rounded-xl p-6 flex flex-col gap-3">
              <span className="w-10 h-10 rounded-lg bg-flag/15 border border-flag/30 text-flag flex items-center justify-center">
                <GitBranch size={20} />
              </span>
              <div className="text-base font-semibold text-white">{t.branchOption}</div>
              <p className="text-sm text-slate-400 leading-relaxed">{t.branchOptionBody}</p>
              {owned.length > 1 && (
                <Select
                  value={String(branchSource?.academyId ?? "")}
                  onChange={(e) => setBranchSourceId(Number(e.target.value))}
                  aria-label={t.branchOfSelect}
                >
                  {owned.map((a) => (
                    <option key={a.academyId} value={a.academyId}>
                      {a.academyName}
                    </option>
                  ))}
                </Select>
              )}
              <PrimaryButton type="button" onClick={startBranch} className="w-auto px-5 mt-auto self-start">
                {t.continueLabel}
              </PrimaryButton>
            </div>
            <div className="bg-ink-700 border border-ink-600/70 rounded-xl p-6 flex flex-col gap-3">
              <span className="w-10 h-10 rounded-lg bg-ink-800 border border-ink-600 text-slate-300 flex items-center justify-center">
                <Building2 size={20} />
              </span>
              <div className="text-base font-semibold text-white">{t.newAcademyOption}</div>
              <p className="text-sm text-slate-400 leading-relaxed">{t.newAcademyOptionBody}</p>
              <PrimaryButton type="button" onClick={startNew} className="w-auto px-5 mt-auto self-start">
                {t.continueLabel}
              </PrimaryButton>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <TopNav user={user} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-6">
        <PageHeader
          title={t.applyAcademyTitle}
          subtitle={t.applyAcademySub}
          back={{
            label: t.backToDashboard,
            onClick: () => router.push("/dashboard"),
          }}
        />

        <form
          onSubmit={onSubmit}
          noValidate
          className="bg-ink-700 border border-ink-600/70 rounded-xl card-shadow p-5 sm:p-7"
        >
          {effectiveMode === "branch" && branchSource && (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-flag/30 bg-flag/10 px-4 py-3 text-sm text-slate-100">
              <span>{t.branchBanner(branchSource.academyName)}</span>
              <button
                type="button"
                onClick={() => setMode("choose")}
                className="text-xs text-flag hover:text-flag-hover font-medium"
              >
                {t.changeChoice}
              </button>
            </div>
          )}
          <SectionHeader title={t.academyDetails} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
            <div className="sm:col-span-2">
              <Field
                id="an"
                label={t.academyName}
                error={errors.proposedName}
              >
                <Input
                  id="an"
                  value={form.proposedName}
                  onChange={(e) => set("proposedName", e.target.value)}
                  placeholder={t.academyNamePh}
                  error={!!errors.proposedName}
                />
              </Field>
            </div>
            <Field id="al" label={t.academyLocation}>
              <Input
                id="al"
                value={form.proposedLocation}
                onChange={(e) => set("proposedLocation", e.target.value)}
                placeholder={t.academyLocationPh}
              />
            </Field>
            <Field id="ad" label={t.establishedDate}>
              <Input
                id="ad"
                type="date"
                value={form.proposedEstablishedDate}
                onChange={(e) =>
                  set("proposedEstablishedDate", e.target.value)
                }
              />
            </Field>
            <Field id="ap" label={t.academyPhone}>
              <Input
                id="ap"
                value={form.proposedPhone}
                onChange={(e) => set("proposedPhone", e.target.value)}
                placeholder="+973"
              />
            </Field>
            <Field id="ae" label={t.academyEmail} error={errors.proposedEmail}>
              <Input
                id="ae"
                type="email"
                value={form.proposedEmail}
                onChange={(e) => set("proposedEmail", e.target.value)}
                error={!!errors.proposedEmail}
              />
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

          <div className="h-px bg-ink-600/60 my-6" />

          <SectionHeader title={t.documents} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <DocSlot
              label={t.docTradeLicense}
              file={form.docTradeLicense}
              onFile={(f) => set("docTradeLicense", f)}
              error={errors.docTradeLicense}
            />
            <DocSlot
              label={t.docAcademyReg}
              file={form.docAcademyReg}
              onFile={(f) => set("docAcademyReg", f)}
              error={errors.docAcademyReg}
            />
            <DocSlot
              label={t.docInsurance}
              file={form.docInsurance}
              onFile={(f) => set("docInsurance", f)}
              error={errors.docInsurance}
            />
          </div>

          <div className="mt-7 pt-5 border-t border-ink-600/70 flex items-center justify-end gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="text-sm text-slate-300 hover:text-flag px-3 py-2 rounded-md transition-colors"
            >
              {t.cancel}
            </button>
            <PrimaryButton
              loading={mutation.isPending}
              loadingText={t.submitting}
              className="w-auto px-5"
            >
              {t.submitApp}
            </PrimaryButton>
          </div>
        </form>
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
