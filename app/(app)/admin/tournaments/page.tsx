"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { isAxiosError } from "axios";
import { Trophy, Plus, MoreHorizontal, Edit2, Trash2 } from "lucide-react";
import { TopNav } from "@/components/dashboard/top-nav";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { DropdownMenu, MenuItem } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useLangStore } from "@/lib/i18n/store";
import { ADMIN_STRINGS } from "@/lib/i18n/admin-strings";
import {
  listTournamentsAdmin,
  createTournament,
  updateTournament,
  deleteTournament,
} from "@/lib/admin/api";
import type { TournamentDTO } from "@/types/dashboard";
import type {
  TournamentRequest,
  TournamentStatus,
  TournamentType,
} from "@/types/admin";

const PAGE_SIZE = 10;

const STATUSES: TournamentStatus[] = [
  "UPCOMING",
  "ONGOING",
  "COMPLETED",
  "CANCELLED",
];

const TYPES: TournamentType[] = ["NATIONAL", "INTERNATIONAL", "REGIONAL"];

const STATUS_STYLES: Record<TournamentStatus, string> = {
  UPCOMING: "bg-sky-500/10 text-sky-300 border-sky-500/30",
  ONGOING: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  COMPLETED: "bg-slate-500/10 text-slate-300 border-slate-500/30",
  CANCELLED: "bg-red-500/10 text-red-300 border-red-500/30",
};

export default function AdminTournamentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { lang } = useLangStore();
  const t = ADMIN_STRINGS[lang];
  const qc = useQueryClient();

  const [status, setStatus] = useState<TournamentStatus>("UPCOMING");
  const [page, setPage] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TournamentDTO | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<TournamentDTO | null>(
    null,
  );

  const listQ = useQuery({
    queryKey: ["admin", "tournaments", status, page],
    queryFn: () => listTournamentsAdmin({ status, page, size: PAGE_SIZE }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTournament(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "tournaments"] });
      qc.invalidateQueries({ queryKey: ["tournaments"] });
      setConfirmDelete(null);
      toast.success(t.toastTournamentDeleted);
    },
    onError: () => toast.error(t.toastAppActionFailed),
  });

  if (!user) return null;

  const rows = listQ.data?.content ?? [];
  const totalElements = listQ.data?.totalElements ?? 0;
  const totalPages = listQ.data?.totalPages ?? 1;

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(row: TournamentDTO) {
    setEditing(row);
    setFormOpen(true);
  }

  return (
    <>
      <TopNav user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-6">
        <PageHeader
          title={t.adminTournamentsTitle}
          subtitle={t.adminTournamentsSub}
          back={{ label: t.backToAdmin, onClick: () => router.push("/admin") }}
          action={
            <PrimaryButton
              type="button"
              onClick={openCreate}
              className="!py-2 !px-3.5 text-xs w-auto"
            >
              <Plus size={14} />
              {t.newTournament}
            </PrimaryButton>
          }
        />

        <Tabs<TournamentStatus>
          items={STATUSES.map((s) => ({
            value: s,
            label: t[`tStatus${s}` as const],
          }))}
          active={status}
          onChange={(s) => {
            setStatus(s);
            setPage(0);
          }}
        />

        <div className="mt-5 bg-ink-700 border border-ink-600/70 rounded-xl overflow-hidden">
          {listQ.isLoading && <TableSkeleton />}

          {!listQ.isLoading && rows.length === 0 && (
            <div className="p-12 text-center">
              <div className="inline-flex w-12 h-12 rounded-full bg-ink-800 border border-ink-600 text-slate-400 items-center justify-center mb-3">
                <Trophy size={22} />
              </div>
              <p className="text-sm text-slate-400">{t.tournamentsEmpty}</p>
            </div>
          )}

          {!listQ.isLoading && rows.length > 0 && (
            <>
              <div className="hidden md:grid grid-cols-[2.2fr_1fr_1.6fr_1.4fr_110px_44px] px-5 py-2.5 text-[10px] uppercase tracking-[0.16em] text-slate-500 border-b border-ink-600/60 font-medium">
                <div>{t.colTournament}</div>
                <div>{t.colType}</div>
                <div>{t.colVenue}</div>
                <div>{t.colDates}</div>
                <div>{t.colStatus}</div>
                <div></div>
              </div>
              {rows.map((row) => (
                <TournamentRow
                  key={row.tournamentId}
                  row={row}
                  t={t}
                  onEdit={() => openEdit(row)}
                  onDelete={() => setConfirmDelete(row)}
                />
              ))}
            </>
          )}
        </div>

        {totalElements > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={setPage}
            showingText={t.showing(
              page * PAGE_SIZE + 1,
              page * PAGE_SIZE + rows.length,
              totalElements,
            )}
            pageOfText={`${t.page} ${page + 1} ${t.of} ${totalPages}`}
          />
        )}
      </main>

      {/* Keyed so editing a different row remounts with fresh values */}
      <TournamentFormModal
        key={editing?.tournamentId ?? "new"}
        open={formOpen}
        editing={editing}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmModal
        open={!!confirmDelete}
        onClose={() => !deleteMutation.isPending && setConfirmDelete(null)}
        onConfirm={() =>
          confirmDelete && deleteMutation.mutate(confirmDelete.tournamentId)
        }
        title={t.deleteTournamentTitle}
        body={t.deleteTournamentBody}
        confirmLabel={t.deleteTournament}
        cancelLabel={t.cancel}
        loading={deleteMutation.isPending}
        danger
      />
    </>
  );
}

function TournamentRow({
  row,
  t,
  onEdit,
  onDelete,
}: {
  row: TournamentDTO;
  t: (typeof ADMIN_STRINGS)[keyof typeof ADMIN_STRINGS];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const status = row.status as TournamentStatus;
  const dates = `${format(new Date(row.startDate), "PP")} – ${format(new Date(row.endDate), "PP")}`;
  return (
    <div className="grid grid-cols-[1fr_44px] md:grid-cols-[2.2fr_1fr_1.6fr_1.4fr_110px_44px] gap-3 items-center px-5 py-3.5 text-sm border-t border-ink-600/60 first:border-0 hover:bg-ink-600/30 transition-colors">
      <div className="min-w-0">
        <div className="text-white font-medium truncate">
          {row.tournamentName}
        </div>
        <div className="text-xs text-slate-500 md:hidden truncate">{dates}</div>
      </div>
      <div className="hidden md:block text-slate-300 text-xs">
        {row.tournamentType
          ? t[`type${row.tournamentType}` as const]
          : "—"}
      </div>
      <div className="hidden md:block text-slate-300 text-xs truncate">
        {row.venue ?? "—"}
      </div>
      <div className="hidden md:block text-slate-400 text-xs tabular-nums">
        {dates}
      </div>
      <div className="hidden md:block">
        <span
          className={`inline-flex items-center text-[10px] uppercase tracking-[0.14em] font-medium border rounded px-1.5 py-0.5 ${STATUS_STYLES[status] ?? STATUS_STYLES.UPCOMING}`}
        >
          {t[`tStatus${status}` as const] ?? row.status}
        </span>
      </div>
      <DropdownMenu
        align="end"
        trigger={
          <button
            type="button"
            className="p-2 rounded-md text-slate-400 hover:text-flag hover:bg-ink-600/60 transition-colors"
            aria-label={t.actionsMenu}
          >
            <MoreHorizontal size={18} />
          </button>
        }
      >
        {({ close }) => (
          <>
            <MenuItem
              icon={Edit2}
              label={t.actionEdit}
              onClick={() => {
                onEdit();
                close();
              }}
            />
            <div className="h-px bg-ink-600/70 my-1" />
            <MenuItem
              icon={Trash2}
              danger
              label={t.deleteTournament}
              onClick={() => {
                onDelete();
                close();
              }}
            />
          </>
        )}
      </DropdownMenu>
    </div>
  );
}

function TableSkeleton() {
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="grid grid-cols-[1fr_44px] md:grid-cols-[2.2fr_1fr_1.6fr_1.4fr_110px_44px] gap-3 items-center px-5 py-3.5 border-t border-ink-600/60 first:border-0"
        >
          <Skeleton width="70%" height={16} />
          <Skeleton width={70} height={13} className="hidden md:block" />
          <Skeleton width={110} height={13} className="hidden md:block" />
          <Skeleton width={130} height={13} className="hidden md:block" />
          <Skeleton width={70} height={20} className="hidden md:block" />
          <Skeleton width={28} height={28} />
        </div>
      ))}
    </>
  );
}

// ─── Create / Edit form modal ────────────────────────────────────────────────

interface FormState {
  tournamentName: string;
  description: string;
  tournamentType: TournamentType | "";
  venue: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxParticipants: string;
  status: TournamentStatus;
}

function TournamentFormModal({
  open,
  editing,
  onClose,
}: {
  open: boolean;
  editing: TournamentDTO | null;
  onClose: () => void;
}) {
  const { lang } = useLangStore();
  const t = ADMIN_STRINGS[lang];
  const qc = useQueryClient();

  const [form, setForm] = useState<FormState>(() => ({
    tournamentName: editing?.tournamentName ?? "",
    description: editing?.description ?? "",
    tournamentType: (editing?.tournamentType as TournamentType) ?? "",
    venue: editing?.venue ?? "",
    startDate: editing?.startDate ?? "",
    endDate: editing?.endDate ?? "",
    registrationDeadline: editing?.registrationDeadline ?? "",
    maxParticipants:
      editing?.maxParticipants != null ? String(editing.maxParticipants) : "",
    status: (editing?.status as TournamentStatus) ?? "UPCOMING",
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  }

  const saveMutation = useMutation({
    mutationFn: () => {
      const body: TournamentRequest = {
        tournamentName: form.tournamentName.trim(),
        description: form.description.trim() || undefined,
        tournamentType: form.tournamentType || undefined,
        venue: form.venue.trim() || undefined,
        startDate: form.startDate,
        endDate: form.endDate,
        registrationDeadline: form.registrationDeadline || undefined,
        maxParticipants: form.maxParticipants
          ? Number(form.maxParticipants)
          : undefined,
        status: form.status,
      };
      return editing
        ? updateTournament(editing.tournamentId, body)
        : createTournament(body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "tournaments"] });
      qc.invalidateQueries({ queryKey: ["tournaments"] });
      toast.success(
        editing ? t.toastTournamentUpdated : t.toastTournamentCreated,
      );
      onClose();
    },
    onError: (err) => {
      const detail = isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message
        : undefined;
      toast.error(detail ?? t.toastAppActionFailed);
    },
  });

  function validateAndSave() {
    const e: Record<string, string> = {};
    if (!form.tournamentName.trim()) e.tournamentName = t.errTName;
    if (!form.startDate || !form.endDate) {
      e.startDate = t.errTDates;
    } else if (form.endDate < form.startDate) {
      e.endDate = t.errTDateOrder;
    }
    if (
      form.registrationDeadline &&
      form.startDate &&
      form.registrationDeadline > form.startDate
    ) {
      e.registrationDeadline = t.errTDeadline;
    }
    setErrors(e);
    if (Object.keys(e).length === 0) saveMutation.mutate();
  }

  return (
    <Modal
      open={open}
      onClose={() => !saveMutation.isPending && onClose()}
      title={editing ? t.editTournament : t.newTournament}
      size="lg"
      dismissible={!saveMutation.isPending}
      footer={
        <>
          <SecondaryButton onClick={onClose} disabled={saveMutation.isPending}>
            {t.cancel}
          </SecondaryButton>
          <PrimaryButton
            type="button"
            onClick={validateAndSave}
            loading={saveMutation.isPending}
            loadingText={t.saving}
            className="w-auto px-4"
          >
            {t.save}
          </PrimaryButton>
        </>
      }
    >
      <Field id="tn" label={t.tName} error={errors.tournamentName}>
        <Input
          id="tn"
          value={form.tournamentName}
          onChange={(e) => set("tournamentName", e.target.value)}
          placeholder={t.tNamePh}
          error={!!errors.tournamentName}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <Field id="tt" label={t.tType}>
          <Select
            id="tt"
            value={form.tournamentType}
            onChange={(e) =>
              set("tournamentType", e.target.value as TournamentType | "")
            }
          >
            <option value="">—</option>
            {TYPES.map((ty) => (
              <option key={ty} value={ty}>
                {t[`type${ty}` as const]}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="ts" label={t.tStatus}>
          <Select
            id="ts"
            value={form.status}
            onChange={(e) => set("status", e.target.value as TournamentStatus)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {t[`tStatus${s}` as const]}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field id="tv" label={t.tVenue}>
        <Input
          id="tv"
          value={form.venue}
          onChange={(e) => set("venue", e.target.value)}
          placeholder={t.tVenuePh}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <Field id="tsd" label={t.tStartDate} error={errors.startDate}>
          <Input
            id="tsd"
            type="date"
            value={form.startDate}
            onChange={(e) => set("startDate", e.target.value)}
            error={!!errors.startDate}
          />
        </Field>
        <Field id="ted" label={t.tEndDate} error={errors.endDate}>
          <Input
            id="ted"
            type="date"
            value={form.endDate}
            onChange={(e) => set("endDate", e.target.value)}
            error={!!errors.endDate}
          />
        </Field>
        <Field
          id="trd"
          label={t.tRegDeadline}
          error={errors.registrationDeadline}
        >
          <Input
            id="trd"
            type="date"
            value={form.registrationDeadline}
            onChange={(e) => set("registrationDeadline", e.target.value)}
            error={!!errors.registrationDeadline}
          />
        </Field>
        <Field id="tmp" label={t.tMaxParticipants}>
          <Input
            id="tmp"
            type="number"
            min="1"
            value={form.maxParticipants}
            onChange={(e) => set("maxParticipants", e.target.value)}
          />
        </Field>
      </div>

      <Field id="td" label={t.tDescription}>
        <Textarea
          id="td"
          rows={4}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </Field>
    </Modal>
  );
}
