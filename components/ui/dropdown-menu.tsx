"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: (ctx: { close: () => void }) => React.ReactNode;
  align?: "start" | "end";
  width?: string;
}

/** Fixed-position placement, computed from the trigger when the menu opens. */
interface Placement {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  maxHeight: number;
}

const GAP = 6;
const EDGE = 12;
/** Rough height of the tallest menu we render; below this much room we open upwards. */
const ROOM_NEEDED = 260;

/**
 * The menu is rendered in a portal with fixed positioning so that table
 * wrappers (`overflow-hidden`) can't clip it. It opens upwards when there is
 * no room below the trigger, e.g. for the last rows of a table.
 */
export function DropdownMenu({
  trigger,
  children,
  align = "end",
  width = "w-52",
}: DropdownMenuProps) {
  const [placement, setPlacement] = useState<Placement | null>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const open = placement !== null;

  function close() {
    setPlacement(null);
  }

  function toggle() {
    if (open) return close();
    const anchor = anchorRef.current;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();
    const rtl = getComputedStyle(anchor).direction === "rtl";
    const below = window.innerHeight - rect.bottom - GAP - EDGE;
    const above = rect.top - GAP - EDGE;
    const openUp = below < ROOM_NEEDED && above > below;

    // "end" aligns the menu's trailing edge with the trigger's.
    const alignRight = (align === "end") !== rtl;

    setPlacement({
      ...(openUp
        ? { bottom: window.innerHeight - rect.top + GAP }
        : { top: rect.bottom + GAP }),
      ...(alignRight
        ? { right: window.innerWidth - rect.right }
        : { left: rect.left }),
      maxHeight: Math.max(120, openUp ? above : below),
    });
  }

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const target = e.target as Node;
      if (anchorRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setPlacement(null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPlacement(null);
    }
    // The menu is anchored to a viewport position, so it would drift away
    // from its trigger if the page scrolled or resized underneath it.
    function dismiss() {
      setPlacement(null);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", dismiss);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("resize", dismiss);
    };
  }, [open]);

  return (
    <div ref={anchorRef} className="relative inline-flex">
      <span onClick={toggle} className="contents">
        {trigger}
      </span>
      {placement &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{
              top: placement.top,
              bottom: placement.bottom,
              left: placement.left,
              right: placement.right,
              maxHeight: placement.maxHeight,
            }}
            className={cn(
              "pop fixed z-50 overflow-y-auto bg-ink-700 border border-ink-600 rounded-xl py-1.5",
              width,
            )}
          >
            {children({ close })}
          </div>,
          document.body,
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
