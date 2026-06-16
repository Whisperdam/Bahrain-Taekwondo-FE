"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  /** When false, escape/backdrop won't close. Used for mandatory dialogs. */
  dismissible?: boolean;
  /** Hide the close X */
  hideClose?: boolean;
}

const SIZE: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-xl",
};

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
  dismissible = true,
  hideClose,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !dismissible) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, dismissible, onClose]);

  useEffect(() => {
    if (open) dialogRef.current?.focus();
  }, [open]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div
        className="absolute inset-0 bg-ink-900/80 backdrop-blur-sm"
        onClick={() => dismissible && onClose()}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={cn(
          "relative w-full bg-ink-700 border border-ink-600 rounded-xl card-shadow flex flex-col max-h-[90vh] outline-none",
          SIZE[size],
        )}
      >
        {(title || (!hideClose && dismissible)) && (
          <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-ink-600/70">
            {title && (
              <h2 id="modal-title" className="text-base font-semibold text-white">
                {title}
              </h2>
            )}
            {!hideClose && dismissible && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="text-slate-400 hover:text-flag transition-colors p-1 ltr:ml-auto rtl:mr-auto"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}
        <div className="px-5 py-5 overflow-y-auto">{children}</div>
        {footer && (
          <div className="px-5 py-4 border-t border-ink-600/70 flex items-center justify-end gap-2 flex-wrap">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
