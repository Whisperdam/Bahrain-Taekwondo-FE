"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Search,
  MoreHorizontal,
  User as UserIcon,
  Edit2,
  AlertTriangle,
  Users,
} from "lucide-react";
import { TopNav } from "@/components/dashboard/top-nav";
import { PageHeader } from "@/components/ui/page-header";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Checkbox } from "@/components/ui/checkbox";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { DropdownMenu, MenuItem } from "@/components/ui/dropdown-menu";
import { ErrorState } from "@/components/ui/error-state";
import { useAuth } from "@/hooks/use-auth";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useLangStore } from "@/lib/i18n/store";
import { ADMIN_STRINGS } from "@/lib/i18n/admin-strings";
import {
  searchUsers,
  suspendUser,
  unsuspendUser,
  replaceUserRoles,
} from "@/lib/admin/api";
import type { AdminUser, AppRole, UserStatus } from "@/types/admin";

const ALL_ROLES: AppRole[] = [
  "ROLE_VIEWER",
  "ROLE_COACH",
  "ROLE_OFFICIAL",
  "ROLE_PLAYER",
  "ROLE_ADMIN",
];

const PAGE_SIZE = 15;

export default function AdminUsersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { lang } = useLangStore();
  const t = ADMIN_STRINGS[lang];
  const qc = useQueryClient();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");
  const [roleFilter, setRoleFilter] = useState<AppRole | "">("");
  const [page, setPage] = useState(0);

  const debouncedQuery = useDebouncedValue(query, 300);

  // Reset to page 0 whenever any filter changes. We thread through setters
  // instead of an effect so the page index stays in sync with the filter that
  // produced it.
  function setQueryWithReset(v: string) {
    setQuery(v);
    setPage(0);
  }
  function setStatusFilterWithReset(v: UserStatus | "") {
    setStatusFilter(v);
    setPage(0);
  }
  function setRoleFilterWithReset(v: AppRole | "") {
    setRoleFilter(v);
    setPage(0);
  }

  const usersQ = useQuery({
    queryKey: [
      "admin",
      "users",
      { q: debouncedQuery, status: statusFilter, role: roleFilter, page },
    ],
    queryFn: () =>
      searchUsers({
        q: debouncedQuery || undefined,
        status: statusFilter || undefined,
        role: roleFilter || undefined,
        page,
        size: PAGE_SIZE,
      }),
  });

  const [editRolesUser, setEditRolesUser] = useState<AdminUser | null>(null);
  const [confirmSuspend, setConfirmSuspend] = useState<AdminUser | null>(null);

  const suspendMutation = useMutation({
    mutationFn: (u: AdminUser) =>
      u.status === "ACTIVE" ? suspendUser(u.userId) : unsuspendUser(u.userId),
    onSuccess: (_data, u) => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      // Could be the logged-in admin acting on their own account — refresh /me too.
      qc.invalidateQueries({ queryKey: ["auth", "me"] });
      setConfirmSuspend(null);
      toast.success(
        u.status === "ACTIVE" ? t.toastUserSuspended : t.toastUserUnsuspended,
      );
    },
    onError: () => toast.error(t.toastUserActionFailed),
  });

  function clearFilters() {
    setQuery("");
    setStatusFilter("");
    setRoleFilter("");
    setPage(0);
  }

  const hasFilter = !!query || !!statusFilter || !!roleFilter;
  const data = usersQ.data;
  const rows = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 1;

  if (!user) return null;

  return (
    <>
      <TopNav user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-6">
        <PageHeader
          title={t.adminUsersTitle}
          subtitle={t.adminUsersSub}
          back={{
            label: t.backToAdmin,
            onClick: () => router.push("/admin"),
          }}
        />

        {/* Filters */}
        <div className="bg-ink-700 border border-ink-600/70 rounded-xl p-4 mb-5 grid grid-cols-1 md:grid-cols-[1fr_180px_180px_auto] gap-3 items-end">
          <Field id="q" label={t.search}>
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 -translate-y-1/2 ltr:left-3 rtl:right-3 text-slate-400">
                <Search size={16} />
              </span>
              <Input
                id="q"
                value={query}
                onChange={(e) => setQueryWithReset(e.target.value)}
                placeholder={t.searchUsersPh}
                className="ltr:pl-10 rtl:pr-10"
              />
            </div>
          </Field>
          <Field id="sf" label={t.filterStatus}>
            <Select
              id="sf"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilterWithReset(e.target.value as UserStatus | "")
              }
            >
              <option value="">{t.filterAll}</option>
              <option value="ACTIVE">{t.statusACTIVE}</option>
              <option value="SUSPENDED">{t.statusSUSPENDED}</option>
              <option value="PENDING">{t.statusPENDING_USER}</option>
            </Select>
          </Field>
          <Field id="rf" label={t.filterRole}>
            <Select
              id="rf"
              value={roleFilter}
              onChange={(e) =>
                setRoleFilterWithReset(e.target.value as AppRole | "")
              }
            >
              <option value="">{t.filterAll}</option>
              {ALL_ROLES.map((r) => (
                <option key={r} value={r}>
                  {t[`role_${r}` as const]}
                </option>
              ))}
            </Select>
          </Field>
          <button
            type="button"
            onClick={clearFilters}
            disabled={!hasFilter}
            className="text-sm text-slate-300 hover:text-flag px-3 py-2.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-slate-300 transition-colors"
          >
            {t.clearFilters}
          </button>
        </div>

        {/* List */}
        <div className="bg-ink-700 border border-ink-600/70 rounded-xl overflow-hidden">
          {usersQ.isLoading && <UsersSkeleton />}

          {usersQ.isError && (
            <ErrorState
              message={t.loadFailed}
              retryLabel={t.retry}
              onRetry={() => usersQ.refetch()}
            />
          )}

          {!usersQ.isLoading && !usersQ.isError && rows.length === 0 && (
            <div className="p-12 text-center">
              <div className="inline-flex w-12 h-12 rounded-full bg-ink-800 border border-ink-600 text-slate-400 items-center justify-center mb-3">
                <Users size={22} />
              </div>
              <p className="text-sm text-slate-400">{t.usersEmpty}</p>
            </div>
          )}

          {!usersQ.isLoading && !usersQ.isError && rows.length > 0 && (
            <>
              <div className="hidden md:grid grid-cols-[2fr_2fr_1.6fr_1fr_1fr_44px] px-5 py-2.5 text-[10px] uppercase tracking-[0.16em] text-slate-500 border-b border-ink-600/60 font-medium">
                <div>{t.colName}</div>
                <div>{t.email}</div>
                <div>{t.colRoles}</div>
                <div>{t.filterStatus}</div>
                <div>{t.colLastLogin}</div>
                <div></div>
              </div>
              {rows.map((u) => (
                <UserRow
                  key={u.userId}
                  u={u}
                  lang={lang}
                  onEditRoles={() => setEditRolesUser(u)}
                  onToggleSuspend={() => setConfirmSuspend(u)}
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

      <ConfirmModal
        open={!!confirmSuspend}
        onClose={() => !suspendMutation.isPending && setConfirmSuspend(null)}
        onConfirm={() => confirmSuspend && suspendMutation.mutate(confirmSuspend)}
        title={
          confirmSuspend?.status === "ACTIVE"
            ? t.suspendTitle
            : t.unsuspendTitle
        }
        body={
          confirmSuspend?.status === "ACTIVE"
            ? t.suspendBody
            : t.unsuspendBody
        }
        confirmLabel={
          confirmSuspend?.status === "ACTIVE"
            ? t.actionSuspend
            : t.actionUnsuspend
        }
        cancelLabel={t.cancel}
        loading={suspendMutation.isPending}
        danger={confirmSuspend?.status === "ACTIVE"}
      />

      {/* Keyed so the modal remounts with a fresh selection set when the target changes */}
      <EditRolesModal
        key={editRolesUser?.userId ?? "none"}
        target={editRolesUser}
        onClose={() => setEditRolesUser(null)}
      />
    </>
  );
}

function UserRow({
  u,
  lang,
  onEditRoles,
  onToggleSuspend,
}: {
  u: AdminUser;
  lang: "en" | "ar";
  onEditRoles: () => void;
  onToggleSuspend: () => void;
}) {
  const t = ADMIN_STRINGS[lang];
  const initials = `${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`.toUpperCase();
  return (
    <div className="grid grid-cols-[1fr_44px] md:grid-cols-[2fr_2fr_1.6fr_1fr_1fr_44px] gap-3 items-center px-5 py-3.5 text-sm border-t border-ink-600/60 first:border-0 hover:bg-ink-600/30 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar initials={initials} photoUrl={u.profilePhotoUrl} size={36} />
        <div className="min-w-0">
          <div className="text-white font-medium truncate">{u.fullName}</div>
          <div
            className="text-xs text-slate-500 truncate font-mono md:hidden"
            style={{ direction: "ltr", textAlign: lang === "ar" ? "right" : "left" }}
          >
            {u.email}
          </div>
        </div>
      </div>
      <div
        className="hidden md:block text-slate-300 truncate font-mono text-xs"
        style={{ direction: "ltr", textAlign: lang === "ar" ? "right" : "left" }}
      >
        {u.email}
      </div>
      <div className="hidden md:flex items-center gap-1 flex-wrap">
        {u.roles.map((r) => (
          <span
            key={r}
            className="inline-flex items-center text-[10px] uppercase tracking-[0.14em] font-medium border border-flag/40 bg-flag/10 text-flag rounded px-1.5 py-0.5"
          >
            {t[`role_${r}` as const]}
          </span>
        ))}
      </div>
      <div className="hidden md:block">
        <UserStatusPill status={u.status} lang={lang} />
      </div>
      <div className="hidden md:block text-slate-400 text-xs tabular-nums">
        {u.lastLogin ? format(new Date(u.lastLogin), "PP") : "—"}
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
              icon={UserIcon}
              label={t.actionView}
              onClick={close}
            />
            <MenuItem
              icon={Edit2}
              label={t.actionEditRoles}
              onClick={() => {
                onEditRoles();
                close();
              }}
            />
            <div className="h-px bg-ink-600/70 my-1" />
            <MenuItem
              icon={AlertTriangle}
              danger
              label={
                u.status === "ACTIVE" ? t.actionSuspend : t.actionUnsuspend
              }
              onClick={() => {
                onToggleSuspend();
                close();
              }}
            />
          </>
        )}
      </DropdownMenu>
    </div>
  );
}

function UserStatusPill({
  status,
  lang,
}: {
  status: UserStatus;
  lang: "en" | "ar";
}) {
  const t = ADMIN_STRINGS[lang];
  const styles: Record<UserStatus, string> = {
    ACTIVE: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    SUSPENDED: "bg-red-500/10 text-red-300 border-red-500/30",
    PENDING: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  };
  const label: Record<UserStatus, string> = {
    ACTIVE: t.statusACTIVE,
    SUSPENDED: t.statusSUSPENDED,
    PENDING: t.statusPENDING_USER,
  };
  return (
    <span
      className={`inline-flex items-center text-[10px] uppercase tracking-[0.14em] font-medium border rounded px-1.5 py-0.5 ${styles[status]}`}
    >
      {label[status]}
    </span>
  );
}

function UsersSkeleton() {
  return (
    <>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="grid grid-cols-[1fr_44px] md:grid-cols-[2fr_2fr_1.6fr_1fr_1fr_44px] gap-3 items-center px-5 py-3.5 border-t border-ink-600/60 first:border-0"
        >
          <div className="flex items-center gap-3">
            <Skeleton width={36} height={36} className="rounded-full" />
            <Skeleton width={140} height={16} />
          </div>
          <Skeleton width={120} height={14} className="hidden md:block" />
          <Skeleton width={100} height={20} className="hidden md:block" />
          <Skeleton width={70} height={20} className="hidden md:block" />
          <Skeleton width={70} height={14} className="hidden md:block" />
          <Skeleton width={28} height={28} />
        </div>
      ))}
    </>
  );
}

function EditRolesModal({
  target,
  onClose,
}: {
  target: AdminUser | null;
  onClose: () => void;
}) {
  const { lang } = useLangStore();
  const t = ADMIN_STRINGS[lang];
  const qc = useQueryClient();
  // Seeded from the target's current roles. Because the parent passes a
  // `key={target.userId}`, this component remounts each time a different user
  // is selected, so the initializer is always fresh.
  const [selected, setSelected] = useState<Set<AppRole>>(
    () => new Set(target?.roles ?? []),
  );
  const [err, setErr] = useState("");

  const saveMutation = useMutation({
    mutationFn: (roles: AppRole[]) =>
      replaceUserRoles(target!.userId, { roles }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      // Admin may be editing their own roles — refresh /me so TopNav menu updates.
      qc.invalidateQueries({ queryKey: ["auth", "me"] });
      toast.success(t.toastRolesUpdated);
      onClose();
    },
    onError: () => toast.error(t.toastUserActionFailed),
  });

  function toggle(r: AppRole) {
    const next = new Set(selected);
    if (next.has(r)) next.delete(r);
    else next.add(r);
    setSelected(next);
    if (next.size === 0) setErr(t.errOneRoleMin);
    else setErr("");
  }

  function save() {
    if (selected.size === 0) {
      setErr(t.errOneRoleMin);
      return;
    }
    saveMutation.mutate(Array.from(selected));
  }

  return (
    <Modal
      open={!!target}
      onClose={() => !saveMutation.isPending && onClose()}
      title={t.editRolesTitle}
      size="md"
      dismissible={!saveMutation.isPending}
      footer={
        <>
          <SecondaryButton onClick={onClose} disabled={saveMutation.isPending}>
            {t.cancel}
          </SecondaryButton>
          <PrimaryButton
            type="button"
            onClick={save}
            loading={saveMutation.isPending}
            loadingText={t.saving}
            className="w-auto px-4"
          >
            {t.save}
          </PrimaryButton>
        </>
      }
    >
      {target && (
        <>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            {t.editRolesSub}
          </p>
          <div className="mb-4 p-3 rounded-lg bg-ink-800/50 border border-ink-600 flex items-center gap-3">
            <Avatar
              initials={`${target.firstName?.[0] ?? ""}${target.lastName?.[0] ?? ""}`.toUpperCase()}
              photoUrl={target.profilePhotoUrl}
              size={36}
            />
            <div className="min-w-0">
              <div className="text-sm font-medium text-white truncate">
                {target.fullName}
              </div>
              <div
                className="text-xs text-slate-400 truncate font-mono"
                style={{
                  direction: "ltr",
                  textAlign: lang === "ar" ? "right" : "left",
                }}
              >
                {target.email}
              </div>
            </div>
          </div>
          <div className="space-y-2.5">
            {ALL_ROLES.map((r) => {
              const checked = selected.has(r);
              return (
                <div
                  key={r}
                  className={`p-3 rounded-lg border transition-colors ${
                    checked
                      ? "bg-flag/5 border-flag/30"
                      : "bg-ink-800/40 border-ink-600"
                  }`}
                >
                  <Checkbox
                    id={`r-${r}`}
                    checked={checked}
                    onChange={() => toggle(r)}
                  >
                    <span className="font-medium text-white">
                      {t[`role_${r}` as const]}
                    </span>
                    <span className="block text-xs text-slate-500 mt-0.5">
                      {t[`role_${r}_help` as const]}
                    </span>
                  </Checkbox>
                </div>
              );
            })}
          </div>
          {err && (
            <div className="mt-3 text-[12px] text-red-400">{err}</div>
          )}
        </>
      )}
    </Modal>
  );
}
