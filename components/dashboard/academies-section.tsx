import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { DASH_STRINGS } from "@/lib/i18n/dashboard-strings";
import type { DashLang } from "@/lib/i18n/dashboard-strings";
import type { AcademyDTO } from "@/types/dashboard";

function AcademyCard({ academy }: { academy: AcademyDTO }) {
  return (
    <div className="card bg-ink-700 border border-ink-600/70 rounded-xl p-5 flex items-start gap-3.5">
      <span className="shrink-0 w-9 h-9 rounded-lg bg-ink-800 border border-ink-600 text-flag flex items-center justify-center">
        <MapPin size={16} />
      </span>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-white truncate">{academy.academyName}</div>
        <div className="text-xs text-slate-400 mt-0.5">{academy.location}</div>
      </div>
    </div>
  );
}

function AcademySkeleton() {
  return (
    <div className="bg-ink-700 border border-ink-600/70 rounded-xl p-5 flex items-start gap-3.5">
      <div className="skel w-9 h-9 rounded-lg shrink-0" />
      <div className="flex-1">
        <div className="skel h-4 w-3/4 mb-2" />
        <div className="skel h-3 w-1/3" />
      </div>
    </div>
  );
}

interface AcademiesSectionProps {
  data: AcademyDTO[] | undefined;
  isLoading: boolean;
  lang: DashLang;
}

export function AcademiesSection({ data, isLoading, lang }: AcademiesSectionProps) {
  const t = DASH_STRINGS[lang];
  const isEmpty = !isLoading && (!data || data.length === 0);

  return (
    <section aria-labelledby="acad-h">
      <div className="flex items-end justify-between gap-4 mb-5">
        <h2 id="acad-h" className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
          {t.academies}
        </h2>
        <Link
          href="/academies"
          className="shrink-0 whitespace-nowrap text-sm text-flag hover:text-flag-hover font-medium inline-flex items-center gap-1.5 transition-colors"
        >
          <span>{t.viewAll}</span>
          <span className="rtl:rotate-180"><ArrowRight size={14} /></span>
        </Link>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map((i) => <AcademySkeleton key={i} />)}
        </div>
      )}

      {isEmpty && (
        <div className="bg-ink-700/50 border border-dashed border-ink-600 rounded-xl p-10 text-center">
          <div className="text-slate-500 mb-2 inline-flex"><MapPin size={22} /></div>
          <p className="text-sm text-slate-400">{t.noAcademies}</p>
        </div>
      )}

      {!isLoading && data && data.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((academy) => (
            <AcademyCard key={academy.academyId} academy={academy} />
          ))}
        </div>
      )}
    </section>
  );
}
