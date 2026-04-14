"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { useAuth } from "@/lib/hooks/useAuth";
import { getGoogleAuthStartUrl, requestPhoneOtp, verifyPhoneOtp } from "@/lib/api/auth";

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
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
      await register({ name, email, password });
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

  const handleGoogleSignup = () => {
    window.location.href = getGoogleAuthStartUrl();
  };

  const handlePhoneOtpRequest = async () => {
    setError(null);
    setPhoneOtpMessage(null);
    setIsPhoneSubmitting(true);

    try {
      const response = await requestPhoneOtp({ phoneNumber, name });
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
      await verifyPhoneOtp({ phoneNumber, otpCode: phoneOtp, name });
      router.push("/account");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to verify OTP right now.");
    } finally {
      setIsPhoneSubmitting(false);
    }
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
        {error ? <p className="form-error">{error}</p> : null}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
      <div className="auth-divider" />
      <div className="auth-stack">
        <Button type="button" className="button--secondary" onClick={handleGoogleSignup}>
          Sign up with Google
        </Button>
        <label className="label-stack" htmlFor="phone-signup">
          Phone number
          <Input
            id="phone-signup"
            type="tel"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            autoComplete="tel"
            placeholder="+15551234567"
          />
        </label>
        <label className="label-stack" htmlFor="phone-signup-otp">
          OTP code
          <Input
            id="phone-signup-otp"
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
