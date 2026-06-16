"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { PrimaryButton } from "@/components/ui/primary-button";
import { useLangStore } from "@/lib/i18n/store";
import { APPLY_STRINGS } from "@/lib/i18n/apply-strings";

interface StepNavProps {
  current: number;
  total: number;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  submitting?: boolean;
  submitLabel?: string;
}

export function StepNav({
  current,
  total,
  onBack,
  onNext,
  onSubmit,
  submitting,
  submitLabel,
}: StepNavProps) {
  const { lang } = useLangStore();
  const t = APPLY_STRINGS[lang];
  const isLast = current === total - 1;

  return (
    <div className="mt-7 pt-5 border-t border-ink-600/70 flex items-center justify-between gap-3 flex-wrap">
      <button
        type="button"
        onClick={onBack}
        disabled={current === 0}
        className="text-sm text-slate-300 hover:text-flag disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-slate-300 inline-flex items-center gap-1.5 px-3 py-2 rounded-md transition-colors"
      >
        <span className="rtl:rotate-180">
          <ChevronLeft size={14} />
        </span>
        {t.back}
      </button>
      {isLast ? (
        <PrimaryButton
          type="button"
          onClick={onSubmit}
          loading={submitting}
          loadingText={t.submitting}
          className="w-auto px-5"
        >
          {submitLabel || t.submitApp}
        </PrimaryButton>
      ) : (
        <PrimaryButton type="button" onClick={onNext} className="w-auto px-5">
          <span>{t.next}</span>
          <span className="rtl:rotate-180">
            <ChevronRight size={14} />
          </span>
        </PrimaryButton>
      )}
    </div>
  );
}
