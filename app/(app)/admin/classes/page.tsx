"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Layers, ListPlus, Lock, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { TopNav } from "@/components/dashboard/top-nav";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ErrorBanner } from "@/components/ui/error-banner";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { useAuth } from "@/hooks/use-auth";
import { useLangStore } from "@/lib/i18n/store";
import { ADMIN_STRINGS } from "@/lib/i18n/admin-strings";
import { CLASSES_STRINGS, type ClassesStrings } from "@/lib/i18n/classes-strings";
import { getApiErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import {
  addLadder,
  addWeightClass,
  createAgeGroup,
  listAgeGroupsAdmin,
  removeAgeGroup,
  removeWeightClass,
  restoreAgeGroup,
  restoreWeightClass,
  updateAgeGroup,
  updateWeightClass,
} from "@/lib/classes/api";
import type {
  AgeGroupAdmin,
  ClassGender,
  WeightClassAdmin,
} from "@/types/classes";

const GENDERS: ClassGender[] = ["MALE", "FEMALE", "MIXED"];
const LISTKEY = ["admin", "age-groups"] as const;

function limitText(c: WeightClassAdmin, t: ClassesStrings): string {
  if (c.maxWeight != null) return t.upTo(String(c.maxWeight));
  return c.minWeight != null && c.minWeight > 0 ? t.over(String(c.minWeight)) : t.anyWeight;
}

function genderLabel(g: ClassGender, t: ClassesStrings): string {
  return g === "MALE" ? t.male : g === "FEMALE" ? t.female : t.mixed;
}

export default function AdminClassesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { lang } = useLangStore();
  const t = CLASSES_STRINGS[lang];
  const admin = ADMIN_STRINGS[lang];
  const qc = useQueryClient();

  const [showArchived, setShowArchived] = useState(false);
  const [groupForm, setGroupForm] = useState<{ group: AgeGroupAdmin | null } | null>(null);
  const [classForm, setClassForm] = useState<
    { group: AgeGroupAdmin; cls: WeightClassAdmin | null } | null
  >(null);
  const [ladderFor, setLadderFor] = useState<AgeGroupAdmin | null>(null);
  const [removeGroupTarget, setRemoveGroupTarget] = useState<AgeGroupAdmin | null>(null);
  const [removeClassTarget, setRemoveClassTarget] = useState<WeightClassAdmin | null>(null);

  const listQ = useQuery({ queryKey: LISTKEY, queryFn: listAgeGroupsAdmin });

  function refresh() {
    qc.invalidateQueries({ queryKey: LISTKEY });
    qc.invalidateQueries({ queryKey: ["age-groups"] });
  }

  const removeGroup = useMutation({
    mutationFn: (g: AgeGroupAdmin) => removeAgeGroup(g.ageGroupId),
    onSuccess: (result) => {
      toast.success(result.archived ? t.groupArchived : t.groupDeleted);
      setRemoveGroupTarget(null);
      refresh();
    },
    onError: (err) => toast.error(getApiErrorMessage(err, t.actionFailed)),
  });

  const removeClass = useMutation({
    mutationFn: (c: WeightClassAdmin) => removeWeightClass(c.categoryId),
    onSuccess: (group, c) => {
      const stillThere = group.classes.some((x) => x.categoryId === c.categoryId);
      toast.success(stillThere ? t.classArchived : t.classDeleted);
      setRemoveClassTarget(null);
      refresh();
    },
    onError: (err) => toast.error(getApiErrorMessage(err, t.actionFailed)),
  });

  const restoreGroup = useMutation({
    mutationFn: (g: AgeGroupAdmin) => restoreAgeGroup(g.ageGroupId),
    onSuccess: () => {
      toast.success(t.groupRestored);
      refresh();
    },
    onError: (err) => toast.error(getApiErrorMessage(err, t.actionFailed)),
  });

  const restoreClass = useMutation({
    mutationFn: (c: WeightClassAdmin) => restoreWeightClass(c.categoryId),
    onSuccess: () => {
      toast.success(t.classRestored);
      refresh();
    },
    onError: (err) => toast.error(getApiErrorMessage(err, t.actionFailed)),
  });

  if (!user) return null;

  const groups = (listQ.data ?? []).filter((g) => showArchived || !g.archived);
  const hasArchived = (listQ.data ?? []).some(
    (g) => g.archived || g.classes.some((c) => c.archived),
  );

  return (
    <>
      <TopNav user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-6">
        <PageHeader
          title={t.title}
          subtitle={t.subtitle}
          back={{ label: admin.backToAdmin, onClick: () => router.push("/admin") }}
          action={
            <PrimaryButton
              type="button"
              onClick={() => setGroupForm({ group: null })}
              className="!py-2 !px-3.5 text-xs w-auto"
            >
              <Plus size={14} />
              {t.newGroup}
            </PrimaryButton>
          }
        />

        <p className="mb-5 rounded-lg border border-ink-600/70 bg-ink-700 px-4 py-3 text-sm text-slate-300 leading-relaxed">
          {t.info}
        </p>

        {hasArchived && (
          <div className="mb-4">
            <Checkbox id="show-archived" checked={showArchived} onChange={setShowArchived}>
              {t.showArchived}
            </Checkbox>
          </div>
        )}

        {listQ.isLoading && (
          <div className="space-y-4">
            {[0, 1].map((i) => (
              <Skeleton key={i} width="100%" height={150} />
            ))}
          </div>
        )}

        {listQ.isError && (
          <div className="bg-ink-700 border border-ink-600/70 rounded-xl">
            <ErrorState message={t.loadFailed} retryLabel={t.retry} onRetry={() => listQ.refetch()} />
          </div>
        )}

        {!listQ.isLoading && !listQ.isError && groups.length === 0 && (
          <EmptyState
            icon={Layers}
            title={t.emptyTitle}
            body={t.emptyBody}
            action={
              <PrimaryButton
                type="button"
                onClick={() => setGroupForm({ group: null })}
                className="w-auto px-4"
              >
                <Plus size={14} />
                {t.newGroup}
              </PrimaryButton>
            }
          />
        )}

        <div className="space-y-4">
          {groups.map((g) => (
            <AgeGroupCard
              key={g.ageGroupId}
              group={g}
              t={t}
              showArchived={showArchived}
              busy={restoreGroup.isPending || restoreClass.isPending}
              onEdit={() => setGroupForm({ group: g })}
              onRemove={() => setRemoveGroupTarget(g)}
              onRestore={() => restoreGroup.mutate(g)}
              onAddClass={() => setClassForm({ group: g, cls: null })}
              onAddSeveral={() => setLadderFor(g)}
              onEditClass={(cls) => setClassForm({ group: g, cls })}
              onRemoveClass={setRemoveClassTarget}
              onRestoreClass={(c) => restoreClass.mutate(c)}
            />
          ))}
        </div>
      </main>

      {/* Keyed so a different target remounts with fresh values */}
      {groupForm && (
        <GroupFormModal
          key={groupForm.group?.ageGroupId ?? "new"}
          group={groupForm.group}
          t={t}
          onClose={() => setGroupForm(null)}
          onSaved={() => {
            setGroupForm(null);
            refresh();
          }}
        />
      )}
      {classForm && (
        <ClassFormModal
          key={`${classForm.group.ageGroupId}/${classForm.cls?.categoryId ?? "new"}`}
          group={classForm.group}
          cls={classForm.cls}
          t={t}
          onClose={() => setClassForm(null)}
          onSaved={() => {
            setClassForm(null);
            refresh();
          }}
        />
      )}
      {ladderFor && (
        <LadderModal
          key={ladderFor.ageGroupId}
          group={ladderFor}
          t={t}
          onClose={() => setLadderFor(null)}
          onSaved={() => {
            setLadderFor(null);
            refresh();
          }}
        />
      )}

      <ConfirmModal
        open={!!removeGroupTarget}
        onClose={() => setRemoveGroupTarget(null)}
        onConfirm={() => removeGroupTarget && removeGroup.mutate(removeGroupTarget)}
        title={t.removeGroupTitle}
        body={t.removeGroupBody}
        confirmLabel={t.remove}
        cancelLabel={t.cancel}
        loading={removeGroup.isPending}
        danger
      />
      <ConfirmModal
        open={!!removeClassTarget}
        onClose={() => setRemoveClassTarget(null)}
        onConfirm={() => removeClassTarget && removeClass.mutate(removeClassTarget)}
        title={t.removeClassTitle}
        body={t.removeClassBody}
        confirmLabel={t.remove}
        cancelLabel={t.cancel}
        loading={removeClass.isPending}
        danger
      />
    </>
  );
}

// ─── One age group with its classes ──────────────────────────────────────────

function AgeGroupCard({
  group,
  t,
  showArchived,
  busy,
  onEdit,
  onRemove,
  onRestore,
  onAddClass,
  onAddSeveral,
  onEditClass,
  onRemoveClass,
  onRestoreClass,
}: {
  group: AgeGroupAdmin;
  t: ClassesStrings;
  showArchived: boolean;
  busy: boolean;
  onEdit: () => void;
  onRemove: () => void;
  onRestore: () => void;
  onAddClass: () => void;
  onAddSeveral: () => void;
  onEditClass: (c: WeightClassAdmin) => void;
  onRemoveClass: (c: WeightClassAdmin) => void;
  onRestoreClass: (c: WeightClassAdmin) => void;
}) {
  const visible = group.classes.filter((c) => showArchived || !c.archived);
  return (
    <section
      className={cn(
        "bg-ink-700 border border-ink-600/70 rounded-xl overflow-hidden",
        group.archived && "opacity-70",
      )}
    >
      <header className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-ink-600/60">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-white truncate">{group.name}</h2>
            <span className="text-xs text-slate-300 tabular-nums bg-ink-800 border border-ink-600 rounded px-1.5 py-0.5">
              {t.ages(group.minAge, group.maxAge)}
            </span>
            {group.archived && <Badge tone="amber">{t.archivedBadge}</Badge>}
            {group.locked && (
              <Badge tone="slate">
                <Lock size={10} />
                {t.inUseBadge}
              </Badge>
            )}
          </div>
          {group.tournamentCount > 0 && (
            <p className="text-xs text-slate-500 mt-1">{t.usedBy(group.tournamentCount)}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {group.archived ? (
            <SecondaryButton onClick={onRestore} disabled={busy}>
              <RotateCcw size={14} />
              {t.restore}
            </SecondaryButton>
          ) : (
            <>
              <SecondaryButton onClick={onAddClass}>
                <Plus size={14} />
                {t.addClass}
              </SecondaryButton>
              <SecondaryButton onClick={onAddSeveral}>
                <ListPlus size={14} />
                {t.addSeveral}
              </SecondaryButton>
              <IconButton label={t.editGroup} onClick={onEdit}>
                <Pencil size={15} />
              </IconButton>
              <IconButton label={t.removeGroup} onClick={onRemove} danger>
                <Trash2 size={15} />
              </IconButton>
            </>
          )}
        </div>
      </header>

      {visible.length === 0 ? (
        <p className="px-5 py-6 text-sm text-slate-500">{t.noClassesYet}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-ink-600/50">
          {GENDERS.map((gender) => {
            const rows = visible.filter((c) => c.gender === gender);
            if (rows.length === 0) return null;
            return (
              <div key={gender} className="bg-ink-700 px-5 py-4">
                <h3 className="text-[10px] uppercase tracking-[0.16em] text-slate-500 font-medium mb-2">
                  {genderLabel(gender, t)}
                </h3>
                <ul className="space-y-1">
                  {rows.map((c) => (
                    <li
                      key={c.categoryId}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-ink-600/30",
                        c.archived && "opacity-60",
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-sm text-white truncate">{c.name}</div>
                        <div className="text-xs text-slate-500 tabular-nums">
                          {limitText(c, t)}
                          {c.tournamentCount > 0 && ` · ${t.usedBy(c.tournamentCount)}`}
                        </div>
                      </div>
                      {c.archived ? (
                        <>
                          <Badge tone="amber">{t.archivedBadge}</Badge>
                          {!group.archived && (
                            <IconButton label={t.restore} onClick={() => onRestoreClass(c)}>
                              <RotateCcw size={14} />
                            </IconButton>
                          )}
                        </>
                      ) : group.archived ? null : (
                        <>
                          {c.locked && (
                            <span className="text-slate-500" aria-hidden="true">
                              <Lock size={12} />
                            </span>
                          )}
                          <IconButton label={t.editClass} onClick={() => onEditClass(c)}>
                            <Pencil size={14} />
                          </IconButton>
                          <IconButton label={t.removeClass} onClick={() => onRemoveClass(c)} danger>
                            <Trash2 size={14} />
                          </IconButton>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Badge({ tone, children }: { tone: "amber" | "slate"; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] font-medium border rounded px-1.5 py-0.5",
        tone === "amber"
          ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
          : "bg-slate-500/10 text-slate-300 border-slate-500/30",
      )}
    >
      {children}
    </span>
  );
}

function IconButton({
  label,
  onClick,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "p-1.5 rounded-md text-slate-400 hover:bg-ink-600/60 transition-colors",
        danger ? "hover:text-red-300" : "hover:text-flag",
      )}
    >
      {children}
    </button>
  );
}

// ─── Age group form ──────────────────────────────────────────────────────────

function GroupFormModal({
  group,
  t,
  onClose,
  onSaved,
}: {
  group: AgeGroupAdmin | null;
  t: ClassesStrings;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(group?.name ?? "");
  const [minAge, setMinAge] = useState(group ? String(group.minAge) : "");
  const [maxAge, setMaxAge] = useState(group ? String(group.maxAge) : "");
  const [errors, setErrors] = useState<{ name?: string; ages?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const agesLocked = !!group?.locked;

  const save = useMutation({
    mutationFn: () => {
      const body = { name: name.trim(), minAge: Number(minAge), maxAge: Number(maxAge) };
      return group ? updateAgeGroup(group.ageGroupId, body) : createAgeGroup(body);
    },
    onSuccess: () => {
      toast.success(group ? t.groupUpdated : t.groupCreated);
      onSaved();
    },
    onError: (err) => setServerError(getApiErrorMessage(err, t.actionFailed)),
  });

  function submit() {
    const e: { name?: string; ages?: string } = {};
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 40) e.name = t.errName;
    const lo = Number(minAge);
    const hi = Number(maxAge);
    if (
      minAge === "" ||
      maxAge === "" ||
      !Number.isInteger(lo) ||
      !Number.isInteger(hi) ||
      lo < 0 ||
      hi > 120 ||
      lo > hi
    ) {
      e.ages = t.errAges;
    }
    setErrors(e);
    setServerError(null);
    if (!e.name && !e.ages) save.mutate();
  }

  return (
    <Modal
      open
      onClose={() => !save.isPending && onClose()}
      title={group ? t.groupEditTitle : t.groupNewTitle}
      dismissible={!save.isPending}
      footer={
        <>
          <SecondaryButton onClick={onClose} disabled={save.isPending}>
            {t.cancel}
          </SecondaryButton>
          <PrimaryButton
            type="button"
            onClick={submit}
            loading={save.isPending}
            loadingText={t.saving}
            className="w-auto px-4"
          >
            {t.save}
          </PrimaryButton>
        </>
      }
    >
      {serverError && <ErrorBanner>{serverError}</ErrorBanner>}
      <Field id="ag-name" label={t.nameLabel} error={errors.name}>
        <Input
          id="ag-name"
          value={name}
          maxLength={40}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.namePh}
          error={!!errors.name}
        />
      </Field>
      <div className="grid grid-cols-2 gap-x-4">
        <Field id="ag-min" label={t.minAge} error={errors.ages}>
          <Input
            id="ag-min"
            type="number"
            inputMode="numeric"
            min={0}
            max={120}
            value={minAge}
            disabled={agesLocked}
            onChange={(e) => setMinAge(e.target.value)}
            error={!!errors.ages}
          />
        </Field>
        <Field id="ag-max" label={t.maxAge}>
          <Input
            id="ag-max"
            type="number"
            inputMode="numeric"
            min={0}
            max={120}
            value={maxAge}
            disabled={agesLocked}
            onChange={(e) => setMaxAge(e.target.value)}
            error={!!errors.ages}
          />
        </Field>
      </div>
      <p className="text-xs text-slate-500 -mt-2">
        {agesLocked ? t.lockedAgesHint : t.agesHint}
      </p>
    </Modal>
  );
}

// ─── One weight class ────────────────────────────────────────────────────────

function ClassFormModal({
  group,
  cls,
  t,
  onClose,
  onSaved,
}: {
  group: AgeGroupAdmin;
  cls: WeightClassAdmin | null;
  t: ClassesStrings;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [gender, setGender] = useState<ClassGender>(cls?.gender ?? "MALE");
  const [limit, setLimit] = useState(cls?.maxWeight != null ? String(cls.maxWeight) : "");
  const [openEnded, setOpenEnded] = useState(cls ? cls.maxWeight == null : false);
  const [error, setError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const locked = !!cls?.locked;

  const save = useMutation({
    mutationFn: () => {
      const maxWeight = openEnded ? null : Number(limit);
      return cls
        ? updateWeightClass(cls.categoryId, { maxWeight })
        : addWeightClass(group.ageGroupId, { gender, maxWeight });
    },
    onSuccess: () => {
      toast.success(cls ? t.classUpdated : t.classAdded);
      onSaved();
    },
    onError: (err) => setServerError(getApiErrorMessage(err, t.actionFailed)),
  });

  function submit() {
    setServerError(null);
    if (!openEnded) {
      const n = Number(limit);
      const decimals = limit.includes(".") ? limit.split(".")[1].length : 0;
      if (limit.trim() === "" || !Number.isFinite(n) || n <= 0 || n > 300 || decimals > 2) {
        setError(t.errLimit);
        return;
      }
    }
    setError(null);
    save.mutate();
  }

  return (
    <Modal
      open
      onClose={() => !save.isPending && onClose()}
      title={`${cls ? t.classEditTitle : t.classAddTitle} · ${group.name}`}
      dismissible={!save.isPending}
      footer={
        <>
          <SecondaryButton onClick={onClose} disabled={save.isPending}>
            {t.cancel}
          </SecondaryButton>
          <PrimaryButton
            type="button"
            onClick={submit}
            disabled={locked}
            loading={save.isPending}
            loadingText={t.saving}
            className="w-auto px-4"
          >
            {t.save}
          </PrimaryButton>
        </>
      }
    >
      {serverError && <ErrorBanner>{serverError}</ErrorBanner>}
      {!cls && (
        <Field id="wc-gender" label={t.genderLabel}>
          <Select
            id="wc-gender"
            value={gender}
            onChange={(e) => setGender(e.target.value as ClassGender)}
          >
            {GENDERS.map((g) => (
              <option key={g} value={g}>
                {genderLabel(g, t)}
              </option>
            ))}
          </Select>
        </Field>
      )}
      <Field id="wc-limit" label={t.limitLabel} error={error ?? undefined}>
        <Input
          id="wc-limit"
          type="number"
          inputMode="decimal"
          min={0}
          max={300}
          step="0.5"
          value={limit}
          disabled={openEnded || locked}
          onChange={(e) => setLimit(e.target.value)}
          placeholder={t.limitPh}
          error={!!error}
          style={{ direction: "ltr" }}
        />
      </Field>
      <Checkbox id="wc-open" checked={openEnded} onChange={setOpenEnded} disabled={locked}>
        {t.openEnded}
      </Checkbox>
      <p className="text-xs text-slate-500 mt-2">{locked ? t.lockedLimitHint : t.openEndedHint}</p>
    </Modal>
  );
}

// ─── Several limits at once ──────────────────────────────────────────────────

function LadderModal({
  group,
  t,
  onClose,
  onSaved,
}: {
  group: AgeGroupAdmin;
  t: ClassesStrings;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [gender, setGender] = useState<ClassGender>("MALE");
  const [limits, setLimits] = useState("");
  const [openEnded, setOpenEnded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const parsed = parseLimits(limits);

  const save = useMutation({
    mutationFn: () =>
      addLadder(group.ageGroupId, { gender, limits: parsed ?? [], openEnded }),
    onSuccess: () => {
      toast.success(t.classesAdded);
      onSaved();
    },
    onError: (err) => setServerError(getApiErrorMessage(err, t.actionFailed)),
  });

  function submit() {
    setServerError(null);
    if (parsed === null || (parsed.length === 0 && !openEnded)) {
      setError(t.errLimits);
      return;
    }
    setError(null);
    save.mutate();
  }

  return (
    <Modal
      open
      onClose={() => !save.isPending && onClose()}
      title={`${t.ladderTitle} · ${group.name}`}
      dismissible={!save.isPending}
      footer={
        <>
          <SecondaryButton onClick={onClose} disabled={save.isPending}>
            {t.cancel}
          </SecondaryButton>
          <PrimaryButton
            type="button"
            onClick={submit}
            loading={save.isPending}
            loadingText={t.adding}
            className="w-auto px-4"
          >
            {t.add}
          </PrimaryButton>
        </>
      }
    >
      {serverError && <ErrorBanner>{serverError}</ErrorBanner>}
      <Field id="lad-gender" label={t.genderLabel}>
        <Select
          id="lad-gender"
          value={gender}
          onChange={(e) => setGender(e.target.value as ClassGender)}
        >
          {GENDERS.map((g) => (
            <option key={g} value={g}>
              {genderLabel(g, t)}
            </option>
          ))}
        </Select>
      </Field>
      <Field id="lad-limits" label={t.limitsLabel} hint={t.ladderHint} error={error ?? undefined}>
        <Input
          id="lad-limits"
          value={limits}
          onChange={(e) => setLimits(e.target.value)}
          placeholder={t.limitsPh}
          error={!!error}
          style={{ direction: "ltr" }}
        />
      </Field>
      <Checkbox id="lad-open" checked={openEnded} onChange={setOpenEnded}>
        {t.addTopClass}
      </Checkbox>
    </Modal>
  );
}

/** "28, 35 41" → [28, 35, 41]; null if anything in it is not a plain positive number. */
function parseLimits(raw: string): number[] | null {
  const parts = raw
    .split(/[\s,،;]+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const numbers: number[] = [];
  for (const p of parts) {
    if (!/^\d+(\.\d{1,2})?$/.test(p)) return null;
    const n = Number(p);
    if (n <= 0 || n > 300) return null;
    if (!numbers.includes(n)) numbers.push(n);
  }
  return numbers;
}
