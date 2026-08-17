"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import AuthCard from "@/components/auth/AuthCard";
import Input, { MailIcon } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { ROUTES } from "@/lib/constants";
import { validateEmail } from "@/lib/validators";
import type { ForgotPasswordFormValues, FormErrors } from "@/types/auth";

export default function ForgotPasswordForm() {
  const [values, setValues] = useState<ForgotPasswordFormValues>({ email: "" });
  const [errors, setErrors] = useState<FormErrors<ForgotPasswordFormValues>>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const next = { email: validateEmail(values.email) };
    setErrors(next);
    if (next.email) return;

    setLoading(true);
    // TODO: call your reset-password API here
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 800);
  }

  const backLink = (
    <Link href={ROUTES.login} className="inline-flex items-center gap-1.5 font-semibold text-white hover:underline">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M15 6l-6 6 6 6" />
      </svg>
      Back to sign in
    </Link>
  );

  if (sent) {
    return (
      <AuthCard title="Check your inbox" footer={backLink}>
        <div className="flex flex-col items-center text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/15 text-brand ring-1 ring-brand/30">
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="5" width="18" height="14" rx="2.5" />
              <path d="M3.5 7.5l8.5 6 8.5-6" />
            </svg>
          </span>
          <p className="mt-5 text-sm text-muted">
            We sent a password reset link to{" "}
            <span className="font-medium text-white">{values.email}</span>. It may take a
            minute to arrive — check your spam folder too.
          </p>
          <Button type="button" variant="secondary" className="mt-6" onClick={() => setSent(false)}>
            Use a different email
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a link to reset it."
      footer={backLink}
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
          onChange={(e) => setValues({ email: e.target.value })}
        />
        <Button type="submit" loading={loading}>
          Send reset link
        </Button>
      </form>
    </AuthCard>
  );
}
