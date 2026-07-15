"use client";

import { useThemeStore, type Theme } from "@/lib/theme/store";
import { useLangStore } from "@/lib/i18n/store";
import { cn } from "@/lib/utils";

/**
 * Fixed preview colors per theme — intentionally NOT drawn from the live
 * CSS variables, since a swatch must show what a theme looks like
 * regardless of which theme is currently active.
 */
const SWATCHES: Record<Theme, { bg: string; accent: string }> = {
  "dark-red": { bg: "#0B1F3A", accent: "#CE1126" },
  "dark-mono": { bg: "#141414", accent: "#E4E4E7" },
  light: { bg: "#FFFFFF", accent: "#CE1126" },
};

const THEMES: Theme[] = ["dark-red", "dark-mono", "light"];

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();
  const { t } = useLangStore();

  const labelFor: Record<Theme, string> = {
    "dark-red": t("themeDarkRed"),
    "dark-mono": t("themeDarkMono"),
    light: t("themeLight"),
  };

  return (
    <div
      role="group"
      aria-label={t("themeToggle")}
      className="flex items-center gap-1 bg-ink-900/60 border border-ink-600/80 rounded-full p-0.5 select-none shrink-0"
    >
      {THEMES.map((th) => {
        const active = theme === th;
        const swatch = SWATCHES[th];
        return (
          <button
            key={th}
            type="button"
            onClick={() => setTheme(th)}
            aria-pressed={active}
            aria-label={labelFor[th]}
            title={labelFor[th]}
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center transition-all",
              active ? "ring-2 ring-flag ring-offset-1 ring-offset-ink-900" : "opacity-70 hover:opacity-100",
            )}
          >
            <span
              className="w-4 h-4 rounded-full border border-white/20"
              style={{
                background: `linear-gradient(135deg, ${swatch.bg} 50%, ${swatch.accent} 50%)`,
              }}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
}
