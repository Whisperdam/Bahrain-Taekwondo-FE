"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { fetchTournamentClasses, listAgeGroupsAdmin } from "@/lib/classes/api";
import type { ClassesStrings } from "@/lib/i18n/classes-strings";
import type { AgeGroupAdmin, ClassGender, WeightClassAdmin } from "@/types/classes";

const GENDERS: ClassGender[] = ["MALE", "FEMALE", "MIXED"];

function sameSet(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((id) => set.has(id));
}

/**
 * Which classes a tournament accepts. Creating starts with every class selected; editing starts
 * from what the tournament has now. `changed` says whether the admin touched it, so an edit that
 * leaves the classes alone doesn't send them (and can't trip the "only before it starts" rule).
 */
export function useClassSelection(open: boolean, tournamentId: number | null) {
  const groupsQ = useQuery({
    queryKey: ["admin", "age-groups"],
    queryFn: listAgeGroupsAdmin,
    enabled: open,
  });
  const currentQ = useQuery({
    queryKey: ["tournaments", "detail", tournamentId, "classes"],
    queryFn: () => fetchTournamentClasses(tournamentId as number),
    enabled: open && tournamentId != null,
  });
  const [chosen, setChosen] = useState<number[] | null>(null);

  const groups = useMemo(() => groupsQ.data ?? [], [groupsQ.data]);
  const defaultIds = useMemo(
    () =>
      tournamentId == null
        ? groups
            .filter((g) => !g.archived)
            .flatMap((g) => g.classes.filter((c) => !c.archived).map((c) => c.categoryId))
        : (currentQ.data ?? []).flatMap((g) => g.classes.map((c) => c.categoryId)),
    [groups, currentQ.data, tournamentId],
  );

  const ready = !groupsQ.isLoading && (tournamentId == null || !currentQ.isLoading);
  const selected = chosen ?? defaultIds;
  return {
    groups,
    selected,
    setSelected: setChosen,
    ready,
    changed: chosen != null && !sameSet(chosen, defaultIds),
    isError: groupsQ.isError || currentQ.isError,
  };
}

interface ClassPickerProps {
  groups: AgeGroupAdmin[];
  value: number[];
  onChange: (ids: number[]) => void;
  loading: boolean;
  failed: boolean;
  disabled?: boolean;
  error?: string;
  t: ClassesStrings;
}

export function ClassPicker({
  groups,
  value,
  onChange,
  loading,
  failed,
  disabled,
  error,
  t,
}: ClassPickerProps) {
  const selected = useMemo(() => new Set(value), [value]);

  // Archived groups and classes are only listed while the tournament still holds them.
  const visible = groups
    .map((g) => ({
      group: g,
      classes: g.classes.filter((c) => !c.archived || selected.has(c.categoryId)),
    }))
    .filter(({ group, classes }) => classes.length > 0 && (!group.archived || classes.some((c) => selected.has(c.categoryId))));
  const total = visible.reduce((n, v) => n + v.classes.length, 0);

  function toggleGroup(ids: number[], on: boolean) {
    const next = new Set(selected);
    ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
    onChange([...next]);
  }

  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
        <span className="text-sm font-medium text-slate-200">{t.pickerTitle}</span>
        <div className="flex items-center gap-3 text-xs">
          {!loading && total > 0 && (
            <span className="text-slate-500 tabular-nums">{t.selectedCount(value.length, total)}</span>
          )}
          {!disabled && total > 0 && (
            <>
              <button
                type="button"
                onClick={() => onChange(visible.flatMap((v) => v.classes.map((c) => c.categoryId)))}
                className="text-slate-300 hover:text-flag transition-colors"
              >
                {t.selectAll}
              </button>
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-slate-300 hover:text-flag transition-colors"
              >
                {t.clearAll}
              </button>
            </>
          )}
        </div>
      </div>
      <p className="text-xs text-slate-500 mb-2">{disabled ? t.pickerLocked : t.pickerHint}</p>

      <div
        className={cn(
          "rounded-lg border bg-ink-800/50 max-h-72 overflow-y-auto",
          error ? "border-red-500/70" : "border-ink-600",
        )}
      >
        {loading && (
          <div className="p-3 space-y-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} width="100%" height={18} />
            ))}
          </div>
        )}
        {!loading && failed && <p className="p-3 text-sm text-red-300">{t.pickerLoadFailed}</p>}
        {!loading && !failed && total === 0 && (
          <p className="p-3 text-sm text-slate-400">{t.pickerEmpty}</p>
        )}
        {!loading &&
          visible.map(({ group, classes }) => {
            const ids = classes.map((c) => c.categoryId);
            const chosenHere = ids.filter((id) => selected.has(id)).length;
            return (
              <div key={group.ageGroupId} className="px-3 py-2.5 border-b border-ink-600/60 last:border-0">
                <div className="flex items-center justify-between gap-3">
                  <Checkbox
                    id={`pick-group-${group.ageGroupId}`}
                    checked={chosenHere === ids.length}
                    disabled={disabled}
                    onChange={(on) => toggleGroup(ids, on)}
                  >
                    <span className="font-medium text-white">{group.name}</span>
                    <span className="ms-2 text-xs text-slate-500 tabular-nums">
                      {t.ages(group.minAge, group.maxAge)}
                    </span>
                  </Checkbox>
                  <span className="text-[11px] text-slate-500 tabular-nums">
                    {chosenHere}/{ids.length}
                  </span>
                </div>
                <div className="mt-2 ps-6 space-y-1.5">
                  {GENDERS.map((gender) => {
                    const rows = classes.filter((c) => c.gender === gender);
                    if (rows.length === 0) return null;
                    return (
                      <div key={gender} className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                        <span className="w-14 text-[10px] uppercase tracking-[0.14em] text-slate-500">
                          {gender === "MALE" ? t.male : gender === "FEMALE" ? t.female : t.mixed}
                        </span>
                        {rows.map((c) => (
                          <ClassOption
                            key={c.categoryId}
                            c={c}
                            t={t}
                            checked={selected.has(c.categoryId)}
                            disabled={disabled}
                            onChange={(on) => toggleGroup([c.categoryId], on)}
                          />
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>

      {error && <p className="mt-1.5 text-xs text-red-300">{error}</p>}
      <Link
        href="/admin/classes"
        className="inline-block mt-2 text-xs text-slate-400 hover:text-flag transition-colors"
      >
        {t.manageClasses}
      </Link>
    </div>
  );
}

function ClassOption({
  c,
  t,
  checked,
  disabled,
  onChange,
}: {
  c: WeightClassAdmin;
  t: ClassesStrings;
  checked: boolean;
  disabled?: boolean;
  onChange: (on: boolean) => void;
}) {
  // The name already says the age group and gender; here only the limit matters.
  const label = c.maxWeight != null ? `-${c.maxWeight}` : c.minWeight && c.minWeight > 0 ? `+${c.minWeight}` : t.anyWeight;
  return (
    <Checkbox id={`pick-class-${c.categoryId}`} checked={checked} disabled={disabled} onChange={onChange}>
      <span className={cn("tabular-nums", c.archived && "text-slate-500 line-through")} title={c.name}>
        {c.maxWeight != null || (c.minWeight ?? 0) > 0 ? `${label} kg` : label}
      </span>
    </Checkbox>
  );
}
