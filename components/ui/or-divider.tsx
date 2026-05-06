"use client";

import { useLangStore } from "@/lib/i18n/store";

export function OrDivider() {
  const { t } = useLangStore();

  return (
    <div className="flex items-center my-5">
      <div className="flex-1 h-px bg-ink-600/80" />
      <div className="px-3 text-[11px] uppercase tracking-[0.18em] text-slate-500">
        {t("or")}
      </div>
      <div className="flex-1 h-px bg-ink-600/80" />
    </div>
  );
}
