"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: (ctx: { close: () => void }) => React.ReactNode;
  align?: "start" | "end";
  width?: string;
}

export function DropdownMenu({
  trigger,
  children,
  align = "end",
  width = "w-52",
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
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
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex">
      <span onClick={() => setOpen((o) => !o)} className="contents">
        {trigger}
      </span>
      {open && (
        <div
          role="menu"
          className={cn(
            "pop absolute top-full mt-1.5 bg-ink-700 border border-ink-600 rounded-xl py-1.5 z-30",
            align === "end"
              ? "ltr:right-0 rtl:left-0"
              : "ltr:left-0 rtl:right-0",
            width,
          )}
        >
          {children({ close: () => setOpen(false) })}
        </div>
      )}
    </div>
  );
}

interface MenuItemProps {
  icon?: React.ComponentType<{ size?: number }>;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

export function MenuItem({ icon: Icon, label, onClick, danger }: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2.5 px-3.5 py-2 text-sm transition-colors text-left rtl:text-right",
        danger
          ? "text-red-300 hover:bg-flag/10 hover:text-flag"
          : "text-slate-200 hover:bg-ink-600/60 hover:text-flag",
      )}
    >
      {Icon && (
        <span className={danger ? "text-flag" : "text-slate-400"}>
          <Icon size={15} />
        </span>
      )}
      <span>{label}</span>
    </button>
  );
}
