"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import AuthCard from "@/components/auth/AuthCard";
import SocialAuth from "@/components/auth/SocialAuth";
import Input, { LockIcon, MailIcon } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { ROUTES } from "@/lib/constants";
import { validateEmail, validatePassword } from "@/lib/validators";
import type { FormErrors, LoginFormValues } from "@/types/auth";

export default function LoginForm() {
  const [values, setValues] = useState<LoginFormValues>({
    email: "",
    password: "",
    remember: true,
  });
  const [errors, setErrors] = useState<FormErrors<LoginFormValues>>({});
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const next: FormErrors<LoginFormValues> = {
      email: validateEmail(values.email),
      password: validatePassword(values.password),
    };
    setErrors(next);
    if (next.email || next.password) return;

    setLoading(true);
    // TODO: call your auth API here
    setTimeout(() => setLoading(false), 800);
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to continue watching."
      footer={
        <>
          New to Weshort?{" "}
          <Link href={ROUTES.signup} className="font-semibold text-white hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Input
          label="Email"
          name="email"
          type="email"
          icon={MailIcon}
          placeholder="you@example.com"
          autoComplete="email"
          value={values.email}
          error={errors.email}
          onChange={(e) => setValues({ ...values, email: e.target.value })}
        />
        <Input
          label="Password"
          name="password"
          type="password"
          icon={LockIcon}
          placeholder="••••••••"
          autoComplete="current-password"
          value={values.password}
          error={errors.password}
          onChange={(e) => setValues({ ...values, password: e.target.value })}
          labelAction={
            <Link
              href={ROUTES.forgotPassword}
              className="text-xs font-medium text-white/60 hover:text-white hover:underline"
            >
              Forgot password?
            </Link>
          }
        />

        <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-white/75">
          <input
            type="checkbox"
            checked={values.remember}
            onChange={(e) => setValues({ ...values, remember: e.target.checked })}
            className="h-4 w-4 rounded border-white/30 bg-transparent accent-brand"
          />
          Remember me
        </label>

        <Button type="submit" loading={loading}>
          Sign In
        </Button>
      </form>

      <SocialAuth />

      <p className="mt-6 text-center text-[11px] leading-relaxed text-white/35">
        Protected by reCAPTCHA · By signing in you agree to our Terms &amp; Privacy Policy.
      </p>
    </AuthCard>
  );
}
