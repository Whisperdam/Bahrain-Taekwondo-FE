"use client";

import { useRouter } from "next/navigation";
import { Award, ArrowRight, Medal } from "lucide-react";
import { DASH_STRINGS } from "@/lib/i18n/dashboard-strings";
import type { DashLang } from "@/lib/i18n/dashboard-strings";

interface UpgradeCardProps {
  icon: React.ComponentType<{ size?: number }>;
  title: string;
  body: string;
  ctaLabel: string;
  href: string;
}

function UpgradeCard({ icon: Icon, title, body, ctaLabel, href }: UpgradeCardProps) {
  const router = useRouter();
  return (
    <div className="card bg-ink-700 border border-ink-600/70 rounded-xl p-5 sm:p-6 flex flex-col">
      <div className="flex items-start gap-4 mb-3">
        <span className="shrink-0 w-10 h-10 rounded-lg bg-flag/15 text-flag border border-flag/30 flex items-center justify-center">
          <Icon size={20} />
        </span>
        <h3 className="text-base font-semibold text-white mt-1.5">{title}</h3>
      </div>
      <p className="text-sm text-slate-400 leading-relaxed flex-1">{body}</p>
      <button
        onClick={() => router.push(href)}
        className="mt-5 self-start text-sm font-semibold text-flag hover:text-flag-hover inline-flex items-center gap-1.5 transition-colors"
      >
        <span>{ctaLabel}</span>
        <span className="rtl:rotate-180"><ArrowRight size={14} /></span>
      </button>
    </div>
  );
}

interface UpgradeSectionProps {
  roles: string[];
  lang: DashLang;
}

export function UpgradeSection({ roles, lang }: UpgradeSectionProps) {
  const t = DASH_STRINGS[lang];
  const showCoach = !roles.includes("ROLE_COACH");
  const showOfficial = !roles.includes("ROLE_OFFICIAL");

  if (!showCoach && !showOfficial) return null;

  return (
    <section aria-labelledby="upgrade-h">
      <h2 id="upgrade-h" className="sr-only">{t.upgradeTitle}</h2>
      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-3">
        {t.upgradeTitle}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {showCoach && (
          <UpgradeCard
            icon={Award}
            title={t.coachCardTitle}
            body={t.coachCardBody}
            ctaLabel={t.applyNow}
            href="/apply/coach"
          />
        )}
        {showOfficial && (
          <UpgradeCard
            icon={Medal}
            title={t.officialCardTitle}
            body={t.officialCardBody}
            ctaLabel={t.applyNow}
            href="/apply/official"
          />
        )}
      </div>
    </section>
  );
}
