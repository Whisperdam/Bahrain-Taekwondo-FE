"use client";

import { useLangStore } from "@/lib/i18n/store";
import { cn } from "@/lib/utils";

interface LanguageToggleProps {
  /** When true (auth card), positions absolutely in the card corner */
  absolute?: boolean;
}

export function LanguageToggle({ absolute = false }: LanguageToggleProps) {
  const { lang, setLang, t } = useLangStore();

  return (
    <div
      role="group"
      aria-label={t("langToggle")}
      className={cn(
        "flex items-center bg-ink-900/60 border border-ink-600/80 rounded-full p-0.5 text-[11px] font-medium tracking-wide select-none shrink-0",
        absolute && "absolute top-4 ltr:right-4 rtl:left-4",
      )}
      style={{ direction: "ltr" }}
    >
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        aria-label="English"
        className={`px-2.5 py-1 rounded-full transition-colors ${
          lang === "en"
            ? "bg-flag text-accent-foreground"
            : "text-slate-400 hover:text-flag"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("ar")}
        aria-pressed={lang === "ar"}
        aria-label="العربية"
        className={`px-2.5 py-1 rounded-full transition-colors font-arabic ${
          lang === "ar"
            ? "bg-flag text-accent-foreground"
            : "text-slate-400 hover:text-flag"
        }`}
      >
        عر
      </button>
    </div>
  );
}
