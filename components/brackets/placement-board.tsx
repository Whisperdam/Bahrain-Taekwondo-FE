"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Lock, Search, UserX } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/api/errors";
import { fetchWeightCategories } from "@/lib/tournaments/api";
import { fetchWeighInBoard, placeBulk, placeEntry } from "@/lib/brackets/api";
import type { BracketStrings } from "@/lib/i18n/bracket-strings";
import type { WeightCategoryDTO } from "@/types/tournament";
import type { BulkPlacementRequest, EntryStatus, WeighInBoard, WeighInEntry } from "@/types/bracket";

type StatusFilter = "ALL" | EntryStatus;

const STATUS_STYLE: Record<EntryStatus, string> = {
  REGISTERED: "bg-slate-500/10 text-slate-300 border-slate-500/30",
  CONFIRMED: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  NO_SHOW: "bg-amber-500/10 text-amber-300 border-amber-500/30",
};

const ROW_GRID =
  "grid grid-cols-[28px_1fr] md:grid-cols-[28px_2fr_1.3fr_1.7fr_92px_auto] gap-x-3 gap-y-2 items-center";

/** The first class whose weight window (min, max] holds the weight and that the player may enter. */
function suggestClass(
  categories: WeightCategoryDTO[],
  entry: WeighInEntry,
  weight: number | null,
): WeightCategoryDTO | undefined {
  if (weight == null) return undefined;
  return categories.find(
    (c) =>
      (c.gender === entry.gender) &&
      (c.minWeight == null || weight > c.minWeight) &&
      (c.maxWeight == null || weight <= c.maxWeight),
  );
}

interface PlacementBoardProps {
  tournamentId: number;
  t: BracketStrings;
  /** Classes whose bracket is published: nobody can be moved in or out. */
  lockedCategoryIds: Set<number>;
}

export function PlacementBoard({ tournamentId, t, lockedCategoryIds }: PlacementBoardProps) {
  const queryClient = useQueryClient();
  const boardKey = ["admin", "weighin", tournamentId] as const;

  const boardQ = useQuery({
    queryKey: boardKey,
    queryFn: () => fetchWeighInBoard(tournamentId),
    staleTime: 0,
  });
  const categoriesQ = useQuery({
    queryKey: ["weight-categories", "all"],
    queryFn: () => fetchWeightCategories(),
    staleTime: 60 * 60 * 1000,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [classFilter, setClassFilter] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [confirmPlaceAll, setConfirmPlaceAll] = useState(false);

  const entries = useMemo(() => boardQ.data?.entries ?? [], [boardQ.data]);
  const categories = useMemo(() => categoriesQ.data ?? [], [categoriesQ.data]);

  function replaceEntry(updated: WeighInEntry) {
    queryClient.setQueryData<WeighInBoard>(boardKey, (board) =>
      board
        ? { ...board, entries: board.entries.map((e) => (e.participantId === updated.participantId ? updated : e)) }
        : board,
    );
    queryClient.invalidateQueries({ queryKey: ["brackets"] }); // drafts may now be out of date
  }

  const single = useMutation({
    mutationFn: (v: { id: number; body: Parameters<typeof placeEntry>[2] }) =>
      placeEntry(tournamentId, v.id, v.body),
    onSuccess: replaceEntry,
    onError: (err) => toast.error(getApiErrorMessage(err, t.loadFailed)),
  });

  const bulk = useMutation({
    mutationFn: (body: BulkPlacementRequest) => placeBulk(tournamentId, body),
    onSuccess: (result) => {
      toast.success(t.bulkDone(result.updated, result.skipped));
      setSelected(new Set());
      setConfirmPlaceAll(false);
      queryClient.invalidateQueries({ queryKey: boardKey });
      queryClient.invalidateQueries({ queryKey: ["brackets"] });
    },
    onError: (err) => {
      setConfirmPlaceAll(false);
      toast.error(getApiErrorMessage(err, t.loadFailed));
    },
  });

  const counts = useMemo(() => {
    const c = { total: entries.length, placed: 0, undecided: 0, noShow: 0 };
    for (const e of entries) {
      if (e.status === "CONFIRMED") c.placed++;
      else if (e.status === "NO_SHOW") c.noShow++;
      else c.undecided++;
    }
    return c;
  }, [entries]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter(
      (e) =>
        (statusFilter === "ALL" || e.status === statusFilter) &&
        (!classFilter || String(e.declaredCategoryId) === classFilter) &&
        (!q || e.playerName.toLowerCase().includes(q) || (e.academyName ?? "").toLowerCase().includes(q)),
    );
  }, [entries, search, statusFilter, classFilter]);

  const groups = useMemo(() => {
    const map = new Map<number, WeighInEntry[]>();
    for (const e of visible) {
      const list = map.get(e.declaredCategoryId) ?? [];
      list.push(e);
      map.set(e.declaredCategoryId, list);
    }
    return [...map.entries()];
  }, [visible]);

  const declaredClasses = useMemo(() => {
    const seen = new Map<number, string>();
    entries.forEach((e) => seen.set(e.declaredCategoryId, e.declaredCategoryName));
    return [...seen.entries()];
  }, [entries]);

  if (boardQ.isLoading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} width="100%" height={44} />
        ))}
      </div>
    );
  }
  if (boardQ.isError) {
    return <ErrorState message={t.loadFailed} retryLabel={t.retry} onRetry={() => boardQ.refetch()} />;
  }

  const selectableVisible = visible.filter((e) => !isLocked(e));
  const allVisibleSelected =
    selectableVisible.length > 0 && selectableVisible.every((e) => selected.has(e.participantId));

  function isLocked(e: WeighInEntry) {
    return e.placedCategoryId != null && lockedCategoryIds.has(e.placedCategoryId);
  }

  function toggle(id: number, on: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  const busy = single.isPending || bulk.isPending;

  return (
    <div>
      {boardQ.data?.registrationOpen && (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-100">
          {t.registrationStillOpen}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Stat label={t.statRegistered} value={counts.total} />
        <Stat label={t.statPlaced} value={counts.placed} tone="emerald" />
        <Stat label={t.statUndecided} value={counts.undecided} />
        <Stat label={t.statNoShow} value={counts.noShow} tone="amber" />
      </div>

      <div className="bg-ink-700 border border-ink-600/70 rounded-xl p-4 mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <span className="pointer-events-none absolute top-1/2 -translate-y-1/2 ltr:left-3 rtl:right-3 text-slate-400">
            <Search size={15} />
          </span>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlayers}
            className="ltr:pl-9 rtl:pr-9"
            aria-label={t.searchPlayers}
          />
        </div>
        <div className="w-[170px]">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)} aria-label={t.colStatus}>
            <option value="ALL">{t.filterAll}</option>
            <option value="REGISTERED">{t.filterUndecided}</option>
            <option value="CONFIRMED">{t.filterPlaced}</option>
            <option value="NO_SHOW">{t.filterNoShow}</option>
          </Select>
        </div>
        <div className="w-[190px]">
          <Select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} aria-label={t.colRegisteredIn}>
            <option value="">{t.allClasses}</option>
            {declaredClasses.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </Select>
        </div>
        <PrimaryButton
          type="button"
          className="w-auto px-4"
          disabled={counts.undecided === 0 || busy}
          onClick={() => setConfirmPlaceAll(true)}
        >
          {t.placeAllDeclared}
        </PrimaryButton>
      </div>

      {selected.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-flag/30 bg-flag/10 px-4 py-2.5">
          <span className="text-sm font-medium text-white">{t.selected(selected.size)}</span>
          <SecondaryButton
            disabled={busy}
            onClick={() => bulk.mutate({ action: "NO_SHOW", participantIds: [...selected] })}
          >
            <UserX size={14} />
            {t.markNoShow}
          </SecondaryButton>
          <SecondaryButton
            disabled={busy}
            onClick={() => bulk.mutate({ action: "RESET", participantIds: [...selected] })}
          >
            {t.resetSelected}
          </SecondaryButton>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="text-sm text-slate-300 hover:text-flag ms-auto transition-colors"
          >
            {t.clearSelection}
          </button>
        </div>
      )}

      {entries.length === 0 ? (
        <p className="text-sm text-slate-400 py-10 text-center">{t.nothingRegistered}</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-slate-400 py-10 text-center">{t.nothingMatches}</p>
      ) : (
        <div className="bg-ink-700 border border-ink-600/70 rounded-xl overflow-hidden">
          <div className={cn(ROW_GRID, "hidden md:grid px-4 py-2.5 text-[10px] uppercase tracking-[0.16em] text-slate-500 border-b border-ink-600/60 font-medium")}>
            <Checkbox
              id="select-all"
              checked={allVisibleSelected}
              onChange={(on) => setSelected(on ? new Set(selectableVisible.map((e) => e.participantId)) : new Set())}
            />
            <div>{t.colPlayer}</div>
            <div>{t.colRegisteredIn}</div>
            <div>{t.colPlacedIn}</div>
            <div>{t.colWeight}</div>
            <div className="text-end">{t.colStatus}</div>
          </div>
          {groups.map(([categoryId, rows]) => (
            <div key={categoryId}>
              <div className="flex items-center justify-between px-4 py-2 bg-ink-800/60 border-y border-ink-600/60">
                <div className="text-xs font-semibold text-white">{rows[0].declaredCategoryName}</div>
                <div className="text-[11px] text-slate-500">{t.entriesInClass(rows.length)}</div>
              </div>
              {rows.map((entry) => (
                <EntryRow
                  key={entry.participantId}
                  entry={entry}
                  t={t}
                  categories={categories}
                  lockedCategoryIds={lockedCategoryIds}
                  locked={isLocked(entry)}
                  selected={selected.has(entry.participantId)}
                  onSelect={(on) => toggle(entry.participantId, on)}
                  disabled={single.isPending}
                  onChange={(body) => single.mutate({ id: entry.participantId, body })}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={confirmPlaceAll}
        onClose={() => setConfirmPlaceAll(false)}
        onConfirm={() => bulk.mutate({ action: "PLACE_DECLARED" })}
        title={t.placeAllConfirmTitle}
        body={t.placeAllConfirmBody(counts.undecided)}
        confirmLabel={t.placeAllConfirm}
        cancelLabel={t.cancel}
        loading={bulk.isPending}
        loadingLabel={t.working}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "emerald" | "amber";
}) {
  return (
    <div className="bg-ink-700 border border-ink-600/70 rounded-xl px-4 py-3">
      <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div
        className={cn(
          "text-2xl font-semibold tabular-nums mt-1",
          tone === "emerald" ? "text-emerald-300" : tone === "amber" ? "text-amber-300" : "text-white",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function EntryRow({
  entry,
  t,
  categories,
  lockedCategoryIds,
  locked,
  selected,
  onSelect,
  disabled,
  onChange,
}: {
  entry: WeighInEntry;
  t: BracketStrings;
  categories: WeightCategoryDTO[];
  lockedCategoryIds: Set<number>;
  locked: boolean;
  selected: boolean;
  onSelect: (on: boolean) => void;
  disabled: boolean;
  onChange: (body: { action: "PLACE" | "NO_SHOW" | "RESET"; categoryId?: number; weighInWeight?: number }) => void;
}) {
  const [weight, setWeight] = useState(entry.weighInWeight != null ? String(entry.weighInWeight) : "");
  const options = categories.filter((c) => c.gender === "MIXED" || c.gender === entry.gender);
  const typed = weight.trim() === "" ? null : Number(weight);
  const validWeight = typed != null && Number.isFinite(typed) && typed > 0 && typed <= 300 ? typed : null;
  const suggestion =
    entry.status !== "CONFIRMED" && entry.status !== "NO_SHOW"
      ? suggestClass(options, entry, validWeight)
      : undefined;

  function saveWeight() {
    if (validWeight == null || validWeight === entry.weighInWeight) return;
    // Keep the placement as it is: a placed entry is placed again in its own class,
    // an undecided one is reset (which stores the weight without deciding anything).
    onChange(
      entry.placedCategoryId != null
        ? { action: "PLACE", categoryId: entry.placedCategoryId, weighInWeight: validWeight }
        : entry.status === "NO_SHOW"
          ? { action: "NO_SHOW", weighInWeight: validWeight }
          : { action: "RESET", weighInWeight: validWeight },
    );
  }

  return (
    <div
      className={cn(
        ROW_GRID,
        "px-4 py-2.5 border-t border-ink-600/60 first:border-0 text-sm",
        entry.status === "NO_SHOW" && "opacity-70",
      )}
    >
      <Checkbox id={`sel-${entry.participantId}`} checked={selected} onChange={onSelect} disabled={locked} />
      <div className="min-w-0">
        <div className="text-white font-medium truncate">{entry.playerName}</div>
        <div className="text-xs text-slate-500 truncate">
          {[entry.academyName, entry.beltName].filter(Boolean).join(" · ")}
        </div>
      </div>
      <div className="hidden md:block text-xs text-slate-400 truncate">{entry.declaredCategoryName}</div>
      <div className="col-span-2 md:col-span-1">
        {locked ? (
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-400" title={t.lockedHint}>
            <Lock size={12} />
            {entry.placedCategoryName}
          </div>
        ) : (
          <>
            <Select
              value={entry.placedCategoryId ?? ""}
              disabled={disabled || entry.status === "NO_SHOW"}
              onChange={(e) => e.target.value && onChange({ action: "PLACE", categoryId: Number(e.target.value) })}
              aria-label={t.colPlacedIn}
            >
              <option value="">{t.pickClass}</option>
              {options.map((c) => (
                <option key={c.categoryId} value={c.categoryId} disabled={lockedCategoryIds.has(c.categoryId)}>
                  {c.categoryName}
                </option>
              ))}
            </Select>
            {suggestion && suggestion.categoryId !== entry.placedCategoryId && (
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange({ action: "PLACE", categoryId: suggestion.categoryId, weighInWeight: validWeight ?? undefined })}
                className="mt-1 text-[11px] text-flag hover:text-flag-hover transition-colors"
              >
                {t.suggestClass(suggestion.categoryName)}
              </button>
            )}
          </>
        )}
      </div>
      <div className="col-span-2 md:col-span-1">
        <Input
          inputMode="decimal"
          value={weight}
          disabled={locked || disabled}
          onChange={(e) => setWeight(e.target.value.replace(/[^\d.]/g, "").slice(0, 6))}
          onBlur={saveWeight}
          placeholder="kg"
          aria-label={t.colWeight}
          style={{ direction: "ltr" }}
        />
      </div>
      <div className="col-span-2 md:col-span-1 flex items-center justify-between md:justify-end gap-2">
        <span
          className={cn(
            "inline-flex items-center text-[10px] uppercase tracking-[0.14em] font-medium border rounded px-1.5 py-0.5",
            STATUS_STYLE[entry.status],
          )}
        >
          {t[`status${entry.status}` as const]}
        </span>
        {!locked && entry.status !== "NO_SHOW" && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange({ action: "NO_SHOW" })}
            className="text-xs text-slate-400 hover:text-amber-300 transition-colors"
          >
            {t.noShow}
          </button>
        )}
        {!locked && entry.status !== "REGISTERED" && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange({ action: "RESET" })}
            className="text-xs text-slate-400 hover:text-flag transition-colors"
          >
            {t.reset}
          </button>
        )}
      </div>
    </div>
  );
}
