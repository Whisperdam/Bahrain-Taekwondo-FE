"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import axios from "axios";

import { AuthCard } from "@/components/ui/auth-card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { PrimaryButton } from "@/components/ui/primary-button";
import { OrDivider } from "@/components/ui/or-divider";
import { ErrorBanner } from "@/components/ui/error-banner";
import { useLangStore } from "@/lib/i18n/store";
import { loginSchema, type LoginFormData } from "@/lib/auth/validation";
import { loginApi } from "@/lib/auth/api";
import { useAuthStore } from "@/lib/auth/store";

export default function LoginPage() {
  const { t, lang } = useLangStore();
  const { login } = useAuthStore();
  const router = useRouter();
  const [errBanner, setErrBanner] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setErrBanner("");
    try {
      const res = await loginApi(data);
      login(res);
      toast.success(lang === "ar" ? "مرحباً بك!" : "Welcome back!");
      router.push("/");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message;
        setErrBanner(msg || t("invalidCreds"));
      } else {
        setErrBanner(t("invalidCreds"));
      }
    }
  }

  return (
    <AuthCard screenKey="login">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <h1 className="text-2xl font-semibold text-white text-center">{t("loginTitle")}</h1>
        <p className="text-sm text-slate-400 text-center mt-1 mb-6">{t("loginSub")}</p>

        {errBanner && <ErrorBanner>{errBanner}</ErrorBanner>}

        <Field
          id="login-user"
          label={t("labelUserOrEmail")}
          error={errors.username?.message}
        >
          <Input
            id="login-user"
            type="text"
            placeholder={t("userOrEmailPh")}
            autoComplete="username"
            error={!!errors.username}
            {...register("username")}
          />
        </Field>

        <Field
          id="login-pw"
          label={t("labelPassword")}
          error={errors.password?.message}
        >
          <PasswordInput
            id="login-pw"
            placeholder={t("passwordPh")}
            autoComplete="current-password"
            error={!!errors.password}
            showLabel={t("show")}
            hideLabel={t("hide")}
            {...register("password")}
          />
        </Field>

        <div className="flex justify-end -mt-2 mb-5">
          <Link
            href="/forgot-password"
            className="text-xs text-flag hover:text-flag-hover transition-colors font-medium"
          >
            {t("forgot")}
          </Link>
        </div>

        <PrimaryButton loading={isSubmitting} loadingText={t("signingIn")}>
          {t("signIn")}
        </PrimaryButton>

        <OrDivider />

        <div className="text-center text-sm text-slate-400">
          {t("noAccount")}{" "}
          <Link
            href="/register"
            className="text-flag hover:text-flag-hover font-medium transition-colors"
          >
            {t("register")}
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
