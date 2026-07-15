"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ShieldLogo } from "@/components/ui/shield-logo";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { PrimaryButton } from "@/components/ui/primary-button";
import { useLangStore } from "@/lib/i18n/store";

interface ErrorPageProps {
  /** The large numeric label, e.g. "404" / "403". */
  code: string;
  title: { en: string; ar: string };
  body: { en: string; ar: string };
  /** Where the primary CTA navigates. Defaults to /dashboard. */
  ctaHref?: string;
  ctaLabel?: { en: string; ar: string };
}

const BACK_LABEL = { en: "Go back", ar: "رجوع" };
const DASHBOARD_LABEL = { en: "Go to dashboard", ar: "العودة للرئيسية" };

/**
 * Full-screen error page used by app/not-found.tsx and app/forbidden.tsx.
 * Mirrors the auth-page atmosphere (dark backdrop + diagonal-line pattern)
 * so 404/403 feel like the rest of the app, not a system error.
 */
export function ErrorPage({
  code,
  title,
  body,
  ctaHref = "/dashboard",
  ctaLabel = DASHBOARD_LABEL,
}: ErrorPageProps) {
  const router = useRouter();
  const { lang } = useLangStore();
  const isAr = lang === "ar";

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="isolate bg-atmosphere min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden"
    >
      <div className="pattern-bg" aria-hidden="true" />
      <div className="relative z-10 w-full max-w-xl mx-auto text-center">
        {/* Theme + lang toggles */}
        <div className="absolute top-0 ltr:right-0 rtl:left-0 flex items-center gap-2">
          <ThemeToggle />
          <LanguageToggle />
        </div>

        <div className="flex justify-center mb-5">
          <ShieldLogo size={48} />
        </div>

        <div
          className="text-[120px] sm:text-[160px] font-bold leading-none tracking-tight bg-clip-text text-transparent"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(206,17,38,0.55), rgba(206,17,38,0.05))",
          }}
        >
          {code}
        </div>

        <h1
          className={`text-2xl sm:text-3xl font-semibold tracking-tight mt-2 ${
            isAr ? "font-arabic" : "font-sans"
          }`}
        >
          {title[lang]}
        </h1>
        <p
          className={`text-sm sm:text-base text-slate-400 mt-3 max-w-md mx-auto leading-relaxed ${
            isAr ? "font-arabic" : "font-sans"
          }`}
        >
          {body[lang]}
        </p>

        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          <PrimaryButton
            type="button"
            onClick={() => router.push(ctaHref)}
            className="w-auto px-5"
          >
            {ctaLabel[lang]}
          </PrimaryButton>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-slate-300 hover:text-flag text-sm font-medium px-3 py-2.5 inline-flex items-center gap-1.5 transition-colors"
          >
            <span className="rtl:rotate-180 inline-flex">
              <ChevronLeft size={14} />
            </span>
            {BACK_LABEL[lang]}
          </button>
        </div>
      </div>
    </div>
  );
}
