"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { isAxiosError } from "axios";
import { Building2, MapPin, Phone, Mail, CalendarDays, Users } from "lucide-react";
import { TopNav } from "@/components/dashboard/top-nav";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { PrimaryButton } from "@/components/ui/primary-button";
import { useAuth } from "@/hooks/use-auth";
import { useLangStore } from "@/lib/i18n/store";
import { BROWSE_STRINGS } from "@/lib/i18n/browse-strings";
import { fetchAcademy, fetchAcademyPlayers } from "@/lib/dashboard/api";
import type { AcademyPlayerDTO } from "@/types/dashboard";

export default function AcademyDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = use(params);
  const id = Number(idStr);
  const router = useRouter();
  const { user } = useAuth();
  const { lang } = useLangStore();
  const t = BROWSE_STRINGS[lang];

  const academyQ = useQuery({
    queryKey: ["academies", "detail", id],
    queryFn: () => fetchAcademy(id),
    enabled: Number.isFinite(id),
    retry: (count, err) =>
      // A 404 is a definitive answer — don't retry it
      !(isAxiosError(err) && err.response?.status === 404) && count < 1,
  });

  const playersQ = useQuery({
    queryKey: ["academies", "detail", id, "players"],
    queryFn: () => fetchAcademyPlayers(id),
    enabled: Number.isFinite(id) && !!academyQ.data,
  });

  if (!user) return null;

  const notFound =
    !Number.isFinite(id) ||
    (academyQ.isError &&
      isAxiosError(academyQ.error) &&
      academyQ.error.response?.status === 404);

  const academy = academyQ.data;
  const players = playersQ.data ?? [];

  return (
    <>
      <TopNav user={user} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-6">
        <PageHeader
          title={academy?.academyName ?? t.academiesTitle}
          back={{
            label: t.backToAcademies,
            onClick: () => router.push("/academies"),
          }}
        />

        {academyQ.isLoading && <DetailSkeleton />}

        {notFound && (
          <EmptyState
            icon={Building2}
            title={t.academyNotFound}
            body={t.academyNotFoundBody}
            action={
              <PrimaryButton
                type="button"
                onClick={() => router.push("/academies")}
                className="w-auto px-5"
              >
                {t.backToAcademies}
              </PrimaryButton>
            }
          />
        )}

        {academyQ.isError && !notFound && (
          <ErrorState
            message={t.loadFailed}
            retryLabel={t.retry}
            onRetry={() => academyQ.refetch()}
          />
        )}

        {academy && (
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
            {/* Left — identity + contact */}
            <aside className="card bg-ink-700 border border-ink-600/70 rounded-xl p-6 self-start">
              <div className="flex flex-col items-center text-center mb-5">
                {/* Placeholder mark — academies don't have uploadable logos yet */}
                <span className="w-20 h-20 rounded-2xl bg-flag/10 border border-flag/30 text-flag flex items-center justify-center mb-3">
                  <Building2 size={36} />
                </span>
                <div className="text-base font-semibold text-white">
                  {academy.academyName}
                </div>
                {academy.location && (
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                    <MapPin size={12} />
                    {academy.location}
                  </div>
                )}
              </div>

              <SectionHeader title={t.contactInfo} />
              <div>
                <InfoRow icon={Phone} label={t.adPhone}>
                  {academy.phone && (
                    <span
                      className="font-mono text-xs inline-block"
                      style={{ direction: "ltr" }}
                    >
                      {academy.phone}
                    </span>
                  )}
                </InfoRow>
                <InfoRow icon={Mail} label={t.adEmail}>
                  {academy.email && (
                    <span
                      className="font-mono text-xs inline-block"
                      style={{ direction: "ltr" }}
                    >
                      {academy.email}
                    </span>
                  )}
                </InfoRow>
                <InfoRow icon={MapPin} label={t.adLocation}>
                  {academy.location}
                </InfoRow>
                <InfoRow icon={CalendarDays} label={t.adEstablished}>
                  {academy.establishedDate &&
                    format(new Date(academy.establishedDate), "PP")}
                </InfoRow>
              </div>
            </aside>

            {/* Right — about + roster */}
            <div className="space-y-5">
              <section className="card bg-ink-700 border border-ink-600/70 rounded-xl p-6">
                <SectionHeader title={t.aboutAcademy} />
                {academy.description ? (
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {academy.description}
                  </p>
                ) : (
                  <p className="text-sm text-slate-500 italic">
                    {t.noDescription}
                  </p>
                )}
              </section>

              <section className="bg-ink-700 border border-ink-600/70 rounded-xl overflow-hidden">
                <div className="px-6 pt-6 pb-1">
                  <SectionHeader
                    title={t.registeredPlayers}
                    action={
                      !playersQ.isLoading ? (
                        <span className="text-xs text-slate-500 shrink-0">
                          {t.playersCount(players.length)}
                        </span>
                      ) : undefined
                    }
                  />
                </div>

                {playersQ.isLoading && <RosterSkeleton />}

                {playersQ.isError && (
                  <ErrorState
                    message={t.loadFailed}
                    retryLabel={t.retry}
                    onRetry={() => playersQ.refetch()}
                  />
                )}

                {!playersQ.isLoading && !playersQ.isError && players.length === 0 && (
                  <div className="px-6 pb-8 pt-2 text-center">
                    <div className="inline-flex w-10 h-10 rounded-full bg-ink-800 border border-ink-600 text-slate-400 items-center justify-center mb-2">
                      <Users size={18} />
                    </div>
                    <p className="text-sm text-slate-400">{t.noPlayers}</p>
                  </div>
                )}

                {!playersQ.isLoading && !playersQ.isError && players.length > 0 && (
                  <>
                    <div className="hidden sm:grid grid-cols-[2fr_1fr_1.2fr_90px] px-6 py-2.5 text-[10px] uppercase tracking-[0.16em] text-slate-500 border-b border-ink-600/60 font-medium">
                      <div>{t.colPlayer}</div>
                      <div>{t.colGender}</div>
                      <div>{t.colBelt}</div>
                      <div className="text-right rtl:text-left">{t.colPoints}</div>
                    </div>
                    {players.map((p) => (
                      <PlayerRow key={p.playerId} player={p} t={t} />
                    ))}
                  </>
                )}
              </section>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  children?: React.ReactNode;
}) {
  const hasContent = children != null && children !== "";
  return (
    <div className="py-2.5 border-b border-ink-600/40 last:border-0 flex items-start gap-3">
      <span className="mt-0.5 shrink-0 text-slate-500">
        <Icon size={14} />
      </span>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
          {label}
        </div>
        <div className="text-sm text-slate-100 mt-0.5">
          {hasContent ? children : <span className="text-slate-500 italic">—</span>}
        </div>
      </div>
    </div>
  );
}

function PlayerRow({
  player,
  t,
}: {
  player: AcademyPlayerDTO;
  t: (typeof BROWSE_STRINGS)[keyof typeof BROWSE_STRINGS];
}) {
  const initials =
    `${player.firstName?.[0] ?? ""}${player.lastName?.[0] ?? ""}`.toUpperCase();
  const isBlackBelt = player.beltColor === "Black";
  return (
    <div className="grid grid-cols-[1fr_90px] sm:grid-cols-[2fr_1fr_1.2fr_90px] gap-3 items-center px-6 py-3 text-sm border-t border-ink-600/60 first:border-0 hover:bg-ink-600/30 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar initials={initials} size={32} />
        <div className="min-w-0">
          <div className="text-white font-medium truncate">
            {player.firstName} {player.lastName}
          </div>
          <div className="text-xs text-slate-500 sm:hidden truncate">
            {player.beltName ?? "—"}
          </div>
        </div>
      </div>
      <div className="hidden sm:block text-slate-400 text-xs">
        {player.gender === "MALE" ? t.genderMALEShort : t.genderFEMALEShort}
      </div>
      <div className="hidden sm:block">
        <span
          className={`inline-flex items-center gap-1.5 text-xs ${
            isBlackBelt ? "text-white font-medium" : "text-slate-300"
          }`}
        >
          {isBlackBelt && (
            <span
              className="w-2 h-2 rounded-full bg-white/90 border border-ink-500"
              aria-hidden="true"
            />
          )}
          {player.beltName ?? "—"}
        </span>
      </div>
      <div className="text-right rtl:text-left text-white font-semibold tabular-nums text-xs">
        {player.rankingPoints ?? 0}
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
      <div className="bg-ink-700 border border-ink-600/70 rounded-xl p-6">
        <div className="flex flex-col items-center mb-5">
          <Skeleton width={80} height={80} className="rounded-2xl mb-3" />
          <Skeleton width={140} height={18} />
        </div>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="py-2.5">
            <Skeleton width="80%" height={14} />
          </div>
        ))}
      </div>
      <div className="space-y-5">
        <div className="bg-ink-700 border border-ink-600/70 rounded-xl p-6 space-y-2">
          <Skeleton width={120} height={16} />
          <Skeleton width="100%" height={14} />
          <Skeleton width="85%" height={14} />
        </div>
        <div className="bg-ink-700 border border-ink-600/70 rounded-xl p-6 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton width={32} height={32} className="rounded-full" />
              <Skeleton width={150} height={16} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RosterSkeleton() {
  return (
    <div className="px-6 pb-6 space-y-3">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton width={32} height={32} className="rounded-full" />
          <Skeleton width={150} height={16} />
        </div>
      ))}
    </div>
  );
}
