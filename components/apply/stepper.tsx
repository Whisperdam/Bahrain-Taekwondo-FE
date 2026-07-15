"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepperStep {
  id: string;
  label: string;
}

interface StepperProps {
  steps: StepperStep[];
  current: number;
  onJump?: (index: number) => void;
}

export function Stepper({ steps, current, onJump }: StepperProps) {
  return (
    <ol className="flex items-center gap-0 overflow-x-auto" role="list">
      {steps.map((step, idx) => {
        const done = idx < current;
        const active = idx === current;
        const clickable = onJump && idx <= current;
        return (
          <li key={step.id} className="flex items-center min-w-0 flex-1">
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onJump?.(idx)}
              className={cn(
                "flex items-center gap-2 min-w-0",
                clickable ? "cursor-pointer" : "cursor-default",
              )}
              aria-current={active ? "step" : undefined}
            >
              <span
                className={cn(
                  "shrink-0 w-7 h-7 rounded-full border text-xs font-semibold flex items-center justify-center transition-colors",
                  done && "bg-flag border-flag text-accent-foreground",
                  active && "bg-flag/10 border-flag text-flag",
                  !done && !active && "bg-ink-800 border-ink-600 text-slate-500",
                )}
              >
                {done ? <Check size={14} /> : idx + 1}
              </span>
              <span
                className={cn(
                  "text-xs sm:text-sm truncate transition-colors",
                  active ? "text-white font-medium" : "text-slate-400",
                  done && "text-slate-300",
                )}
              >
                {step.label}
              </span>
            </button>
            {idx < steps.length - 1 && (
              <span
                className={cn(
                  "flex-1 h-px mx-3 transition-colors",
                  done ? "bg-flag/50" : "bg-ink-600/70",
                )}
                aria-hidden="true"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
