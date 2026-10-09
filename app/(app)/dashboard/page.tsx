"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLangStore } from "@/lib/i18n/store";
import { TopNav } from "@/components/dashboard/top-nav";
import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { UpgradeSection } from "@/components/dashboard/upgrade-section";
import { TournamentsSection } from "@/components/dashboard/tournaments-section";
import { RankingsSection } from "@/components/dashboard/rankings-section";
import { AcademiesSection } from "@/components/dashboard/academies-section";
import { Footer } from "@/components/dashboard/footer";
import {
  fetchUpcomingTournaments,
  fetchTopRankings,
  fetchAcademies,
} from "@/lib/dashboard/api";

// The three dashboard sections change slowly, so coming back to the dashboard
// should show what is already loaded instead of fetching again. Kept fresh for
// 5 minutes, kept in memory for 30, and not refetched when the tab regains focus.
const SLOW_CHANGING = {
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  refetchOnWindowFocus: false,
} as const;

export default function DashboardPage() {
  const { user } = useAuth();
  const { lang } = useLangStore();

  const { data: tournaments, isLoading: tourLoading } = useQuery({
    queryKey: ["tournaments", "upcoming"],
    queryFn: fetchUpcomingTournaments,
    ...SLOW_CHANGING,
  });

  const { data: rankings, isLoading: rankLoading } = useQuery({
    queryKey: ["rankings", 2026],
    queryFn: () => fetchTopRankings(2026),
    ...SLOW_CHANGING,
  });

  const { data: academies, isLoading: acadLoading } = useQuery({
    queryKey: ["academies"],
    queryFn: fetchAcademies,
    ...SLOW_CHANGING,
  });

  if (!user) return null;

  return (
    <>
      <TopNav user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <WelcomeBanner firstName={user.firstName} lang={lang} />

        <div className="mt-10 flex flex-col gap-14">
          <UpgradeSection roles={user.roles} lang={lang} />

          <TournamentsSection
            data={tournaments}
            isLoading={tourLoading}
            lang={lang}
          />

          <RankingsSection
            data={rankings}
            isLoading={rankLoading}
            lang={lang}
          />

          <AcademiesSection
            data={academies}
            isLoading={acadLoading}
            lang={lang}
          />
        </div>
      </main>

      <Footer lang={lang} />
    </>
  );
}
