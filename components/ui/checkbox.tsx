"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function Checkbox({
  id,
  checked,
  onChange,
  disabled,
  children,
  className,
}: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex items-start gap-2.5 cursor-pointer select-none",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={cn(
          "mt-0.5 shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors",
          checked
            ? "bg-flag border-flag text-white"
            : "bg-ink-800 border-ink-500",
        )}
      >
        {checked && <Check size={11} strokeWidth={3} />}
      </span>
      {children && <span className="text-sm text-slate-200">{children}</span>}
    </label>
  );
}
