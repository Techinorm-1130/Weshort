"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import AuthCard from "@/components/auth/AuthCard";
import SocialAuth from "@/components/auth/SocialAuth";
import Input, { LockIcon, MailIcon, UserIcon } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { ROUTES } from "@/lib/constants";
import {
  validateConfirmPassword,
  validateEmail,
  validateName,
  validatePassword,
} from "@/lib/validators";
import type { FormErrors, SignupFormValues } from "@/types/auth";

type Props = { initialEmail?: string };

export default function SignupForm({ initialEmail = "" }: Props) {
  const [values, setValues] = useState<SignupFormValues>({
    name: "",
    email: initialEmail,
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors<SignupFormValues>>({});
  const [loading, setLoading] = useState(false);

  const set =
    (key: keyof SignupFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setValues({ ...values, [key]: e.target.value });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const next: FormErrors<SignupFormValues> = {
      name: validateName(values.name),
      email: validateEmail(values.email),
      password: validatePassword(values.password),
      confirmPassword: validateConfirmPassword(values.password, values.confirmPassword),
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setLoading(true);
    // TODO: call your signup API here
    setTimeout(() => setLoading(false), 800);
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start your free trial — cancel anytime."
      footer={
        <>
          Already have an account?{" "}
          <Link href={ROUTES.login} className="font-semibold text-white hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Input
          label="Full name"
          name="name"
          icon={UserIcon}
          placeholder="Jane Doe"
          autoComplete="name"
          value={values.name}
          error={errors.name}
          onChange={set("name")}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          icon={MailIcon}
          placeholder="you@example.com"
          autoComplete="email"
          value={values.email}
          error={errors.email}
          onChange={set("email")}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Password"
            name="password"
            type="password"
            icon={LockIcon}
            placeholder="••••••••"
            autoComplete="new-password"
            value={values.password}
            error={errors.password}
            onChange={set("password")}
          />
          <Input
            label="Confirm password"
            name="confirmPassword"
            type="password"
            icon={LockIcon}
            placeholder="••••••••"
            autoComplete="new-password"
            value={values.confirmPassword}
            error={errors.confirmPassword}
            onChange={set("confirmPassword")}
          />
        </div>

        <Button type="submit" loading={loading}>
          Create Account
        </Button>
      </form>

      <SocialAuth />

      <p className="mt-6 text-center text-[11px] leading-relaxed text-white/35">
        By creating an account you agree to our Terms of Use and Privacy Policy.
      </p>
    </AuthCard>
  );
}
