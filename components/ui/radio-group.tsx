"use client";

import { cn } from "@/lib/utils";

interface RadioOption<T extends string> {
  value: T;
  label: string;
}

interface RadioGroupProps<T extends string> {
  name: string;
  value: T;
  onChange: (value: T) => void;
  options: RadioOption<T>[];
  className?: string;
}

export function RadioGroup<T extends string>({
  name,
  value,
  onChange,
  options,
  className,
}: RadioGroupProps<T>) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)} role="radiogroup">
      {options.map((opt) => {
        const id = `${name}-${opt.value}`;
        const active = value === opt.value;
        return (
          <label
            key={opt.value}
            htmlFor={id}
            className={cn(
              "cursor-pointer rounded-lg border px-3.5 py-2 text-sm transition-colors select-none",
              active
                ? "bg-flag/10 border-flag/50 text-white"
                : "bg-ink-800/70 border-ink-600 text-slate-300 hover:border-ink-500 hover:text-white",
            )}
          >
            <input
              id={id}
              type="radio"
              name={name}
              value={opt.value}
              checked={active}
              onChange={() => onChange(opt.value)}
              className="sr-only"
            />
            {opt.label}
          </label>
        );
      })}
    </div>
  );
}
