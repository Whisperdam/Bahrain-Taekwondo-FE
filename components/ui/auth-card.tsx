"use client";

import * as React from "react";
import { ShieldLogo } from "./shield-logo";
import { LanguageToggle } from "./language-toggle";
import { ThemeToggle } from "./theme-toggle";
import { useLangStore } from "@/lib/i18n/store";
import { STRINGS } from "@/lib/i18n/translations";

interface AuthCardProps {
  children: React.ReactNode;
  screenKey?: string;
  compact?: boolean;
}

export function AuthCard({ children, screenKey, compact }: AuthCardProps) {
  const { lang, t } = useLangStore();
  const isAr = lang === "ar";

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className={`relative w-full max-w-md mx-auto bg-ink-700 sm:rounded-xl card-shadow border border-ink-600/60 ${isAr ? "font-arabic" : "font-sans"} ${compact ? "p-6 sm:p-7" : "p-7 sm:p-9"} min-h-screen sm:min-h-0`}
    >
      <div className="absolute top-4 ltr:right-4 rtl:left-4 flex items-center gap-2">
        <ThemeToggle />
        <LanguageToggle />
      </div>

      {/* Logo block */}
      <div className="flex flex-col items-center text-center pt-2 pb-5">
        <div className="mb-3">
          <ShieldLogo size={48} />
        </div>
        <div className="text-white text-base font-semibold leading-tight">
          {STRINGS.en.fedTitle}
        </div>
        <div
          className="text-white text-base font-semibold leading-tight font-arabic mt-0.5"
          dir="rtl"
        >
          {STRINGS.ar.fedTitle}
        </div>
        <div
          className={`text-[11px] uppercase tracking-[0.18em] text-slate-500 mt-2 ${isAr ? "font-arabic normal-case tracking-normal text-xs" : ""}`}
        >
          {t("fedSub")}
        </div>
      </div>

      <div className="h-px bg-ink-600/70 -mx-7 sm:-mx-9 mb-6" />

      <div key={screenKey} className="screen-enter">
        {children}
      </div>
    </div>
  );
}
