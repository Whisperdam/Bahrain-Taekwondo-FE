"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Award, Medal, Building2, Users, ArrowRight, ChevronRight } from "lucide-react";
import { TopNav } from "@/components/dashboard/top-nav";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { useAuth } from "@/hooks/use-auth";
import { useLangStore } from "@/lib/i18n/store";
import { ADMIN_STRINGS } from "@/lib/i18n/admin-strings";
import {
  listCoachQueue,
  listOfficialQueue,
  listAcademyQueue,
  searchUsers,
} from "@/lib/admin/api";

interface PendingCardProps {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  count: number | "—";
  href: string;
  cta: string;
}

function PendingCard({ icon: Icon, label, count, href, cta }: PendingCardProps) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.push(href)}
      className="card text-left bg-ink-700 border border-ink-600/70 rounded-xl p-5 flex flex-col gap-3 transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="w-10 h-10 rounded-lg bg-flag/15 border border-flag/30 text-flag flex items-center justify-center">
          <Icon size={20} />
        </span>
        <span className="text-3xl font-semibold text-white tabular-nums leading-none">
          {count}
        </span>
      </div>
      <div>
        <div className="text-sm text-slate-200 font-medium">{label}</div>
        <div className="text-xs text-flag mt-2 inline-flex items-center gap-1.5 font-medium">
          <span>{cta}</span>
          <span className="rtl:rotate-180 inline-flex">
            <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </button>
  );
}

function QuickLink({
  icon: Icon,
  label,
  href,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  href: string;
}) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.push(href)}
      className="flex items-center gap-3 bg-ink-700 border border-ink-600/70 rounded-lg px-4 py-3 hover:border-flag/40 transition-colors w-full text-left"
    >
      <span className="w-8 h-8 rounded-md bg-ink-800 border border-ink-600 text-slate-300 flex items-center justify-center">
        <Icon size={16} />
      </span>
      <span className="text-sm text-slate-200 font-medium flex-1">{label}</span>
      <span className="text-slate-500 rtl:rotate-180 inline-flex">
        <ChevronRight size={16} />
      </span>
    </button>
  );
}

export default function AdminLandingPage() {
  const { user } = useAuth();
  const { lang } = useLangStore();
  const t = ADMIN_STRINGS[lang];

  const coachQ = useQuery({
    queryKey: ["admin", "queue", "coach", "PENDING", 0],
    queryFn: () => listCoachQueue({ status: "PENDING", page: 0, size: 1 }),
  });
  const officialQ = useQuery({
    queryKey: ["admin", "queue", "official", "PENDING", 0],
    queryFn: () => listOfficialQueue({ status: "PENDING", page: 0, size: 1 }),
  });
  const academyQ = useQuery({
    queryKey: ["admin", "queue", "academy", "PENDING", 0],
    queryFn: () => listAcademyQueue({ status: "PENDING", page: 0, size: 1 }),
  });
  const usersQ = useQuery({
    queryKey: ["admin", "users", "totalCount"],
    queryFn: () => searchUsers({ page: 0, size: 1 }),
  });

  if (!user) return null;

  const valueOrDash = (n?: number): number | "—" => (n == null ? "—" : n);

  return (
    <>
      <TopNav user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-6">
        <PageHeader title={t.adminTitle} subtitle={t.adminSub} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <PendingCard
            icon={Award}
            label={t.pendingCoaches}
            count={valueOrDash(coachQ.data?.totalElements)}
            href="/admin/applications?type=coaches"
            cta={t.reviewQueue}
          />
          <PendingCard
            icon={Medal}
            label={t.pendingOfficials}
            count={valueOrDash(officialQ.data?.totalElements)}
            href="/admin/applications?type=officials"
            cta={t.reviewQueue}
          />
          <PendingCard
            icon={Building2}
            label={t.pendingAcademies}
            count={valueOrDash(academyQ.data?.totalElements)}
            href="/admin/applications?type=academies"
            cta={t.reviewQueue}
          />
          <PendingCard
            icon={Users}
            label={t.pendingUsers}
            count={valueOrDash(usersQ.data?.totalElements)}
            href="/admin/users"
            cta={t.manageUsers}
          />
        </div>

        <section className="mt-10">
          <SectionHeader title={t.quickLinks} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <QuickLink
              icon={Award}
              label={t.qlApplications}
              href="/admin/applications"
            />
            <QuickLink icon={Users} label={t.qlUsers} href="/admin/users" />
          </div>
        </section>
      </main>
    </>
  );
}
