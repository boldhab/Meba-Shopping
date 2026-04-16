"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { useAuth } from "@/lib/hooks/useAuth";
import { getGoogleAuthStartUrl, requestEmailVerification } from "@/lib/api/auth";

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequestingVerification, setIsRequestingVerification] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const normalizedName = name.trim();
      await register({ name: normalizedName || undefined, email, password, verificationCode });
      router.push("/account");
    } catch (submitError) {
      if (submitError instanceof Error) {
        setError(submitError.message);
      } else {
        setError("Unable to create your account right now.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestVerification = async () => {
    setError(null);
    setVerificationMessage(null);
    setIsRequestingVerification(true);

    try {
      await requestEmailVerification({ email });
      setVerificationMessage("Verification code sent.");
    } catch (requestError) {
      if (requestError instanceof Error) {
        setError(requestError.message);
      } else {
        setError("Unable to send verification code right now.");
      }
    } finally {
      setIsRequestingVerification(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = getGoogleAuthStartUrl();
  };

  return (
    <section className="state-card auth-card">
      <h1>Create account</h1>
      <p>Register to start shopping and track your orders.</p>
      <form className="form-stack" onSubmit={handleSubmit}>
        <label className="label-stack" htmlFor="name">
          Full name
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
          />
        </label>
        <label className="label-stack" htmlFor="email">
          Email
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <label className="label-stack" htmlFor="password">
          Password
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            required
            minLength={8}
          />
        </label>
        <label className="label-stack" htmlFor="verification-code">
          Verification code
          <Input
            id="verification-code"
            type="text"
            inputMode="numeric"
            value={verificationCode}
            onChange={(event) => setVerificationCode(event.target.value)}
            placeholder="123456"
            required
          />
        </label>
        <Button type="button" className="button--secondary" disabled={isRequestingVerification || !email} onClick={handleRequestVerification}>
          {isRequestingVerification ? "Sending code..." : "Send verification code"}
        </Button>
        {verificationMessage ? <p className="form-success">{verificationMessage}</p> : null}
        {error ? <p className="form-error">{error}</p> : null}
        <Button type="submit" disabled={isSubmitting || !verificationCode}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
      <div className="auth-divider" />
      <div className="auth-stack">
        <Button type="button" className="button--secondary" onClick={handleGoogleSignup}>
          Sign up with Google
        </Button>
      </div>
    </section>
  );
}
