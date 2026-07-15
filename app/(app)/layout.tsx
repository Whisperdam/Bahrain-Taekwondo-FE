"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/lib/auth/store";
import { useLangStore } from "@/lib/i18n/store";
import { useThemeStore } from "@/lib/theme/store";
import { getMeApi } from "@/lib/auth/api";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60 * 1000, retry: 1 } },
      }),
  );

  const { isAuthenticated, hydrated } = useAuth();
  const { lang } = useLangStore();
  const { theme } = useThemeStore();
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
      <MeRefresher />
      <div dir={lang === "ar" ? "rtl" : "ltr"} className="isolate relative min-h-screen bg-ink-900 text-white">
        <div className="pattern-bg" aria-hidden="true" />
        <div className="relative z-10">{children}</div>
      </div>
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
    </QueryClientProvider>
  );
}

/**
 * Refreshes the auth store's `user` from /api/auth/me on every mount of the
 * authenticated layout. Without this the FE would keep using the snapshot
 * taken at login — stale once roles/status/etc. change server-side (e.g.
 * after an application is approved).
 *
 * Pushes the fresh response into the Zustand store via `setUser` so every
 * consumer (TopNav, ProfilePage, role gates) sees the same data.
 */
function MeRefresher() {
  const setUser = useAuthStore((s) => s.setUser);

  const { data } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMeApi,
    // Always fetch on mount so the user can never see hours-old roles.
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (data) setUser(data);
  }, [data, setUser]);

  return null;
}
