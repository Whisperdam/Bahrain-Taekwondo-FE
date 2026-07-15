import Link from "next/link";
import { Trophy, ArrowRight } from "lucide-react";
import { DASH_STRINGS } from "@/lib/i18n/dashboard-strings";
import type { DashLang } from "@/lib/i18n/dashboard-strings";
import type { NationalRankingDTO } from "@/types/dashboard";

function RankingSkeleton() {
  return (
    <div className="bg-ink-700 border border-ink-600/70 rounded-xl overflow-hidden">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`flex items-center gap-4 px-5 py-3.5 ${i ? "border-t border-ink-600/60" : ""}`}
        >
          <div className="skel h-5 w-6" />
          <div className="skel h-5 flex-1 max-w-40" />
          <div className="skel h-5 w-32 hidden sm:block" />
          <div className="skel h-5 w-16" />
        </div>
      ))}
    </div>
  );
}

function RankingsEmpty({ lang }: { lang: DashLang }) {
  const t = DASH_STRINGS[lang];
  return (
    <div className="bg-ink-700 border border-ink-600/70 rounded-xl p-12 text-center">
      <div className="inline-flex w-12 h-12 rounded-full bg-flag/10 border border-flag/30 text-flag items-center justify-center mb-4">
        <Trophy size={22} />
      </div>
      <h3 className="text-lg font-semibold text-white mb-1.5">{t.rankingsEmpty}</h3>
      <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
        {t.rankingsEmptySub}
      </p>
    </div>
  );
}

interface RankingsSectionProps {
  data: NationalRankingDTO[] | undefined;
  isLoading: boolean;
  lang: DashLang;
}

export function RankingsSection({ data, isLoading, lang }: RankingsSectionProps) {
  const t = DASH_STRINGS[lang];
  const isEmpty = !isLoading && (!data || data.length === 0);
  const hasData = !isLoading && data && data.length > 0;

  return (
    <section aria-labelledby="rank-h">
      <div className="flex items-end justify-between gap-4 mb-5">
        <h2 id="rank-h" className="text-xl sm:text-2xl font-semibold text-white tracking-tight flex items-baseline gap-3 flex-wrap">
          <span className="whitespace-nowrap">{t.rankings}</span>
          <span className="whitespace-nowrap text-xs font-normal text-slate-500 uppercase tracking-[0.16em]">
            {t.rankingsSub}
          </span>
        </h2>
        {hasData && (
          <Link
            href="/rankings"
            className="shrink-0 whitespace-nowrap text-sm text-flag hover:text-flag-hover font-medium inline-flex items-center gap-1.5 transition-colors"
          >
            <span>{t.viewFullRankings}</span>
            <span className="rtl:rotate-180"><ArrowRight size={14} /></span>
          </Link>
        )}
      </div>

      {isLoading && <RankingSkeleton />}
      {isEmpty && <RankingsEmpty lang={lang} />}

      {hasData && (
        <div className="bg-ink-700 border border-ink-600/70 rounded-xl overflow-hidden">
          {/* Column headers */}
          <div className="grid grid-cols-[44px_1fr_1fr_80px_72px] sm:grid-cols-[56px_1.4fr_1.4fr_88px_88px] px-4 sm:px-5 py-2.5 text-[10px] uppercase tracking-[0.16em] text-slate-500 border-b border-ink-600/60 font-medium">
            <div>{t.colRank}</div>
            <div>{t.colName}</div>
            <div className="hidden sm:block">{t.colAcademy}</div>
            <div>{t.colWeight}</div>
            <div className="text-right rtl:text-left">{t.colPoints}</div>
          </div>

          {data!.map((r, i) => (
            <div
              key={r.rankingId}
              className={`grid grid-cols-[44px_1fr_1fr_80px_72px] sm:grid-cols-[56px_1.4fr_1.4fr_88px_88px] items-center px-4 sm:px-5 py-3.5 text-sm ${
                i ? "border-t border-ink-600/60" : ""
              } hover:bg-ink-600/30 transition-colors`}
            >
              <div className={`font-semibold ${r.rankPosition === 1 ? "text-flag" : "text-slate-200"}`}>
                #{r.rankPosition}
              </div>
              <div className="text-white font-medium truncate">
                {r.playerFirstName} {r.playerLastName}
              </div>
              <div className="text-slate-400 truncate hidden sm:block">{r.academyName}</div>
              <div className="text-slate-300 text-xs truncate">{r.categoryName}</div>
              <div className="text-white font-semibold text-right rtl:text-left tabular-nums">
                {r.totalPoints.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
