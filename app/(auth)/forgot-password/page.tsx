"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import axios from "axios";

import { AuthCard } from "@/components/ui/auth-card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ErrorBanner } from "@/components/ui/error-banner";
import { useLangStore } from "@/lib/i18n/store";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/auth/validation";
import { forgotPasswordApi } from "@/lib/auth/api";

function CheckIcon() {
  return (
    <svg width={56} height={56} viewBox="0 0 56 56" fill="none" aria-hidden="true">
      <circle cx="28" cy="28" r="26" fill="rgba(34,197,94,0.12)" stroke="#22C55E" strokeWidth="1.5" />
      <path d="M17 29 L25 37 L40 21" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export default function ForgotPasswordPage() {
  const { t, lang } = useLangStore();
  const [sent, setSent] = useState(false);
  const [errBanner, setErrBanner] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    setErrBanner("");
    try {
      await forgotPasswordApi(data.email);
      setSent(true);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status !== 200) {
        const msg = err.response?.data?.message;
        setErrBanner(msg || (lang === "ar" ? "حدث خطأ، حاول مرة أخرى." : "Something went wrong. Please try again."));
      } else {
        // Show success even on ambiguous errors (prevents email enumeration)
        setSent(true);
      }
    }
  }

  if (sent) {
    return (
      <AuthCard screenKey="forgot-sent">
        <div className="text-center py-2">
          <div className="flex justify-center mb-4">
            <CheckIcon />
          </div>
          <h1 className="text-2xl font-semibold text-white">{t("inboxTitle")}</h1>
          <p className="text-sm text-slate-400 mt-2 mb-6 max-w-sm mx-auto leading-relaxed">
            {t("inboxSub")}
          </p>
          <Link
            href="/login"
            className="text-sm text-flag hover:text-flag-hover font-medium transition-colors"
          >
            {t("back")}
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard screenKey="forgot">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <h1 className="text-2xl font-semibold text-white text-center">{t("forgotTitle")}</h1>
        <p className="text-sm text-slate-400 text-center mt-1 mb-6 max-w-sm mx-auto leading-relaxed">
          {t("forgotSub")}
        </p>

        {errBanner && <ErrorBanner>{errBanner}</ErrorBanner>}

        <Field
          id="forgot-email"
          label={t("labelEmail")}
          error={errors.email?.message ? t("errEmail") : undefined}
        >
          <Input
            id="forgot-email"
            type="email"
            placeholder={t("emailPh")}
            autoComplete="email"
            error={!!errors.email}
            {...register("email")}
          />
        </Field>

        <PrimaryButton loading={isSubmitting} loadingText={t("sending")}>
          {t("sendLink")}
        </PrimaryButton>

        <div className="mt-5 text-center">
          <Link
            href="/login"
            className="text-xs text-slate-400 hover:text-flag transition-colors inline-flex items-center gap-1.5"
          >
            <span className={lang === "ar" ? "rotate-180 inline-block" : ""}>←</span>
            <span>{t("back")}</span>
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
