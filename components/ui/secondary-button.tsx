import * as React from "react";
import { cn } from "@/lib/utils";

type SecondaryButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function SecondaryButton({
  className,
  children,
  ...props
}: SecondaryButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "bg-ink-800/70 hover:bg-ink-700 border border-ink-600 hover:border-ink-500 disabled:opacity-60 disabled:cursor-not-allowed text-slate-200 hover:text-white text-sm font-semibold rounded-lg py-2.5 px-4 transition-colors inline-flex items-center justify-center gap-2",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
