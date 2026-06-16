"use client";

import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { TopNav } from "@/components/dashboard/top-nav";
import { EmptyState } from "@/components/ui/empty-state";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { useAuth } from "@/hooks/use-auth";
import { useLangStore } from "@/lib/i18n/store";
import { COACH_STRINGS } from "@/lib/i18n/coach-strings";

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { lang } = useLangStore();
  const t = COACH_STRINGS[lang];
  const router = useRouter();

  if (!user) return null;

  const isCoach = user.roles.includes("ROLE_COACH");

  if (!isCoach) {
    return (
      <>
        <TopNav user={user} />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-16">
          <EmptyState
            icon={ShieldAlert}
            title={t.coachOnlyTitle}
            body={t.coachOnlyBody}
            action={
              <>
                <PrimaryButton
                  type="button"
                  onClick={() => router.push("/apply/coach")}
                  className="w-auto px-5"
                >
                  {t.applyAsCoach}
                </PrimaryButton>
                <SecondaryButton onClick={() => router.push("/dashboard")}>
                  {t.goToDashboard}
                </SecondaryButton>
              </>
            }
          />
        </main>
      </>
    );
  }

  return <>{children}</>;
}
