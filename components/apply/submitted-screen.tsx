"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { useLangStore } from "@/lib/i18n/store";
import { APPLY_STRINGS } from "@/lib/i18n/apply-strings";

export function SubmittedScreen() {
  const router = useRouter();
  const { lang } = useLangStore();
  const t = APPLY_STRINGS[lang];

  return (
    <div className="max-w-xl mx-auto text-center pt-10">
      <div className="flex justify-center mb-5 text-flag">
        <CheckCircle2 size={64} strokeWidth={1.5} />
      </div>
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
        {t.appPendingTitle}
      </h1>
      <p className="text-sm text-slate-400 mt-3 max-w-md mx-auto leading-relaxed">
        {t.appPendingSub}
      </p>
      <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
        <PrimaryButton
          type="button"
          onClick={() => router.push("/applications")}
          className="w-auto px-5"
        >
          {t.viewMyApps}
        </PrimaryButton>
        <SecondaryButton onClick={() => router.push("/dashboard")} className="px-5">
          {t.goToDashboard}
        </SecondaryButton>
      </div>
    </div>
  );
}
