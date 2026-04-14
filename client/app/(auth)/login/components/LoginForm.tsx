"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { useAuth } from "@/lib/hooks/useAuth";
import { getGoogleAuthStartUrl, requestPhoneOtp, verifyPhoneOtp } from "@/lib/api/auth";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneOtpMessage, setPhoneOtpMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPhoneSubmitting, setIsPhoneSubmitting] = useState(false);
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

  const handlePhoneOtpRequest = async () => {
    setError(null);
    setPhoneOtpMessage(null);
    setIsPhoneSubmitting(true);

    try {
      const response = await requestPhoneOtp({ phoneNumber });
      setPhoneOtpMessage(
        response.devOtpCode
          ? `OTP sent. Dev code: ${response.devOtpCode}`
          : `OTP sent. It expires in ${response.expiresInSeconds} seconds.`
      );
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to request OTP right now.");
    } finally {
      setIsPhoneSubmitting(false);
    }
  };

  const handlePhoneOtpVerify = async () => {
    setError(null);
    setIsPhoneSubmitting(true);

    try {
      await verifyPhoneOtp({ phoneNumber, otpCode: phoneOtp });
      router.push("/account");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to verify OTP right now.");
    } finally {
      setIsPhoneSubmitting(false);
    }
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
      </form>
      <div className="auth-divider" />
      <div className="auth-stack">
        <Button type="button" className="button--secondary" onClick={handleGoogleLogin}>
          Sign in with Google
        </Button>
        <label className="label-stack" htmlFor="phone-login">
          Phone number
          <Input
            id="phone-login"
            type="tel"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            autoComplete="tel"
            placeholder="+15551234567"
          />
        </label>
        <label className="label-stack" htmlFor="phone-otp">
          OTP code
          <Input
            id="phone-otp"
            type="text"
            inputMode="numeric"
            value={phoneOtp}
            onChange={(event) => setPhoneOtp(event.target.value)}
            placeholder="123456"
          />
        </label>
        <div className="hero__actions">
          <Button type="button" className="button--secondary" disabled={isPhoneSubmitting || !phoneNumber} onClick={handlePhoneOtpRequest}>
            Request OTP
          </Button>
          <Button type="button" disabled={isPhoneSubmitting || !phoneNumber || !phoneOtp} onClick={handlePhoneOtpVerify}>
            Verify OTP
          </Button>
        </div>
        {phoneOtpMessage ? <p className="form-success">{phoneOtpMessage}</p> : null}
      </div>
    </section>
  );
}
