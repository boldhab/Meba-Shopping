"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { useAuth } from "@/lib/hooks/useAuth";
import { getGoogleAuthStartUrl } from "@/lib/api/auth";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
      router.push("/account");
    } catch (submitError) {
      if (submitError instanceof Error) {
        setError(submitError.message);
      } else {
        setError("Unable to login right now.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = getGoogleAuthStartUrl();
  };

  return (
    <section className="state-card auth-card">
      <h1>Login</h1>
      <p>Sign in to access your account and orders.</p>
      <form className="form-stack" onSubmit={handleSubmit}>
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
            autoComplete="current-password"
            required
            minLength={8}
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Login"}
        </Button>
        <div className="auth-meta-links">
          <p className="auth-meta-text">
            Don&apos;t have an account? <Link href="/register">Sign up</Link>
          </p>
          <p className="auth-meta-text">
            <Link href="/forgot-password">Forgot password?</Link>
          </p>
        </div>
      </form>
      <div className="auth-divider" />
      <div className="auth-stack">
        <Button type="button" className="button--secondary" onClick={handleGoogleLogin}>
          Sign in with Google
        </Button>
      </div>
    </section>
  );
}
