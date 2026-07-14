"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import {
  Building2,
  Plus,
  MoreHorizontal,
  Edit2,
  Ban,
  CircleCheck,
} from "lucide-react";
import { TopNav } from "@/components/dashboard/top-nav";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { DropdownMenu, MenuItem } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useLangStore } from "@/lib/i18n/store";
import { ADMIN_STRINGS } from "@/lib/i18n/admin-strings";
import {
  listAcademiesAdmin,
  createAcademy,
  updateAcademy,
  deactivateAcademy,
  activateAcademy,
} from "@/lib/admin/api";
import type { AcademyDTO } from "@/types/dashboard";
import type { AcademyRequest, AcademyStatus } from "@/types/admin";

const PAGE_SIZE = 10;

type StatusTab = "" | AcademyStatus;

const STATUS_STYLES: Record<AcademyStatus, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  INACTIVE: "bg-slate-500/10 text-slate-300 border-slate-500/30",
};

export default function AdminAcademiesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { lang } = useLangStore();
  const t = ADMIN_STRINGS[lang];
  const qc = useQueryClient();

  const [statusTab, setStatusTab] = useState<StatusTab>("");
  const [page, setPage] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AcademyDTO | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<AcademyDTO | null>(null);

  const listQ = useQuery({
    queryKey: ["admin", "academies", statusTab, page],
    queryFn: () =>
      listAcademiesAdmin({
        status: statusTab || undefined,
        page,
        size: PAGE_SIZE,
      }),
  });

  const toggleMutation = useMutation({
    mutationFn: (a: AcademyDTO) =>
      a.status === "ACTIVE"
        ? deactivateAcademy(a.academyId)
        : activateAcademy(a.academyId),
    onSuccess: (_data, a) => {
      qc.invalidateQueries({ queryKey: ["admin", "academies"] });
      qc.invalidateQueries({ queryKey: ["academies"] });
      setConfirmTarget(null);
      toast.success(
        a.status === "ACTIVE"
          ? t.toastAcademyDeactivated
          : t.toastAcademyActivated,
      );
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
  function openEdit(row: AcademyDTO) {
    setEditing(row);
    setFormOpen(true);
  }

  return (
    <>
      <TopNav user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-6">
        <PageHeader
          title={t.adminAcademiesTitle}
          subtitle={t.adminAcademiesSub}
          back={{ label: t.backToAdmin, onClick: () => router.push("/admin") }}
          action={
            <PrimaryButton
              type="button"
              onClick={openCreate}
              className="!py-2 !px-3.5 text-xs w-auto"
            >
              <Plus size={14} />
              {t.newAcademy}
            </PrimaryButton>
          }
        />

        <Tabs<StatusTab>
          items={[
            { value: "", label: t.filterAllStatuses },
            { value: "ACTIVE", label: t.aStatusACTIVE },
            { value: "INACTIVE", label: t.aStatusINACTIVE },
          ]}
          active={statusTab}
          onChange={(s) => {
            setStatusTab(s);
            setPage(0);
          }}
        />

        <div className="mt-5 bg-ink-700 border border-ink-600/70 rounded-xl overflow-hidden">
          {listQ.isLoading && <TableSkeleton />}

          {!listQ.isLoading && rows.length === 0 && (
            <div className="p-12 text-center">
              <div className="inline-flex w-12 h-12 rounded-full bg-ink-800 border border-ink-600 text-slate-400 items-center justify-center mb-3">
                <Building2 size={22} />
              </div>
              <p className="text-sm text-slate-400">{t.academiesEmpty}</p>
            </div>
          )}

          {!listQ.isLoading && rows.length > 0 && (
            <>
              <div className="hidden md:grid grid-cols-[2fr_1.6fr_1.8fr_1.4fr_100px_44px] px-5 py-2.5 text-[10px] uppercase tracking-[0.16em] text-slate-500 border-b border-ink-600/60 font-medium">
                <div>{t.colAcademy}</div>
                <div>{t.colLocation}</div>
                <div>{t.colContact}</div>
                <div>{t.colOwner}</div>
                <div>{t.colStatus}</div>
                <div></div>
              </div>
              {rows.map((row) => (
                <AcademyRow
                  key={row.academyId}
                  row={row}
                  t={t}
                  lang={lang}
                  onEdit={() => openEdit(row)}
                  onToggle={() => setConfirmTarget(row)}
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
      <AcademyFormModal
        key={editing?.academyId ?? "new"}
        open={formOpen}
        editing={editing}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmModal
        open={!!confirmTarget}
        onClose={() => !toggleMutation.isPending && setConfirmTarget(null)}
        onConfirm={() => confirmTarget && toggleMutation.mutate(confirmTarget)}
        title={
          confirmTarget?.status === "ACTIVE"
            ? t.deactivateTitle
            : t.activateTitle
        }
        body={
          confirmTarget?.status === "ACTIVE"
            ? t.deactivateBody
            : t.activateBody
        }
        confirmLabel={
          confirmTarget?.status === "ACTIVE"
            ? t.deactivateAcademy
            : t.activateAcademy
        }
        cancelLabel={t.cancel}
        loading={toggleMutation.isPending}
        danger={confirmTarget?.status === "ACTIVE"}
      />
    </>
  );
}

function AcademyRow({
  row,
  t,
  lang,
  onEdit,
  onToggle,
}: {
  row: AcademyDTO;
  t: (typeof ADMIN_STRINGS)[keyof typeof ADMIN_STRINGS];
  lang: "en" | "ar";
  onEdit: () => void;
  onToggle: () => void;
}) {
  const status = (row.status ?? "ACTIVE") as AcademyStatus;
  const active = status === "ACTIVE";
  return (
    <div className="grid grid-cols-[1fr_44px] md:grid-cols-[2fr_1.6fr_1.8fr_1.4fr_100px_44px] gap-3 items-center px-5 py-3.5 text-sm border-t border-ink-600/60 first:border-0 hover:bg-ink-600/30 transition-colors">
      <div className="min-w-0">
        <div className="text-white font-medium truncate">{row.academyName}</div>
        <div className="text-xs text-slate-500 md:hidden truncate">
          {row.location}
        </div>
      </div>
      <div className="hidden md:block text-slate-300 text-xs truncate">
        {row.location || "—"}
      </div>
      <div className="hidden md:block min-w-0">
        {row.email && (
          <div
            className="text-slate-300 truncate font-mono text-xs"
            style={{
              direction: "ltr",
              textAlign: lang === "ar" ? "right" : "left",
            }}
          >
            {row.email}
          </div>
        )}
        {row.phone && (
          <div
            className="text-slate-500 text-xs mt-0.5 font-mono"
            style={{
              direction: "ltr",
              textAlign: lang === "ar" ? "right" : "left",
            }}
          >
            {row.phone}
          </div>
        )}
        {!row.email && !row.phone && (
          <span className="text-slate-500 text-xs">—</span>
        )}
      </div>
      <div className="hidden md:block text-slate-300 text-xs truncate">
        {row.owningCoachName ?? t.noOwner}
      </div>
      <div className="hidden md:block">
        <span
          className={`inline-flex items-center text-[10px] uppercase tracking-[0.14em] font-medium border rounded px-1.5 py-0.5 ${STATUS_STYLES[status]}`}
        >
          {t[`aStatus${status}` as const]}
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
              icon={active ? Ban : CircleCheck}
              danger={active}
              label={active ? t.deactivateAcademy : t.activateAcademy}
              onClick={() => {
                onToggle();
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
          className="grid grid-cols-[1fr_44px] md:grid-cols-[2fr_1.6fr_1.8fr_1.4fr_100px_44px] gap-3 items-center px-5 py-3.5 border-t border-ink-600/60 first:border-0"
        >
          <Skeleton width="65%" height={16} />
          <Skeleton width={100} height={13} className="hidden md:block" />
          <Skeleton width={130} height={13} className="hidden md:block" />
          <Skeleton width={90} height={13} className="hidden md:block" />
          <Skeleton width={64} height={20} className="hidden md:block" />
          <Skeleton width={28} height={28} />
        </div>
      ))}
    </>
  );
}

// ─── Create / Edit form modal ────────────────────────────────────────────────

interface FormState {
  academyName: string;
  location: string;
  phone: string;
  email: string;
  establishedDate: string;
}

function AcademyFormModal({
  open,
  editing,
  onClose,
}: {
  open: boolean;
  editing: AcademyDTO | null;
  onClose: () => void;
}) {
  const { lang } = useLangStore();
  const t = ADMIN_STRINGS[lang];
  const qc = useQueryClient();

  const [form, setForm] = useState<FormState>(() => ({
    academyName: editing?.academyName ?? "",
    location: editing?.location ?? "",
    phone: editing?.phone ?? "",
    email: editing?.email ?? "",
    establishedDate: editing?.establishedDate ?? "",
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  }

  const saveMutation = useMutation({
    mutationFn: () => {
      const body: AcademyRequest = {
        academyName: form.academyName.trim(),
        location: form.location.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        establishedDate: form.establishedDate || undefined,
        // Ownership is assigned via the academy-application approval flow;
        // this admin form deliberately doesn't touch it.
      };
      return editing
        ? updateAcademy(editing.academyId, body)
        : createAcademy(body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "academies"] });
      qc.invalidateQueries({ queryKey: ["academies"] });
      toast.success(editing ? t.toastAcademyUpdated : t.toastAcademyCreated);
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
    if (!form.academyName.trim()) e.academyName = t.errAName;
    setErrors(e);
    if (Object.keys(e).length === 0) saveMutation.mutate();
  }

  return (
    <Modal
      open={open}
      onClose={() => !saveMutation.isPending && onClose()}
      title={editing ? t.editAcademy : t.newAcademy}
      size="md"
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
      <Field id="an" label={t.aName} error={errors.academyName}>
        <Input
          id="an"
          value={form.academyName}
          onChange={(e) => set("academyName", e.target.value)}
          placeholder={t.aNamePh}
          error={!!errors.academyName}
        />
      </Field>

      <Field id="al" label={t.aLocation}>
        <Input
          id="al"
          value={form.location}
          onChange={(e) => set("location", e.target.value)}
          placeholder={t.aLocationPh}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <Field id="ap" label={t.aPhone}>
          <Input
            id="ap"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+973"
          />
        </Field>
        <Field id="ae" label={t.aEmail}>
          <Input
            id="ae"
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </Field>
      </div>

      <Field id="aed" label={t.aEstablished}>
        <Input
          id="aed"
          type="date"
          value={form.establishedDate}
          onChange={(e) => set("establishedDate", e.target.value)}
        />
      </Field>
    </Modal>
  );
}
