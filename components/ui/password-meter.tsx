"use client";

import { pwStrength } from "@/lib/i18n/translations";
import { useLangStore } from "@/lib/i18n/store";

interface PasswordMeterProps {
  value: string;
}

const COLORS = ["#EF4444", "#F59E0B", "#EAB308", "#22C55E"];
const EMPTY_COLOR = "#1E3A5F";

export function PasswordMeter({ value }: PasswordMeterProps) {
  const { t } = useLangStore();
  const score = pwStrength(value);
  const labels = [t("pwWeak"), t("pwFair"), t("pwGood"), t("pwStrong")];
  const activeColor = score > 0 ? COLORS[score - 1] : EMPTY_COLOR;
  const label = score > 0 ? labels[score - 1] : "";

  return (
    <div className="mt-2">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-colors duration-300"
            style={{ background: score > i ? COLORS[Math.min(score - 1, 3)] : EMPTY_COLOR }}
          />
        ))}
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[11px]">
        <span className="text-slate-500">{!value ? t("pwHint") : ""}</span>
        {label && (
          <span style={{ color: activeColor }} className="font-medium">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
