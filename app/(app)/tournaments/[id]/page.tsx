"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import {
  CalendarDays,
  CircleCheck,
  Clock,
  Lock,
  MapPin,
  Medal,
  Plus,
  Trophy,
  UserMinus,
  Users,
} from "lucide-react";
import { TopNav } from "@/components/dashboard/top-nav";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { PrimaryButton } from "@/components/ui/primary-button";
import {
  TournamentStatusBadge,
  TournamentTypeBadge,
} from "@/components/tournaments/tournament-badges";
import { RegisterPlayerModal } from "@/components/tournaments/register-player-modal";
import { BracketList } from "@/components/brackets/bracket-list";
import { BRACKET_STRINGS } from "@/lib/i18n/bracket-strings";
import { fetchBrackets } from "@/lib/brackets/api";
import { useAuth } from "@/hooks/use-auth";
import { useLangStore } from "@/lib/i18n/store";
import { BROWSE_STRINGS } from "@/lib/i18n/browse-strings";
import {
  TOURNAMENT_STRINGS,
  type TournamentStrings,
} from "@/lib/i18n/tournament-strings";
import { getMyAcademies } from "@/lib/coach/api";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  fetchParticipants,
  fetchTournament,
  withdrawParticipant,
} from "@/lib/tournaments/api";
import type { TournamentDTO } from "@/types/dashboard";
import type { TournamentParticipantDTO } from "@/types/tournament";

type BrowseStrings = (typeof BROWSE_STRINGS)[keyof typeof BROWSE_STRINGS];

function formatDate(iso: string) {
  return format(parseISO(iso), "PP");
}

function formatDateRange(start: string, end: string) {
  return start === end
    ? formatDate(start)
    : `${formatDate(start)} – ${formatDate(end)}`;
}

export default function TournamentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = use(params);
  const id = Number(idStr);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { lang } = useLangStore();
  const b = BROWSE_STRINGS[lang];
  const t = TOURNAMENT_STRINGS[lang];
  const bt = BRACKET_STRINGS[lang];

  const [registerOpen, setRegisterOpen] = useState(false);
  const [withdrawTarget, setWithdrawTarget] =
    useState<TournamentParticipantDTO | null>(null);

  const isCoach = user?.roles.includes("ROLE_COACH") ?? false;
  const isAdmin = user?.roles.includes("ROLE_ADMIN") ?? false;

  const tournamentQ = useQuery({
    queryKey: ["tournaments", "detail", id],
    queryFn: () => fetchTournament(id),
    enabled: Number.isFinite(id),
    retry: (count, err) =>
      // A 404 is a definitive answer — don't retry it
      !(isAxiosError(err) && err.response?.status === 404) && count < 1,
  });

  const rosterQ = useQuery({
    queryKey: ["tournaments", "detail", id, "participants"],
    queryFn: () => fetchParticipants(id),
    enabled: Number.isFinite(id) && !!tournamentQ.data,
  });

  // Brackets: shown once published (admins also see drafts). While any bracket is
  // still being played the list refreshes by itself, so progress and champions
  // appear without reloading.
  const bracketsQ = useQuery({
    queryKey: ["brackets", "list", id],
    queryFn: () => fetchBrackets(id),
    enabled: Number.isFinite(id) && !!tournamentQ.data,
    refetchInterval: (query) =>
      query.state.data?.some((b) => b.status === "PUBLISHED" && !b.complete) ? 15000 : false,
    refetchIntervalInBackground: false,
  });

  // Which academies the viewer coaches decides whose entries they may withdraw
  // and whose players they may register.
  const academiesQ = useQuery({
    queryKey: ["coach", "me", "academies"],
    queryFn: getMyAcademies,
    enabled: isCoach,
  });

  const withdrawMutation = useMutation({
    mutationFn: (entry: TournamentParticipantDTO) =>
      withdrawParticipant(id, entry.participantId),
    onSuccess: () => {
      toast.success(t.withdrawSuccess);
      setWithdrawTarget(null);
      queryClient.invalidateQueries({ queryKey: ["tournaments", "detail", id] });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, t.withdrawFailed));
      setWithdrawTarget(null);
    },
  });

  if (!user) return null;

  const tournament = tournamentQ.data;
  const roster = rosterQ.data ?? [];
  const myAcademies = academiesQ.data ?? [];
  const myAcademyIds = new Set(myAcademies.map((a) => a.academyId));

  const notFound =
    !Number.isFinite(id) ||
    (tournamentQ.isError &&
      isAxiosError(tournamentQ.error) &&
      tournamentQ.error.response?.status === 404);

  const entriesAreEditable =
    !!tournament &&
    tournament.status !== "COMPLETED" &&
    tournament.status !== "CANCELLED";
  const canWithdraw = (entry: TournamentParticipantDTO) =>
    entriesAreEditable &&
    (entry.status === "REGISTERED" || entry.status === "CONFIRMED") &&
    (isAdmin || myAcademyIds.has(entry.academyId));

  const canRegister =
    !!tournament?.registrationOpen && isCoach && myAcademies.length > 0;

  // The API returns entries ordered by division then weight; Map keeps that order.
  const groups = new Map<number, TournamentParticipantDTO[]>();
  for (const entry of roster) {
    const list = groups.get(entry.categoryId) ?? [];
    list.push(entry);
    groups.set(entry.categoryId, list);
  }

  const registeredPlayerIds = new Set(
    roster
      .filter((e) => e.status !== "DISQUALIFIED")
      .map((e) => e.playerId),
  );

  return (
    <>
      <TopNav user={user} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-6">
        <PageHeader
          title={tournament?.tournamentName ?? b.tournamentsTitle}
          back={{
            label: t.backToTournaments,
            onClick: () => router.push("/tournaments"),
          }}
        />

        {tournamentQ.isLoading && <DetailSkeleton />}

        {notFound && (
          <EmptyState
            icon={Trophy}
            title={t.notFound}
            body={t.notFoundBody}
            action={
              <PrimaryButton
                type="button"
                onClick={() => router.push("/tournaments")}
                className="w-auto px-5"
              >
                {t.backToTournaments}
              </PrimaryButton>
            }
          />
        )}

        {tournamentQ.isError && !notFound && (
          <ErrorState
            message={t.loadFailed}
            retryLabel={t.retry}
            onRetry={() => tournamentQ.refetch()}
          />
        )}

        {tournament && (
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
            <SummaryCard tournament={tournament} t={t} b={b} />

            <div className="space-y-5">
              <RegistrationBanner
                tournament={tournament}
                t={t}
                onRegister={canRegister ? () => setRegisterOpen(true) : undefined}
              />

              {((bracketsQ.data?.length ?? 0) > 0 || isAdmin) && (
                <BracketList
                  tournamentId={tournament.tournamentId}
                  brackets={bracketsQ.data ?? []}
                  isAdmin={isAdmin}
                  t={bt}
                />
              )}

              <section className="card bg-ink-700 border border-ink-600/70 rounded-xl p-6">
                <SectionHeader title={t.about} />
                {tournament.description ? (
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {tournament.description}
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
                    title={t.participants}
                    action={
                      !rosterQ.isLoading && !rosterQ.isError ? (
                        <span className="text-xs text-slate-500 shrink-0">
                          {t.participantsCount(roster.length)}
                        </span>
                      ) : undefined
                    }
                  />
                </div>

                {rosterQ.isLoading && <RosterSkeleton />}

                {rosterQ.isError && (
                  <ErrorState
                    message={t.loadFailed}
                    retryLabel={t.retry}
                    onRetry={() => rosterQ.refetch()}
                  />
                )}

                {!rosterQ.isLoading && !rosterQ.isError && roster.length === 0 && (
                  <div className="px-6 pb-8 pt-2 text-center">
                    <div className="inline-flex w-10 h-10 rounded-full bg-ink-800 border border-ink-600 text-slate-400 items-center justify-center mb-2">
                      <Users size={18} />
                    </div>
                    <p className="text-sm text-slate-400">{t.noParticipants}</p>
                  </div>
                )}

                {!rosterQ.isLoading &&
                  !rosterQ.isError &&
                  [...groups.entries()].map(([categoryId, entries]) => (
                    <div key={categoryId}>
                      <div className="flex items-center justify-between gap-3 px-6 py-2 bg-ink-800/60 border-y border-ink-600/60">
                        <div className="text-xs font-semibold text-white">
                          {entries[0].categoryName}
                          <span className="ltr:ml-2 rtl:mr-2 font-normal text-slate-500">
                            {t[`gender${entries[0].categoryGender}` as const]}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {t.entriesCount(entries.length)}
                        </div>
                      </div>
                      {entries.map((entry) => (
                        <ParticipantRow
                          key={entry.participantId}
                          entry={entry}
                          t={t}
                          onWithdraw={
                            canWithdraw(entry)
                              ? () => setWithdrawTarget(entry)
                              : undefined
                          }
                        />
                      ))}
                    </div>
                  ))}
              </section>
            </div>
          </div>
        )}
      </main>

      {registerOpen && tournament && (
        <RegisterPlayerModal
          tournamentId={tournament.tournamentId}
          academies={myAcademies}
          registeredPlayerIds={registeredPlayerIds}
          t={t}
          onClose={() => setRegisterOpen(false)}
          onRegistered={() =>
            queryClient.invalidateQueries({ queryKey: ["tournaments", "detail", id] })
          }
        />
      )}

      <ConfirmModal
        open={!!withdrawTarget}
        onClose={() => setWithdrawTarget(null)}
        onConfirm={() => withdrawTarget && withdrawMutation.mutate(withdrawTarget)}
        title={t.withdrawTitle}
        body={
          withdrawTarget
            ? t.withdrawBody(
                `${withdrawTarget.playerFirstName} ${withdrawTarget.playerLastName}`,
              )
            : undefined
        }
        confirmLabel={t.withdrawConfirm}
        cancelLabel={t.cancel}
        loading={withdrawMutation.isPending}
        loadingLabel={t.withdrawing}
        danger
      />
    </>
  );
}

function SummaryCard({
  tournament,
  t,
  b,
}: {
  tournament: TournamentDTO;
  t: TournamentStrings;
  b: BrowseStrings;
}) {
  const taken = tournament.participantCount ?? 0;
  const max = tournament.maxParticipants;
  const percent = max ? Math.min(100, Math.round((taken / max) * 100)) : 0;

  return (
    <aside className="card bg-ink-700 border border-ink-600/70 rounded-xl p-6 self-start">
      <div className="flex flex-col items-center text-center mb-5">
        <span className="w-20 h-20 rounded-2xl bg-flag/10 border border-flag/30 text-flag flex items-center justify-center mb-3">
          <Trophy size={36} />
        </span>
        <div className="text-base font-semibold text-white">
          {tournament.tournamentName}
        </div>
        <div className="mt-2 flex items-center justify-center gap-2 flex-wrap">
          <TournamentStatusBadge
            status={tournament.status}
            label={(b[`status${tournament.status}` as keyof BrowseStrings] as string) ?? tournament.status}
          />
          {tournament.tournamentType && (
            <TournamentTypeBadge
              type={tournament.tournamentType}
              label={b[`type${tournament.tournamentType}` as keyof BrowseStrings] as string}
            />
          )}
        </div>
      </div>

      <SectionHeader title={t.details} />
      <div>
        <InfoRow icon={CalendarDays} label={t.dates}>
          {formatDateRange(tournament.startDate, tournament.endDate)}
        </InfoRow>
        <InfoRow icon={MapPin} label={t.venue}>
          {tournament.venue}
        </InfoRow>
        <InfoRow icon={Clock} label={t.regDeadline}>
          {tournament.registrationDeadline &&
            formatDate(tournament.registrationDeadline)}
        </InfoRow>
        {tournament.status === "COMPLETED" && (
          <InfoRow icon={Medal} label={t.rankingPoints}>
            {tournament.pointsFinalizedAt
              ? t.pointsPublished
              : tournament.pointsPublishAt
                ? t.pointsPending(formatDate(tournament.pointsPublishAt))
                : null}
          </InfoRow>
        )}
        <InfoRow icon={Users} label={t.capacity}>
          <div>{max ? t.capacityOf(taken, max) : t.capacityOpen(taken)}</div>
          {max ? (
            <div
              className="mt-2 h-1.5 rounded-full bg-ink-800 overflow-hidden"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={max}
              aria-valuenow={Math.min(taken, max)}
            >
              <div
                className="h-full bg-flag rounded-full"
                style={{ width: `${percent}%` }}
              />
            </div>
          ) : null}
        </InfoRow>
      </div>
    </aside>
  );
}

function RegistrationBanner({
  tournament,
  t,
  onRegister,
}: {
  tournament: TournamentDTO;
  t: TournamentStrings;
  onRegister?: () => void;
}) {
  const open = !!tournament.registrationOpen;
  const reason = tournament.registrationClosedReason;
  const until = tournament.registrationDeadline ?? tournament.startDate;

  return (
    <section
      className={`rounded-xl border p-5 flex items-start gap-3.5 flex-wrap sm:flex-nowrap ${
        open
          ? "bg-emerald-500/10 border-emerald-500/30"
          : "bg-ink-700 border-ink-600/70"
      }`}
    >
      <span
        className={`shrink-0 w-9 h-9 rounded-lg border flex items-center justify-center ${
          open
            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
            : "bg-ink-800 border-ink-600 text-slate-400"
        }`}
      >
        {open ? <CircleCheck size={18} /> : <Lock size={16} />}
      </span>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-semibold ${open ? "text-emerald-200" : "text-white"}`}>
          {open ? t.regOpen : t.regClosed}
        </div>
        <p className="text-sm text-slate-300 mt-0.5 text-pretty">
          {open
            ? t.regOpenUntil(formatDate(until))
            : reason
              ? t[`closed${reason}` as const]
              : null}
        </p>
      </div>
      {onRegister && (
        <PrimaryButton
          type="button"
          onClick={onRegister}
          className="w-auto px-4 !py-2 text-xs shrink-0"
        >
          <Plus size={14} />
          {t.registerPlayers}
        </PrimaryButton>
      )}
    </section>
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
  const hasContent = children != null && children !== "" && children !== false;
  return (
    <div className="py-2.5 border-b border-ink-600/40 last:border-0 flex items-start gap-3">
      <span className="mt-0.5 shrink-0 text-slate-500">
        <Icon size={14} />
      </span>
      <div className="min-w-0 flex-1">
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

function ParticipantRow({
  entry,
  t,
  onWithdraw,
}: {
  entry: TournamentParticipantDTO;
  t: TournamentStrings;
  onWithdraw?: () => void;
}) {
  const initials =
    `${entry.playerFirstName?.[0] ?? ""}${entry.playerLastName?.[0] ?? ""}`.toUpperCase();
  const isBlackBelt = entry.beltColor === "Black";
  const flagged = entry.status === "DISQUALIFIED";

  return (
    <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[2fr_1.6fr_1.2fr_auto] gap-3 items-center px-6 py-3 text-sm border-t border-ink-600/60 first:border-0 hover:bg-ink-600/30 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar initials={initials} size={32} />
        <div className="min-w-0">
          <div className="text-white font-medium truncate">
            {entry.playerFirstName} {entry.playerLastName}
          </div>
          <div className="text-xs text-slate-500 sm:hidden truncate">
            {entry.academyName}
          </div>
        </div>
      </div>
      <div className="hidden sm:block min-w-0">
        <Link
          href={`/academies/${entry.academyId}`}
          className="text-xs text-slate-300 hover:text-flag transition-colors truncate block"
        >
          {entry.academyName}
        </Link>
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
          {entry.beltName ?? "—"}
        </span>
      </div>
      <div className="flex items-center justify-end gap-2 sm:min-w-[96px]">
        {entry.status !== "REGISTERED" && (
          <span
            className={`inline-flex items-center text-[10px] uppercase tracking-[0.14em] font-medium border rounded px-1.5 py-0.5 ${
              flagged
                ? "bg-red-500/10 text-red-300 border-red-500/30"
                : entry.status === "NO_SHOW"
                  ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                  : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
            }`}
          >
            {t[`status${entry.status}` as keyof TournamentStrings] as string}
          </span>
        )}
        {onWithdraw && (
          <button
            type="button"
            onClick={onWithdraw}
            aria-label={`${t.withdraw}: ${entry.playerFirstName} ${entry.playerLastName}`}
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-red-300 transition-colors"
          >
            <UserMinus size={13} />
            <span>{t.withdraw}</span>
          </button>
        )}
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
          <Skeleton width={160} height={18} />
        </div>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="py-2.5">
            <Skeleton width="80%" height={14} />
          </div>
        ))}
      </div>
      <div className="space-y-5">
        <div className="bg-ink-700 border border-ink-600/70 rounded-xl p-5">
          <Skeleton width="55%" height={16} />
        </div>
        <div className="bg-ink-700 border border-ink-600/70 rounded-xl p-6 space-y-2">
          <Skeleton width={120} height={16} />
          <Skeleton width="100%" height={14} />
          <Skeleton width="85%" height={14} />
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
