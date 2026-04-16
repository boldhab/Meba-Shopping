"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { useAuth } from "@/lib/hooks/useAuth";
import { getGoogleAuthStartUrl } from "@/lib/api/auth";
import { Mail, Lock, Globe, AlertCircle, Eye, EyeOff } from "lucide-react";

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
    <section className="state-card auth-card auth-card--login">
      <div className="auth-login__header">
        <div className="auth-login__badge" aria-hidden="true">
          <Globe size={20} />
        </div>
        <h1>Welcome back</h1>
        <p>Sign in to access your account and orders.</p>
      </div>

      {error ? (
        <div className="auth-login__error" role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      ) : null}

      <form className="form-stack" onSubmit={handleSubmit}>
        <label className="label-stack" htmlFor="email">
          Email
          <span className="auth-login__field">
            <Mail size={16} className="auth-login__field-icon" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              placeholder="you@example.com"
            />
          </span>
        </label>

        <label className="label-stack" htmlFor="password">
          Password
          <span className="auth-login__field">
            <Lock size={16} className="auth-login__field-icon" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              minLength={8}
              placeholder="••••••••"
              className="auth-login__password-input"
            />
            <button
              type="button"
              className="auth-login__toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </span>
        </label>

        <div className="auth-login__meta-links">
          <p className="auth-meta-text">
            <Link href="/forgot-password">Forgot password?</Link>
          </p>
          <p className="auth-meta-text">
            Don&apos;t have an account? <Link href="/register">Sign up</Link>
          </p>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="auth-divider" />

      <div className="auth-stack">
        <Button type="button" className="button--secondary auth-login__google" onClick={handleGoogleLogin}>
          <Globe size={16} />
          Sign in with Google
        </Button>
      </div>

      <p className="auth-login__footer">
        By signing in, you agree to our <Link href="/terms">Terms of Service</Link> and <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </section>
  );
}