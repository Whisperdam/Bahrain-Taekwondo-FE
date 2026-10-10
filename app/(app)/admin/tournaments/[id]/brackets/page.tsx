"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { TopNav } from "@/components/dashboard/top-nav";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { PlacementBoard } from "@/components/brackets/placement-board";
import { BracketManager } from "@/components/brackets/bracket-manager";
import { useAuth } from "@/hooks/use-auth";
import { useLangStore } from "@/lib/i18n/store";
import { BRACKET_STRINGS } from "@/lib/i18n/bracket-strings";
import { fetchBrackets } from "@/lib/brackets/api";
import { fetchTournament } from "@/lib/tournaments/api";

type Tab = "placement" | "brackets";

export default function AdminBracketsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = use(params);
  const tournamentId = Number(idStr);
  const router = useRouter();
  const { user } = useAuth();
  const { lang } = useLangStore();
  const t = BRACKET_STRINGS[lang];
  const [tab, setTab] = useState<Tab>("placement");

  const tournamentQ = useQuery({
    queryKey: ["tournaments", "detail", tournamentId],
    queryFn: () => fetchTournament(tournamentId),
    enabled: Number.isFinite(tournamentId),
  });
  // Published classes are locked on the weigh-in tab, so the board needs to know them.
  const bracketsQ = useQuery({
    queryKey: ["brackets", "list", tournamentId],
    queryFn: () => fetchBrackets(tournamentId),
    enabled: Number.isFinite(tournamentId),
    staleTime: 0,
  });

  if (!user) return null;

  const lockedCategoryIds = new Set(
    (bracketsQ.data ?? []).filter((b) => b.status === "PUBLISHED").map((b) => b.categoryId),
  );

  return (
    <>
      <TopNav user={user} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-6">
        <PageHeader
          title={t.setupTitle}
          subtitle={tournamentQ.data ? `${tournamentQ.data.tournamentName} — ${t.setupSub}` : t.setupSub}
          back={{
            label: t.backToAdminTournaments,
            onClick: () => router.push("/admin/tournaments"),
          }}
        />

        <Tabs<Tab>
          items={[
            { value: "placement", label: t.tabPlacement },
            { value: "brackets", label: t.tabBrackets },
          ]}
          active={tab}
          onChange={setTab}
        />

        <div className="mt-5">
          {tab === "placement" ? (
            <PlacementBoard tournamentId={tournamentId} t={t} lockedCategoryIds={lockedCategoryIds} />
          ) : (
            <BracketManager tournamentId={tournamentId} t={t} />
          )}
        </div>
      </main>
    </>
  );
}
