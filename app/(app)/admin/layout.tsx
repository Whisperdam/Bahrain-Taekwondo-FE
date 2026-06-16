"use client";

import { ShieldAlert } from "lucide-react";
import { TopNav } from "@/components/dashboard/top-nav";
import { EmptyState } from "@/components/ui/empty-state";
import { PrimaryButton } from "@/components/ui/primary-button";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useLangStore } from "@/lib/i18n/store";
import { ADMIN_STRINGS } from "@/lib/i18n/admin-strings";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { lang } = useLangStore();
  const t = ADMIN_STRINGS[lang];
  const router = useRouter();

  if (!user) return null;

  const isAdmin = user.roles.includes("ROLE_ADMIN");

  if (!isAdmin) {
    return (
      <>
        <TopNav user={user} />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-16">
          <EmptyState
            icon={ShieldAlert}
            title={t.forbiddenTitle}
            body={t.forbiddenBody}
            action={
              <PrimaryButton
                type="button"
                onClick={() => router.push("/dashboard")}
                className="w-auto px-5"
              >
                {t.goToDashboard}
              </PrimaryButton>
            }
          />
        </main>
      </>
    );
  }

  return <>{children}</>;
}
