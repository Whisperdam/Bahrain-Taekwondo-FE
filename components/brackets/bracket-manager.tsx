"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, Dices, ExternalLink, Eye, EyeOff, Trash2 } from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ErrorState } from "@/components/ui/error-state";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  deleteBracket,
  fetchBrackets,
  fetchWeighInBoard,
  generateBrackets,
  publishAllBrackets,
  publishBracket,
  setBracketCourt,
  unpublishBracket,
} from "@/lib/brackets/api";
import type { BracketStrings } from "@/lib/i18n/bracket-strings";
import type { BracketSummary } from "@/types/bracket";

type Seeding = "RANKING" | "RANDOM";

interface ClassRow {
  categoryId: number;
  name: string;
  gender: "MALE" | "FEMALE" | "MIXED";
  placed: number;
  bracket: BracketSummary | null;
}

interface BracketManagerProps {
  tournamentId: number;
  t: BracketStrings;
}

type Pending =
  | { kind: "delete"; bracket: BracketSummary }
  | { kind: "unpublish"; bracket: BracketSummary }
  | null;

export function BracketManager({ tournamentId, t }: BracketManagerProps) {
  const queryClient = useQueryClient();
  const [seeding, setSeeding] = useState<Seeding>("RANKING");
  const [pending, setPending] = useState<Pending>(null);

  const bracketsQ = useQuery({
    queryKey: ["brackets", "list", tournamentId],
    queryFn: () => fetchBrackets(tournamentId),
    staleTime: 0,
  });
  // The weigh-in board tells us how many players are placed in each class.
  const boardQ = useQuery({
    queryKey: ["admin", "weighin", tournamentId],
    queryFn: () => fetchWeighInBoard(tournamentId),
    staleTime: 0,
  });

  const rows = useMemo<ClassRow[]>(() => {
    const byClass = new Map<number, ClassRow>();
    for (const e of boardQ.data?.entries ?? []) {
      if (e.status !== "CONFIRMED" || e.placedCategoryId == null) continue;
      const row = byClass.get(e.placedCategoryId) ?? {
        categoryId: e.placedCategoryId,
        name: e.placedCategoryName ?? "",
        gender: e.gender,
        placed: 0,
        bracket: null,
      };
      row.placed++;
      byClass.set(e.placedCategoryId, row);
    }
    for (const b of bracketsQ.data ?? []) {
      const row = byClass.get(b.categoryId) ?? {
        categoryId: b.categoryId,
        name: b.categoryName,
        gender: b.categoryGender,
        placed: 0,
        bracket: null,
      };
      row.bracket = b;
      byClass.set(b.categoryId, row);
    }
    // men first, then women, then mixed; lighter classes first (by name as a fallback)
    const order = { MALE: 0, FEMALE: 1, MIXED: 2 } as const;
    return [...byClass.values()].sort(
      (a, b) => order[a.gender] - order[b.gender] || a.name.localeCompare(b.name, undefined, { numeric: true }),
    );
  }, [boardQ.data, bracketsQ.data]);

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ["brackets"] });
  }
  const onError = (err: unknown) => toast.error(getApiErrorMessage(err, t.loadFailed));

  const draw = useMutation({
    mutationFn: (categoryId?: number) => generateBrackets(tournamentId, { categoryId, seeding }),
    onSuccess: (result) => {
      const generated = result.outcomes.filter((o) => o.outcome === "GENERATED").length;
      toast.success(t.drawSummary(generated, result.outcomes.length - generated));
      refresh();
    },
    onError,
  });
  const publishAll = useMutation({
    mutationFn: () => publishAllBrackets(tournamentId),
    onSuccess: (r) => {
      toast.success(t.publishSummary(r.published, r.skippedStale));
      refresh();
    },
    onError,
  });
  const publish = useMutation({
    mutationFn: (id: number) => publishBracket(id),
    onSuccess: () => {
      toast.success(t.publishedToast);
      refresh();
    },
    onError,
  });
  const unpublish = useMutation({
    mutationFn: (id: number) => unpublishBracket(id),
    onSuccess: () => {
      toast.success(t.unpublishedToast);
      setPending(null);
      refresh();
    },
    onError: (err) => {
      setPending(null);
      onError(err);
    },
  });
  const remove = useMutation({
    mutationFn: (id: number) => deleteBracket(id),
    onSuccess: () => {
      toast.success(t.deletedToast);
      setPending(null);
      refresh();
    },
    onError: (err) => {
      setPending(null);
      onError(err);
    },
  });
  const court = useMutation({
    mutationFn: (v: { id: number; court: string }) => setBracketCourt(v.id, v.court),
    onSuccess: () => {
      toast.success(t.courtSaved);
      refresh();
    },
    onError,
  });

  if (bracketsQ.isLoading || boardQ.isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} width="100%" height={92} />
        ))}
      </div>
    );
  }
  if (bracketsQ.isError || boardQ.isError) {
    return (
      <ErrorState
        message={t.loadFailed}
        retryLabel={t.retry}
        onRetry={() => {
          bracketsQ.refetch();
          boardQ.refetch();
        }}
      />
    );
  }

  const busy = draw.isPending || publishAll.isPending || publish.isPending || unpublish.isPending || remove.isPending;
  const anyDraft = rows.some((r) => r.bracket?.status === "DRAFT");

  return (
    <div>
      <div className="bg-ink-700 border border-ink-600/70 rounded-xl p-4 mb-5 flex flex-wrap items-end gap-3">
        <div className="w-[240px]">
          <Field id="seeding" label={t.seeding}>
            <Select id="seeding" value={seeding} onChange={(e) => setSeeding(e.target.value as Seeding)}>
              <option value="RANKING">{t.seedRanking}</option>
              <option value="RANDOM">{t.seedRandom}</option>
            </Select>
          </Field>
        </div>
        <div className="mb-4">
          <PrimaryButton
            type="button"
            className="w-auto px-4"
            disabled={busy || rows.every((r) => r.placed < 2)}
            loading={draw.isPending && draw.variables === undefined}
            loadingText={t.working}
            onClick={() => draw.mutate(undefined)}
          >
            <Dices size={15} />
            {t.drawAll}
          </PrimaryButton>
        </div>
        <div className="mb-4">
          <SecondaryButton disabled={busy || !anyDraft} onClick={() => publishAll.mutate()}>
            <Eye size={15} />
            {t.publishAll}
          </SecondaryButton>
        </div>
        <p className="text-[11px] text-slate-500 w-full -mt-2">{t.drawAllHint}</p>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-slate-400 py-10 text-center">{t.noBracketsAdmin}</p>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <ClassCard
              key={row.categoryId}
              row={row}
              t={t}
              tournamentId={tournamentId}
              busy={busy}
              onDraw={() => draw.mutate(row.categoryId)}
              onPublish={() => row.bracket && publish.mutate(row.bracket.bracketId)}
              onUnpublish={() => row.bracket && setPending({ kind: "unpublish", bracket: row.bracket })}
              onDelete={() => row.bracket && setPending({ kind: "delete", bracket: row.bracket })}
              onCourt={(value) => row.bracket && court.mutate({ id: row.bracket.bracketId, court: value })}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        open={pending?.kind === "delete"}
        onClose={() => setPending(null)}
        onConfirm={() => pending && remove.mutate(pending.bracket.bracketId)}
        title={t.deleteConfirmTitle}
        body={t.deleteConfirmBody}
        confirmLabel={t.deleteDraft}
        cancelLabel={t.cancel}
        loading={remove.isPending}
        loadingLabel={t.working}
        danger
      />
      <ConfirmModal
        open={pending?.kind === "unpublish"}
        onClose={() => setPending(null)}
        onConfirm={() => pending && unpublish.mutate(pending.bracket.bracketId)}
        title={t.unpublishConfirmTitle}
        body={t.unpublishConfirmBody}
        confirmLabel={t.unpublish}
        cancelLabel={t.cancel}
        loading={unpublish.isPending}
        loadingLabel={t.working}
      />
    </div>
  );
}

function ClassCard({
  row,
  t,
  tournamentId,
  busy,
  onDraw,
  onPublish,
  onUnpublish,
  onDelete,
  onCourt,
}: {
  row: ClassRow;
  t: BracketStrings;
  tournamentId: number;
  busy: boolean;
  onDraw: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onDelete: () => void;
  onCourt: (value: string) => void;
}) {
  const b = row.bracket;
  const published = b?.status === "PUBLISHED";
  const started = (b?.matchesCompleted ?? 0) > 0;
  const [court, setCourt] = useState(b?.court ?? "");

  return (
    <section className="bg-ink-700 border border-ink-600/70 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-white">{row.name}</h3>
            <span className="text-[11px] text-slate-500">{t[`gender${row.gender}` as const]}</span>
            {b && (
              <span
                className={cn(
                  "text-[10px] uppercase tracking-[0.12em] border rounded px-1.5 py-0.5",
                  published
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                    : "border-amber-500/40 bg-amber-500/10 text-amber-300",
                )}
              >
                {published ? t.published : t.draft}
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {t.placedCount(row.placed)}
            {b && ` · ${t.progress(b.matchesCompleted, b.matchesTotal)}`}
          </div>
          {b?.stale && (
            <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-amber-300">
              <AlertTriangle size={13} />
              {t.stale}
            </div>
          )}
          {!b && row.placed < 2 && <div className="mt-1 text-xs text-slate-500">{t.needTwo}</div>}
          {!b && row.placed >= 2 && <div className="mt-1 text-xs text-slate-500">{t.notDrawn}</div>}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {b && (
            <Link href={`/tournaments/${tournamentId}/brackets/${b.bracketId}`}>
              <SecondaryButton type="button">
                <ExternalLink size={14} />
                {t.open}
              </SecondaryButton>
            </Link>
          )}
          {!published && (
            <SecondaryButton disabled={busy || row.placed < 2} onClick={onDraw}>
              <Dices size={14} />
              {b ? t.redraw : t.draw}
            </SecondaryButton>
          )}
          {b && !published && (
            <PrimaryButton type="button" className="w-auto px-3.5 !py-2 text-xs" disabled={busy || !!b.stale} onClick={onPublish}>
              <Eye size={14} />
              {t.publish}
            </PrimaryButton>
          )}
          {b && published && (
            <SecondaryButton disabled={busy || started} onClick={onUnpublish}>
              <EyeOff size={14} />
              {t.unpublish}
            </SecondaryButton>
          )}
          {b && !published && (
            <button
              type="button"
              onClick={onDelete}
              disabled={busy}
              aria-label={t.deleteDraft}
              className="p-2 rounded-md text-slate-400 hover:text-flag hover:bg-ink-600/60 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {b && (
        <div className="mt-3 max-w-[260px]">
          <Field id={`court-${b.bracketId}`} label={t.courtLabel}>
            <Input
              id={`court-${b.bracketId}`}
              value={court}
              maxLength={30}
              placeholder={t.courtPlaceholder}
              onChange={(e) => setCourt(e.target.value)}
              onBlur={() => court.trim() !== (b.court ?? "") && onCourt(court)}
            />
          </Field>
        </div>
      )}
    </section>
  );
}
