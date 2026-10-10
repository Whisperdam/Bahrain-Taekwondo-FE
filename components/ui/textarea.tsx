"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { cleanEventTarget } from "@/lib/input/english-only";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  /** Everything typed is English by default; pass false only where any language must be accepted. */
  english?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, english = true, onChange, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full bg-ink-800/70 text-white placeholder:text-slate-500 text-sm rounded-lg border px-3.5 py-2.5 transition-colors focus-accent resize-y",
          error ? "border-red-500/70" : "border-ink-600",
          className,
        )}
        onChange={
          english
            ? (e) => {
                cleanEventTarget(e.target, "text", true);
                onChange?.(e);
              }
            : onChange
        }
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
