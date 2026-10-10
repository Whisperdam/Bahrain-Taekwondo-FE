"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { cleanEventTarget, isTextType, type EnglishKind } from "@/lib/input/english-only";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  /**
   * What may be typed. Everything is English by default ("text"); "name" and
   * "username" are stricter. Pass false only where any language must be accepted
   * (the sign-in field, so older accounts can still sign in). Passwords, dates,
   * numbers and the like are never filtered.
   */
  english?: EnglishKind | false;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, english = "text", onChange, type, ...props }, ref) => {
    const filtered = english !== false && isTextType(type);

    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "w-full bg-ink-800/70 text-white placeholder:text-slate-500 text-sm rounded-lg border px-3.5 py-2.5 transition-colors focus-accent",
          error ? "border-red-500/70" : "border-ink-600",
          className,
        )}
        onChange={
          filtered
            ? (e) => {
                cleanEventTarget(e.target, english, false);
                onChange?.(e);
              }
            : onChange
        }
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
