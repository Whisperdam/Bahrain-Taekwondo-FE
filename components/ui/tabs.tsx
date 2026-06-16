"use client";

import { cn } from "@/lib/utils";

export interface TabItem<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface TabsProps<T extends string> {
  items: TabItem<T>[];
  active: T;
  onChange: (value: T) => void;
  className?: string;
}

export function Tabs<T extends string>({
  items,
  active,
  onChange,
  className,
}: TabsProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex items-center gap-1 border-b border-ink-600/70 overflow-x-auto",
        className,
      )}
    >
      {items.map((item) => {
        const selected = item.value === active;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(item.value)}
            className={cn(
              "px-3.5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-2 whitespace-nowrap",
              selected
                ? "border-flag text-white"
                : "border-transparent text-slate-400 hover:text-white",
            )}
          >
            <span>{item.label}</span>
            {item.count != null && (
              <span
                className={cn(
                  "text-[10px] uppercase tracking-[0.14em] font-semibold rounded px-1.5 py-0.5 border",
                  selected
                    ? "bg-flag/10 border-flag/40 text-flag"
                    : "bg-ink-800 border-ink-600 text-slate-400",
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
