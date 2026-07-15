"use client";

import { Toaster } from "sonner";
import { useLangStore } from "@/lib/i18n/store";
import { useThemeStore } from "@/lib/theme/store";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { lang } = useLangStore();
  const { theme } = useThemeStore();

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="isolate bg-atmosphere min-h-screen flex items-center justify-center p-0 sm:p-4 relative overflow-hidden"
    >
      <div className="pattern-bg" aria-hidden="true" />
      <div className="w-full sm:max-w-md relative z-10">{children}</div>
      <Toaster
        theme={theme === "light" ? "light" : "dark"}
        toastOptions={{
          style: {
            background: "var(--ink-700)",
            border: "1px solid var(--ink-600)",
            color: "var(--fg-primary)",
          },
        }}
      />
    </div>
  );
}
