"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { requestPasswordReset, confirmPasswordReset } from "@/lib/api/auth";

type Step = "request" | "confirm" | "done";

export function ForgotPasswordForm() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | undefined>(undefined);

  // Step 1 — request the reset code
  const handleRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await requestPasswordReset({ email });
      if (result.devResetCode) {
        setDevCode(result.devResetCode);
      }
      setStep("confirm");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send reset code right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2 — verify code + set new password
  const handleConfirm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await confirmPasswordReset({ email, code, newPassword });
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reset password right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "done") {
    return (
      <section className="state-card auth-card">
        <h1>Password updated</h1>
        <p>Your password has been changed successfully. You can now log in with your new password.</p>
        <div className="form-stack">
          <Button type="button" onClick={() => router.push("/login")}>
            Go to login
          </Button>
        </div>
      </section>
    );
  }

  if (step === "confirm") {
    return (
      <section className="state-card auth-card">
        <h1>Enter reset code</h1>
        <p>
          A 6-digit reset code was sent to <strong>{email}</strong>. Enter it below along with your new password.
        </p>
        {devCode ? (
          <p className="form-success">
            Dev mode — your code is: <strong>{devCode}</strong>
          </p>
        ) : null}
        <form className="form-stack" onSubmit={handleConfirm}>
          <label className="label-stack" htmlFor="reset-code">
            Reset code
            <Input
              id="reset-code"
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              maxLength={6}
              required
            />
          </label>
          <label className="label-stack" htmlFor="new-password">
            New password
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>
          <label className="label-stack" htmlFor="confirm-password">
            Confirm new password
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <Button type="submit" disabled={isSubmitting || !code || !newPassword || !confirmPassword}>
            {isSubmitting ? "Resetting..." : "Reset password"}
          </Button>
          <div className="auth-meta-links">
            <p className="auth-meta-text">
              Didn&apos;t receive a code?{" "}
              <button
                type="button"
                className="auth-meta-text"
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "var(--color-accent)", textDecoration: "underline" }}
                onClick={() => { setStep("request"); setError(null); setCode(""); setDevCode(undefined); }}
              >
                Try again
              </button>
            </p>
          </div>
        </form>
      </section>
    );
  }

  return (
    <section className="state-card auth-card">
      <h1>Forgot password</h1>
      <p>Enter your account email and we&apos;ll send you a 6-digit code to reset your password.</p>
      <form className="form-stack" onSubmit={handleRequest}>
        <label className="label-stack" htmlFor="email">
          Email
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <Button type="submit" disabled={isSubmitting || !email}>
          {isSubmitting ? "Sending code..." : "Send reset code"}
        </Button>
        <div className="auth-meta-links">
          <p className="auth-meta-text">
            Remembered your password? <Link href="/login">Log in</Link>
          </p>
        </div>
      </form>
    </section>
  );
}
