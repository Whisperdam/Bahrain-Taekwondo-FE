"use client";

import { ErrorPage } from "@/components/ui/error-page";

/**
 * Rendered when a server component calls Next.js `forbidden()`. We mostly
 * gate routes client-side via per-layout role checks, but this is here as a
 * proper landing page for the few server-rendered guards we may add later.
 */
export default function Forbidden() {
  return (
    <ErrorPage
      code="403"
      title={{ en: "Access forbidden", ar: "غير مصرّح بالوصول" }}
      body={{
        en: "You don't have permission to view this page. If you believe this is a mistake, contact a federation administrator.",
        ar: "ليس لديك صلاحية لعرض هذه الصفحة. إذا كنت تعتقد أن هذا خطأ، تواصل مع مشرف الاتحاد.",
      }}
    />
  );
}
