"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";

import { AuthCard } from "@/components/ui/auth-card";
import { useLangStore } from "@/lib/i18n/store";
import apiClient from "@/lib/api/client";

type Status = "loading" | "success" | "error";

function CheckIcon() {
  return (
    <svg width={56} height={56} viewBox="0 0 56 56" fill="none" aria-hidden="true">
      <circle cx="28" cy="28" r="26" fill="rgba(34,197,94,0.12)" stroke="#22C55E" strokeWidth="1.5" />
      <path d="M17 29 L25 37 L40 21" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width={56} height={56} viewBox="0 0 56 56" fill="none" aria-hidden="true">
      <circle cx="28" cy="28" r="26" fill="rgba(239,68,68,0.12)" stroke="#EF4444" strokeWidth="1.5" />
      <path d="M20 20 L36 36M36 20 L20 36" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg width={40} height={40} viewBox="0 0 24 24" fill="none" className="spinner" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function VerifyEmailContent() {
  const { lang } = useLangStore();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage(lang === "ar" ? "رابط التحقق غير صالح." : "Invalid verification link.");
      return;
    }

    apiClient
      .get(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(() => {
        setStatus("success");
      })
      .catch((err) => {
        setStatus("error");
        if (axios.isAxiosError(err)) {
          setMessage(
            err.response?.data?.message ||
              (lang === "ar" ? "رابط التحقق غير صالح أو منتهي الصلاحية." : "Invalid or expired verification link."),
          );
        } else {
          setMessage(lang === "ar" ? "حدث خطأ، حاول مرة أخرى." : "Something went wrong. Please try again.");
        }
      });
  }, [token, lang]);

  return (
    <AuthCard screenKey={`verify-${status}`}>
      <div className="text-center py-4">
        {status === "loading" && (
          <>
            <div className="flex justify-center mb-4 text-slate-400">
              <Spinner />
            </div>
            <h1 className="text-xl font-semibold text-white">
              {lang === "ar" ? "جارٍ التحقق…" : "Verifying your email…"}
            </h1>
          </>
        )}

        {status === "success" && (
          <>
            <div className="flex justify-center mb-4">
              <CheckIcon />
            </div>
            <h1 className="text-2xl font-semibold text-white">
              {lang === "ar" ? "تم التحقق بنجاح!" : "Email verified!"}
            </h1>
            <p className="text-sm text-slate-400 mt-2 mb-6 max-w-sm mx-auto leading-relaxed">
              {lang === "ar"
                ? "تم تفعيل حسابك. يمكنك الآن تسجيل الدخول."
                : "Your account is now active. You can sign in."}
            </p>
            <Link
              href="/login"
              className="inline-block bg-flag hover:bg-flag-hover text-accent-foreground text-sm font-semibold rounded-lg py-2.5 px-6 transition-colors"
            >
              {lang === "ar" ? "تسجيل الدخول" : "Sign in"}
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="flex justify-center mb-4">
              <ErrorIcon />
            </div>
            <h1 className="text-2xl font-semibold text-white">
              {lang === "ar" ? "فشل التحقق" : "Verification failed"}
            </h1>
            <p className="text-sm text-slate-400 mt-2 mb-6 max-w-sm mx-auto leading-relaxed">
              {message}
            </p>
            <div className="flex flex-col items-center gap-3">
              <Link
                href="/login"
                className="text-sm text-flag hover:text-flag-hover font-medium transition-colors"
              >
                {lang === "ar" ? "العودة إلى تسجيل الدخول" : "Back to login"}
              </Link>
            </div>
          </>
        )}
      </div>
    </AuthCard>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
