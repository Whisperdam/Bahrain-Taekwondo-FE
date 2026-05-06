"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import axios from "axios";
import { useState } from "react";

import { AuthCard } from "@/components/ui/auth-card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordMeter } from "@/components/ui/password-meter";
import { PrimaryButton } from "@/components/ui/primary-button";
import { OrDivider } from "@/components/ui/or-divider";
import { ErrorBanner } from "@/components/ui/error-banner";
import { useLangStore } from "@/lib/i18n/store";
import { registerSchema, type RegisterFormData } from "@/lib/auth/validation";
import { registerApi } from "@/lib/auth/api";

export default function RegisterPage() {
  const { t, lang } = useLangStore();
  const router = useRouter();
  const [errBanner, setErrBanner] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = watch("password", "");

  async function onSubmit(data: RegisterFormData) {
    setErrBanner("");
    const nameParts = data.fullName.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ");

    try {
      await registerApi({
        firstName,
        lastName,
        username: data.username,
        email: data.email,
        password: data.password,
      });
      toast.success(
        lang === "ar"
          ? "تم إنشاء الحساب! تحقق من بريدك الإلكتروني."
          : "Account created! Please check your email to verify.",
      );
      router.push("/login");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message;
        setErrBanner(msg || (lang === "ar" ? "حدث خطأ، حاول مرة أخرى." : "Something went wrong. Please try again."));
      } else {
        setErrBanner(lang === "ar" ? "حدث خطأ، حاول مرة أخرى." : "Something went wrong. Please try again.");
      }
    }
  }

  return (
    <AuthCard screenKey="register">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <h1 className="text-2xl font-semibold text-white text-center">{t("registerTitle")}</h1>
        <p className="text-sm text-slate-400 text-center mt-1 mb-6">{t("registerSub")}</p>

        {errBanner && <ErrorBanner>{errBanner}</ErrorBanner>}

        <Field
          id="reg-name"
          label={t("labelFullName")}
          error={errors.fullName?.message ? t("errFullName") : undefined}
        >
          <Input
            id="reg-name"
            placeholder={t("fullNamePh")}
            autoComplete="name"
            error={!!errors.fullName}
            {...register("fullName")}
          />
        </Field>

        <Field
          id="reg-username"
          label={t("labelUsername")}
          error={errors.username?.message ? t("errUsername") : undefined}
        >
          <Input
            id="reg-username"
            placeholder={t("usernamePh")}
            autoComplete="username"
            error={!!errors.username}
            {...register("username")}
          />
        </Field>

        <Field
          id="reg-email"
          label={t("labelEmail")}
          error={errors.email?.message ? t("errEmail") : undefined}
        >
          <Input
            id="reg-email"
            type="email"
            placeholder={t("emailPh")}
            autoComplete="email"
            error={!!errors.email}
            {...register("email")}
          />
        </Field>

        <Field
          id="reg-pw"
          label={t("labelPassword")}
          error={errors.password?.message ? t("errPwShort") : undefined}
        >
          <PasswordInput
            id="reg-pw"
            placeholder={t("passwordPh")}
            autoComplete="new-password"
            error={!!errors.password}
            showLabel={t("show")}
            hideLabel={t("hide")}
            {...register("password")}
          />
          <PasswordMeter value={passwordValue} />
        </Field>

        <Field
          id="reg-confirm"
          label={t("labelConfirm")}
          error={errors.confirmPassword?.message ? t("errPwMatch") : undefined}
        >
          <PasswordInput
            id="reg-confirm"
            placeholder={t("confirmPwPh")}
            autoComplete="new-password"
            error={!!errors.confirmPassword}
            showLabel={t("show")}
            hideLabel={t("hide")}
            {...register("confirmPassword")}
          />
        </Field>

        <div className="mt-2">
          <PrimaryButton loading={isSubmitting} loadingText={t("creating")}>
            {t("createAccount")}
          </PrimaryButton>
        </div>

        <OrDivider />

        <div className="text-center text-sm text-slate-400">
          {t("haveAccount")}{" "}
          <Link
            href="/login"
            className="text-flag hover:text-flag-hover font-medium transition-colors"
          >
            {t("signInLink")}
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
