"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Award,
  Briefcase,
  ChevronDown,
  FileText,
  LogOut,
  Medal,
  Menu,
  Shield,
  User,
  X,
} from "lucide-react";
import { ShieldLogo } from "@/components/ui/shield-logo";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Avatar } from "@/components/ui/avatar";
import { useLangStore } from "@/lib/i18n/store";
import { useAuthStore } from "@/lib/auth/store";
import { DASH_STRINGS } from "@/lib/i18n/dashboard-strings";
import type { UserProfile } from "@/types/auth";

function getInitials(user: UserProfile): string {
  const f = user.firstName?.[0] ?? "";
  const l = user.lastName?.[0] ?? "";
  return (f + l).toUpperCase();
}


// ---- Dropdown menu item ----
function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm transition-colors text-left rtl:text-right ${
        danger
          ? "text-red-300 hover:bg-flag/10 hover:text-flag"
          : "text-slate-200 hover:bg-ink-600/60 hover:text-flag"
      }`}
    >
      <span className={danger ? "text-flag" : "text-slate-400"}>
        <Icon size={15} />
      </span>
      <span>{label}</span>
    </button>
  );
}

// ---- Desktop User Dropdown ----
function UserDropdown({ user }: { user: UserProfile }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { logout } = useAuthStore();
  const { lang } = useLangStore();
  const t = DASH_STRINGS[lang];
  const initials = getInitials(user);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  const showCoach = !user.roles.includes("ROLE_COACH");
  const showOfficial = !user.roles.includes("ROLE_OFFICIAL");
  const isCoach = user.roles.includes("ROLE_COACH");
  const isAdmin = user.roles.includes("ROLE_ADMIN");

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 px-1.5 py-1 rounded-full hover:bg-ink-700 transition-colors"
      >
        <Avatar initials={initials} photoUrl={user.profilePhotoUrl} alt={user.fullName} />
        <span className="hidden md:inline text-sm text-slate-200 font-medium max-w-[140px] truncate">
          {user.fullName}
        </span>
        <span className="text-slate-500">
          <ChevronDown size={15} />
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="pop absolute ltr:right-0 rtl:left-0 mt-2 w-72 bg-ink-700 border border-ink-600 rounded-xl py-1.5 z-40"
        >
          {/* Header */}
          <div className="px-3.5 py-2.5">
            <div className="text-sm font-semibold text-white truncate">{user.fullName}</div>
            <div
              className="text-xs text-slate-400 truncate font-mono"
              style={{ direction: "ltr", textAlign: lang === "ar" ? "right" : "left" }}
            >
              {user.email}
            </div>
          </div>

          <MenuItem icon={User} label={t.myProfile} onClick={() => { router.push("/profile"); setOpen(false); }} />
          <MenuItem icon={FileText} label={t.myApplications} onClick={() => { router.push("/applications"); setOpen(false); }} />
          {isCoach && (
            <MenuItem icon={Briefcase} label={t.coachPortal} onClick={() => { router.push("/coach"); setOpen(false); }} />
          )}
          {isAdmin && (
            <MenuItem icon={Shield} label={t.adminPanel} onClick={() => { router.push("/admin"); setOpen(false); }} />
          )}

          {(showCoach || showOfficial) && (
            <>
              <div className="h-px bg-ink-600/70 my-1" />
              <div className="px-3.5 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-500">
                {t.applyHeader}
              </div>
              {showCoach && (
                <MenuItem icon={Award} label={t.applyCoach} onClick={() => { router.push("/apply/coach"); setOpen(false); }} />
              )}
              {showOfficial && (
                <MenuItem icon={Medal} label={t.applyOfficial} onClick={() => { router.push("/apply/official"); setOpen(false); }} />
              )}
            </>
          )}

          <div className="h-px bg-ink-600/70 my-1" />
          <MenuItem icon={LogOut} label={t.logout} onClick={handleLogout} danger />
        </div>
      )}
    </div>
  );
}

// ---- Mobile Sheet Item ----
function SheetItem({
  icon: Icon,
  label,
  onClick,
  danger,
  onClose,
}: {
  icon?: React.ComponentType<{ size?: number }>;
  label: string;
  onClick?: () => void;
  danger?: boolean;
  onClose: () => void;
}) {
  return (
    <button
      onClick={() => { onClick?.(); onClose(); }}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors text-left rtl:text-right ${
        danger ? "text-red-300 hover:text-flag" : "text-slate-200 hover:text-flag"
      } hover:bg-ink-700`}
    >
      {Icon && (
        <span className={danger ? "text-flag" : "text-slate-400"}>
          <Icon size={18} />
        </span>
      )}
      <span className="font-medium">{label}</span>
    </button>
  );
}

// ---- Mobile Sheet ----
function MobileSheet({
  open,
  onClose,
  user,
}: {
  open: boolean;
  onClose: () => void;
  user: UserProfile;
}) {
  const { lang } = useLangStore();
  const router = useRouter();
  const { logout } = useAuthStore();
  const t = DASH_STRINGS[lang];
  const isAr = lang === "ar";
  const initials = getInitials(user);

  const showCoach = !user.roles.includes("ROLE_COACH");
  const showOfficial = !user.roles.includes("ROLE_OFFICIAL");
  const isCoach = user.roles.includes("ROLE_COACH");
  const isAdmin = user.roles.includes("ROLE_ADMIN");

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className={`absolute top-0 ltr:right-0 rtl:left-0 h-full w-[88%] max-w-sm bg-ink-800 border-l rtl:border-l-0 rtl:border-r border-ink-600 ${
          isAr ? "sheet-rtl" : "sheet-ltr"
        } flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-ink-600/70">
          <div className="flex items-center gap-2.5">
            <ShieldLogo size={28} />
            <div className="text-sm font-semibold">{t.fedFull}</div>
          </div>
          <button onClick={onClose} aria-label={t.closeMenu} className="text-slate-400 hover:text-flag p-1.5 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-ink-600/70">
          <div className="flex items-center gap-3">
            <Avatar
              initials={initials}
              photoUrl={user.profilePhotoUrl}
              alt={user.fullName}
              size={40}
            />
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{user.fullName}</div>
              <div
                className="text-xs text-slate-400 truncate font-mono"
                style={{ direction: "ltr", textAlign: isAr ? "right" : "left" }}
              >
                {user.email}
              </div>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-2">
          <SheetItem icon={User} label={t.myProfile} onClick={() => router.push("/profile")} onClose={onClose} />
          <SheetItem icon={FileText} label={t.myApplications} onClick={() => router.push("/applications")} onClose={onClose} />
          {isCoach && (
            <SheetItem icon={Briefcase} label={t.coachPortal} onClick={() => router.push("/coach")} onClose={onClose} />
          )}
          {isAdmin && (
            <SheetItem icon={Shield} label={t.adminPanel} onClick={() => router.push("/admin")} onClose={onClose} />
          )}

          {(showCoach || showOfficial) && (
            <>
              <div className="h-px bg-ink-600/70 my-2 mx-4" />
              <div className="px-4 py-1.5 text-[10px] uppercase tracking-[0.16em] text-slate-500">
                {t.applyHeader}
              </div>
              {showCoach && (
                <SheetItem icon={Award} label={t.applyCoach} onClick={() => router.push("/apply/coach")} onClose={onClose} />
              )}
              {showOfficial && (
                <SheetItem icon={Medal} label={t.applyOfficial} onClick={() => router.push("/apply/official")} onClose={onClose} />
              )}
            </>
          )}

          <div className="h-px bg-ink-600/70 my-2 mx-4" />
          <SheetItem icon={LogOut} label={t.logout} onClick={handleLogout} danger onClose={onClose} />
        </nav>

        {/* Theme + language toggles */}
        <div className="p-4 border-t border-ink-600/70 flex items-center justify-between">
          <span className="text-xs text-slate-500 uppercase tracking-[0.14em]">{t.tweakTheme}</span>
          <ThemeToggle />
        </div>
        <div className="px-4 pb-4 flex items-center justify-between">
          <span className="text-xs text-slate-500 uppercase tracking-[0.14em]">{t.tweakLang}</span>
          <LanguageToggle />
        </div>
      </div>
    </div>
  );
}

// ---- Top Nav ----
export function TopNav({ user }: { user: UserProfile }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { lang } = useLangStore();
  const t = DASH_STRINGS[lang];

  return (
    <header className="sticky top-0 z-30 bg-ink-800/80 backdrop-blur border-b border-ink-600/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
        {/* Left: logo — links to the dashboard */}
        <a href="/dashboard" className="flex items-center gap-2.5 shrink-0 hover:opacity-90 transition-opacity">
          <ShieldLogo size={32} />
          <div className="hidden sm:block leading-tight">
            <div className="text-sm font-semibold text-white">
              {lang === "ar" ? DASH_STRINGS.ar.fedFull : "Bahrain Taekwondo"}
            </div>
            <div
              className={`text-[10px] uppercase tracking-[0.18em] text-slate-500 ${lang === "ar" ? "font-arabic normal-case tracking-normal" : ""}`}
            >
              {lang === "ar" ? "بوابة الأعضاء" : "Federation"}
            </div>
          </div>
        </a>

        {/* Center: reserved for future portal links */}
        <nav
          className="flex-1 hidden lg:flex items-center justify-center gap-1 min-h-[40px]"
          aria-label="Primary navigation"
        />

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-3 ltr:ml-auto rtl:mr-auto lg:ml-0 lg:mr-0">
          <div className="hidden sm:flex items-center gap-2">
            <ThemeToggle />
            <LanguageToggle />
          </div>
          <div className="hidden lg:block">
            <UserDropdown user={user} />
          </div>
          <button
            onClick={() => setSheetOpen(true)}
            aria-label={t.openMenu}
            className="lg:hidden p-2 rounded-md text-slate-300 hover:text-flag hover:bg-ink-700 transition-colors"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      <MobileSheet open={sheetOpen} onClose={() => setSheetOpen(false)} user={user} />
    </header>
  );
}
