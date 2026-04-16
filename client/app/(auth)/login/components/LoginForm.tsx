"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { getGoogleAuthStartUrl } from "@/lib/api/auth";
import { Mail, Lock, Globe, AlertCircle, Eye, EyeOff } from "lucide-react";

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.8-6-6.2s2.7-6.2 6-6.2c1.9 0 3.2.8 4 1.5l2.7-2.6C17 2.7 14.8 1.8 12 1.8 6.5 1.8 2 6.4 2 12s4.5 10.2 10 10.2c5.8 0 9.6-4.1 9.6-9.8 0-.7-.1-1.2-.2-1.8H12z"
      />
      <path
        fill="#34A853"
        d="M2 7.8l3.2 2.3C6.1 7.5 8.8 5.6 12 5.6c1.9 0 3.2.8 4 1.5l2.7-2.6C17 2.7 14.8 1.8 12 1.8 8.2 1.8 4.9 4 3.2 7.2L2 7.8z"
      />
      <path
        fill="#FBBC05"
        d="M12 22.2c2.7 0 5-0.9 6.7-2.5l-3.1-2.6c-.9.6-2.1 1-3.6 1-3.9 0-5.2-2.5-5.5-3.8L3.2 17C4.9 20.1 8.2 22.2 12 22.2z"
      />
      <path
        fill="#4285F4"
        d="M21.6 12.4c0-.7-.1-1.2-.2-1.8H12v3.9h5.5c-.3 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.8-6-6.2 0-1.2.3-2.4.9-3.3L3.2 7.2C2.4 8.7 2 10.3 2 12c0 5.6 4.5 10.2 10 10.2 5.8 0 9.6-4.1 9.6-9.8z"
      />
    </svg>
  );
}

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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
    <section className="mx-auto w-full max-w-2xl rounded-3xl border border-[var(--color-border)] bg-[rgba(255,253,248,0.94)] p-8 shadow-[0_14px_40px_rgba(31,29,26,0.08)]">
      <div className="mb-5 flex flex-col gap-2">
        <div
          className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--color-accent),#0a5f41)] text-white shadow-[0_14px_30px_rgba(14,122,83,0.2)]"
          aria-hidden="true"
        >
          <Globe size={20} />
        </div>
        <h1 className="m-0 text-3xl font-semibold text-[var(--color-text)]">Welcome back</h1>
        <p className="m-0 text-[var(--color-muted)]">Sign in to access your account and orders.</p>
      </div>

      {error ? (
        <div
          className="mb-4 flex items-start gap-2 rounded-2xl bg-[rgba(165,34,34,0.08)] px-4 py-3 text-[color:#8f1c1c]"
          role="alert"
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      ) : null}

      <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2 text-sm font-medium text-[var(--color-text)]" htmlFor="email">
          Email
          <span className="relative flex items-center">
            <Mail size={16} className="pointer-events-none absolute left-3 z-10 text-[var(--color-muted)]" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 pl-10 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[rgba(14,122,83,0.2)]"
            />
          </span>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-[var(--color-text)]" htmlFor="password">
          Password
          <span className="relative flex items-center">
            <Lock size={16} className="pointer-events-none absolute left-3 z-10 text-[var(--color-muted)]" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              minLength={8}
              placeholder="••••••••"
              className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 pl-10 pr-12 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[rgba(14,122,83,0.2)]"
            />
            <button
              type="button"
              className="absolute right-3 z-10 inline-flex items-center justify-center bg-transparent p-0 text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </span>
        </label>

        <div className="flex flex-wrap justify-between gap-3">
          <p className="m-0 text-sm text-[var(--color-muted)]">
            <Link href="/forgot-password" className="text-[var(--color-accent)] underline">
              Forgot password?
            </Link>
          </p>
          <p className="m-0 text-sm text-[var(--color-muted)]">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[var(--color-accent)] underline">
              Sign up
            </Link>
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-full border border-[var(--color-accent)] bg-[var(--color-accent)] px-4 py-3 font-medium text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-65"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="my-6 h-px bg-[var(--color-border)]" />

      <div className="flex flex-col gap-3">
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-medium text-[var(--color-text)] transition hover:bg-white"
          onClick={handleGoogleLogin}
        >
          <GoogleIcon />
          Sign in with Google
        </button>
      </div>

      <p className="mt-5 text-sm leading-6 text-[var(--color-muted)]">
        By signing in, you agree to our{" "}
        <Link href="/terms" className="text-[var(--color-accent)] underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-[var(--color-accent)] underline">
          Privacy Policy
        </Link>
        .
      </p>
    </section>
  );
}
