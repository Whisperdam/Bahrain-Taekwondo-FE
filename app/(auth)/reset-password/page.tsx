"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import axios from "axios";
import { z } from "zod";

import { AuthCard } from "@/components/ui/auth-card";
import { Field } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordMeter } from "@/components/ui/password-meter";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ErrorBanner } from "@/components/ui/error-banner";
import { useLangStore } from "@/lib/i18n/store";
import { resetPasswordApi } from "@/lib/auth/api";

const resetSchema = z
  .object({
    newPassword: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetFormData = z.infer<typeof resetSchema>;

function ResetPasswordContent() {
  const { t, lang } = useLangStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const [errBanner, setErrBanner] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormData>({ resolver: zodResolver(resetSchema) });

  const passwordValue = watch("newPassword", "");

  async function onSubmit(data: ResetFormData) {
    if (!token) {
      setErrBanner(lang === "ar" ? "رابط إعادة التعيين غير صالح." : "Invalid reset link.");
      return;
    }
    setErrBanner("");
    try {
      await resetPasswordApi({ token, newPassword: data.newPassword });
      toast.success(
        lang === "ar"
          ? "تم تغيير كلمة المرور بنجاح."
          : "Password reset successfully. Please sign in.",
      );
      router.push("/login");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setErrBanner(
          err.response?.data?.message ||
            (lang === "ar" ? "حدث خطأ، حاول مرة أخرى." : "Something went wrong. Please try again."),
        );
      } else {
        setErrBanner(lang === "ar" ? "حدث خطأ، حاول مرة أخرى." : "Something went wrong. Please try again.");
      }
    }
  }

  if (!token) {
    return (
      <AuthCard screenKey="reset-invalid">
        <div className="text-center py-4">
          <h1 className="text-2xl font-semibold text-white mb-2">
            {lang === "ar" ? "رابط غير صالح" : "Invalid link"}
          </h1>
          <p className="text-sm text-slate-400 mb-6">
            {lang === "ar"
              ? "رابط إعادة التعيين مفقود أو غير صالح."
              : "This reset link is missing or invalid."}
          </p>
          <Link href="/forgot-password" className="text-sm text-flag hover:text-flag-hover font-medium transition-colors">
            {lang === "ar" ? "طلب رابط جديد" : "Request a new link"}
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard screenKey="reset-password">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <h1 className="text-2xl font-semibold text-white text-center">
          {lang === "ar" ? "كلمة مرور جديدة" : "New password"}
        </h1>
        <p className="text-sm text-slate-400 text-center mt-1 mb-6">
          {lang === "ar"
            ? "أدخل كلمة مرور جديدة لحسابك."
            : "Enter a new password for your account."}
        </p>

        {errBanner && <ErrorBanner>{errBanner}</ErrorBanner>}

        <Field
          id="new-pw"
          label={t("labelPassword")}
          error={errors.newPassword?.message ? t("errPwShort") : undefined}
        >
          <PasswordInput
            id="new-pw"
            placeholder={t("passwordPh")}
            autoComplete="new-password"
            error={!!errors.newPassword}
            showLabel={t("show")}
            hideLabel={t("hide")}
            {...register("newPassword")}
          />
          <PasswordMeter value={passwordValue} />
        </Field>

        <Field
          id="confirm-pw"
          label={t("labelConfirm")}
          error={errors.confirmPassword?.message ? t("errPwMatch") : undefined}
        >
          <PasswordInput
            id="confirm-pw"
            placeholder={t("confirmPwPh")}
            autoComplete="new-password"
            error={!!errors.confirmPassword}
            showLabel={t("show")}
            hideLabel={t("hide")}
            {...register("confirmPassword")}
          />
        </Field>

        <PrimaryButton
          loading={isSubmitting}
          loadingText={lang === "ar" ? "جارٍ الحفظ…" : "Saving…"}
        >
          {lang === "ar" ? "حفظ كلمة المرور" : "Save password"}
        </PrimaryButton>

        <div className="mt-5 text-center">
          <Link
            href="/login"
            className="text-xs text-slate-400 hover:text-flag transition-colors"
          >
            {t("back")}
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
