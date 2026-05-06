"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useLangStore } from "@/lib/i18n/store";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60 * 1000, retry: 1 } },
      }),
  );

  const { isAuthenticated, hydrated } = useAuth();
  const { lang } = useLangStore();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) router.replace("/login");
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated || !isAuthenticated) {
    return <div className="min-h-screen bg-ink-900" />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div dir={lang === "ar" ? "rtl" : "ltr"} className="isolate relative min-h-screen bg-ink-900 text-white">
        <div className="pattern-bg" aria-hidden="true" />
        <div className="relative z-10">{children}</div>
      </div>
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
    </QueryClientProvider>
  );
}
