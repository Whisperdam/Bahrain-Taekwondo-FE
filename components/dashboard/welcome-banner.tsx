import { DASH_STRINGS } from "@/lib/i18n/dashboard-strings";
import type { DashLang } from "@/lib/i18n/dashboard-strings";

interface WelcomeBannerProps {
  firstName: string;
  lang: DashLang;
}

export function WelcomeBanner({ firstName, lang }: WelcomeBannerProps) {
  const t = DASH_STRINGS[lang];
  return (
    <section aria-labelledby="welcome-h" className="pt-10 pb-2">
      <h1
        id="welcome-h"
        className="text-3xl sm:text-4xl font-semibold tracking-tight text-white"
      >
        {t.welcome(firstName)}
      </h1>
      <p className="mt-2 text-slate-400 text-base">{t.welcomeSub}</p>
    </section>
  );
}
