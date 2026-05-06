"use client";

import { Toaster } from "sonner";
import { useLangStore } from "@/lib/i18n/store";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { lang } = useLangStore();

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="isolate bg-atmosphere min-h-screen flex items-center justify-center p-0 sm:p-4 relative overflow-hidden"
    >
      <div className="pattern-bg" aria-hidden="true" />
      <div className="w-full sm:max-w-md relative z-10">{children}</div>
      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: "#132743",
            border: "1px solid #1E3A5F",
            color: "#fff",
          },
        }}
      />
    </div>
  );
}
