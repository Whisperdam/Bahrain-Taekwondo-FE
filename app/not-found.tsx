"use client";

import { ErrorPage } from "@/components/ui/error-page";

export default function NotFound() {
  return (
    <ErrorPage
      code="404"
      title={{ en: "Page not found", ar: "الصفحة غير موجودة" }}
      body={{
        en: "The page you were looking for doesn't exist or has moved. Head back to the dashboard or try the link again.",
        ar: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها. عُد إلى الرئيسية أو حاول من جديد.",
      }}
    />
  );
}
