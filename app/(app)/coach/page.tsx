"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Building2,
  Users,
  FileText,
  Plus,
  ArrowRight,
} from "lucide-react";
import { TopNav } from "@/components/dashboard/top-nav";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useLangStore } from "@/lib/i18n/store";
import { COACH_STRINGS } from "@/lib/i18n/coach-strings";
import { getMyAcademies, getPlayersByAcademy } from "@/lib/coach/api";
import { listMyCoachApplications, listMyAcademyApplications } from "@/lib/applications/api";
import type { Player } from "@/types/coach";
import type { AcademyDTO } from "@/types/dashboard";

const COLOR_BY_STATUS: Record<Player["status"], string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  PENDING: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  INACTIVE: "bg-slate-500/10 text-slate-300 border-slate-500/30",
  SUSPENDED: "bg-red-500/10 text-red-300 border-red-500/30",
};

export default function CoachPortalPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { lang } = useLangStore();
  const t = COACH_STRINGS[lang];

  const academiesQ = useQuery({
    queryKey: ["coach", "me", "academies"],
    queryFn: getMyAcademies,
  });

  // Once we have academies, fan out to fetch players from each in parallel.
  const academyIds = academiesQ.data?.map((a) => a.academyId) ?? [];
  const playersQs = useQuery({
    queryKey: ["coach", "me", "players", academyIds],
    queryFn: async (): Promise<Player[]> => {
      const lists = await Promise.all(
        academyIds.map((id) => getPlayersByAcademy(id)),
      );
      return lists.flat();
    },
    enabled: academyIds.length > 0,
  });

  const pendingAppsQ = useQuery({
    queryKey: ["applications", "pending-count"],
    queryFn: async () => {
      const [coach, academy] = await Promise.all([
        listMyCoachApplications(),
        listMyAcademyApplications(),
      ]);
      return (
        coach.filter((a) => a.status === "PENDING").length +
        academy.filter((a) => a.status === "PENDING").length
      );
    },
  });

  if (!user) return null;

  const academies = academiesQ.data ?? [];
  const players = playersQs.data ?? [];

  return (
    <>
      <TopNav user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-6">
        <PageHeader
          title={t.coachPortalTitle}
          subtitle={t.coachPortalSub}
        />

        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-3">
          {t.myCoaching}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={Building2}
            label={t.myAcademies}
            count={academiesQ.isLoading ? "—" : academies.length}
            sub={t.myAcademiesSub}
            cta={t.viewAll}
            onClick={() => {
              /* placeholder — anchors to the section below */
              document
                .getElementById("my-academies")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            accent
          />
          <StatCard
            icon={Users}
            label={t.myPlayers}
            count={playersQs.isLoading ? "—" : players.length}
            sub={t.myPlayersSub}
            cta={t.addPlayer}
            onClick={() => router.push("/coach/players/add")}
            accent
          />
          <StatCard
            icon={FileText}
            label={t.pendingApps}
            count={pendingAppsQ.isLoading ? "—" : pendingAppsQ.data ?? 0}
            sub={t.pendingAppsSub}
            cta={t.viewDetail}
            onClick={() => router.push("/applications")}
          />
        </div>

        {/* Players section */}
        <section className="mt-10">
          <SectionHeader
            title={t.myPlayers}
            action={
              <PrimaryButton
                type="button"
                onClick={() => router.push("/coach/players/add")}
                className="!py-2 !px-3.5 text-xs w-auto"
              >
                <Plus size={14} />
                {t.addPlayer}
              </PrimaryButton>
            }
          />

          {playersQs.isLoading || academiesQ.isLoading ? (
            <PlayersSkeleton />
          ) : players.length === 0 ? (
            <EmptyState
              icon={Users}
              title={t.noPlayersTitle}
              body={t.noPlayersBody}
              action={
                <PrimaryButton
                  type="button"
                  onClick={() => router.push("/coach/players/add")}
                  className="w-auto px-5"
                >
                  {t.addPlayer}
                </PrimaryButton>
              }
            />
          ) : (
            <div className="bg-ink-700 border border-ink-600/70 rounded-xl overflow-hidden">
              <div className="grid grid-cols-[1fr_1fr_72px_88px] sm:grid-cols-[1.4fr_1.4fr_88px_88px] px-4 sm:px-5 py-2.5 text-[10px] uppercase tracking-[0.16em] text-slate-500 border-b border-ink-600/60 font-medium">
                <div>{t.colName}</div>
                <div className="hidden sm:block">{t.colAcademy}</div>
                <div>{t.colBelt}</div>
                <div className="text-right rtl:text-left">{t.colStatus}</div>
              </div>
              {players.map((p) => (
                <PlayerRow key={p.playerId} player={p} t={t} />
              ))}
            </div>
          )}
        </section>

        {/* Academies section */}
        <section id="my-academies" className="mt-10">
          <SectionHeader title={t.myAcademies} />
          {academiesQ.isLoading ? (
            <AcademiesSkeleton />
          ) : academies.length === 0 ? (
            <EmptyState
              icon={Building2}
              title={t.noAcademiesTitle}
              body={t.noAcademiesBody}
              action={
                <PrimaryButton
                  type="button"
                  onClick={() => router.push("/apply/academy")}
                  className="w-auto px-5"
                >
                  {t.applyAcademyCta}
                </PrimaryButton>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {academies.map((a) => (
                <AcademyCard key={a.academyId} academy={a} t={t} />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

function StatCard({
  icon: Icon,
  label,
  count,
  sub,
  cta,
  onClick,
  accent = false,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  count: number | string;
  sub: string;
  cta: string;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <div
      className={`card bg-ink-700 border rounded-xl p-6 flex flex-col gap-3 ${
        accent ? "border-flag/40" : "border-ink-600/70"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`shrink-0 w-10 h-10 rounded-lg border flex items-center justify-center ${
            accent
              ? "bg-flag/15 border-flag/30 text-flag"
              : "bg-ink-800 border-ink-600 text-slate-300"
          }`}
        >
          <Icon size={20} />
        </span>
        <div className="flex-1">
          <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
            {label}
          </div>
          <div className="text-3xl font-semibold text-white mt-1 tabular-nums leading-none">
            {count}
          </div>
        </div>
      </div>
      <p className="text-sm text-slate-400 leading-relaxed">{sub}</p>
      <div className="mt-auto">
        <button
          type="button"
          onClick={onClick}
          className="text-sm font-semibold text-flag hover:text-flag-hover inline-flex items-center gap-1.5"
        >
          <span>{cta}</span>
          <span className="rtl:rotate-180 inline-flex">
            <ArrowRight size={14} />
          </span>
        </button>
      </div>
    </div>
  );
}

function PlayerRow({
  player,
  t,
}: {
  player: Player;
  t: (typeof COACH_STRINGS)[keyof typeof COACH_STRINGS];
}) {
  const initials = `${player.firstName?.[0] ?? ""}${player.lastName?.[0] ?? ""}`.toUpperCase();
  return (
    <div className="grid grid-cols-[1fr_1fr_72px_88px] sm:grid-cols-[1.4fr_1.4fr_88px_88px] items-center px-4 sm:px-5 py-3 text-sm border-t border-ink-600/60 first:border-0 hover:bg-ink-600/30 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar initials={initials} size={32} />
        <div className="min-w-0">
          <div className="text-white font-medium truncate">
            {player.firstName} {player.lastName}
          </div>
          <div className="text-xs text-slate-500 hidden sm:block">
            {t[`gender${player.gender}` as const]}
          </div>
        </div>
      </div>
      <div className="text-slate-400 truncate hidden sm:block">
        {player.academyName}
      </div>
      <div className="text-slate-300 text-xs truncate">{player.beltName}</div>
      <div className="text-right rtl:text-left">
        <span
          className={`inline-flex items-center text-[10px] uppercase tracking-[0.14em] font-medium border rounded px-1.5 py-0.5 ${COLOR_BY_STATUS[player.status]}`}
        >
          {t[`status${player.status}` as const]}
        </span>
      </div>
    </div>
  );
}

function AcademyCard({
  academy,
  t,
}: {
  academy: AcademyDTO;
  t: (typeof COACH_STRINGS)[keyof typeof COACH_STRINGS];
}) {
  return (
    <div className="card bg-ink-700 border border-ink-600/70 rounded-xl p-5 flex items-start gap-4">
      <span className="shrink-0 w-11 h-11 rounded-lg bg-flag/10 border border-flag/30 text-flag flex items-center justify-center">
        <Building2 size={20} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-white truncate">
          {academy.academyName}
        </div>
        <div className="text-xs text-slate-400 mt-0.5">{academy.location}</div>
        {academy.establishedDate && (
          <div className="mt-2 text-xs text-slate-500">
            {t.establishedDate}:{" "}
            <span className="text-slate-200">
              {format(new Date(academy.establishedDate), "PP")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function PlayersSkeleton() {
  return (
    <div className="bg-ink-700 border border-ink-600/70 rounded-xl overflow-hidden">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="grid grid-cols-[1fr_1fr_72px_88px] sm:grid-cols-[1.4fr_1.4fr_88px_88px] items-center gap-3 px-5 py-3 border-t border-ink-600/60 first:border-0"
        >
          <div className="flex items-center gap-3">
            <Skeleton width={32} height={32} className="rounded-full" />
            <Skeleton width={140} height={16} />
          </div>
          <Skeleton width={100} height={14} className="hidden sm:block" />
          <Skeleton width={60} height={14} />
          <Skeleton width={70} height={20} />
        </div>
      ))}
    </div>
  );
}

function AcademiesSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[0, 1].map((i) => (
        <div
          key={i}
          className="bg-ink-700 border border-ink-600/70 rounded-xl p-5 flex items-start gap-4"
        >
          <Skeleton width={44} height={44} className="rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton width="60%" height={16} />
            <Skeleton width="40%" height={12} />
            <Skeleton width="50%" height={12} />
          </div>
        </div>
      ))}
    </div>
  );
}
