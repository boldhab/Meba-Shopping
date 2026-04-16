"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { getGoogleAuthStartUrl, requestEmailVerification } from "@/lib/api/auth";
import { User, Mail, Lock, Shield, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const checkPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.match(/[a-z]/) && pwd.match(/[A-Z]/)) strength++;
    if (pwd.match(/[0-9]/)) strength++;
    if (pwd.match(/[^a-zA-Z0-9]/)) strength++;
    setPasswordStrength(strength);
  };

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
      setVerificationMessage("Verification code sent! Check your email.");
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

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "bg-gray-200";
    if (passwordStrength === 1) return "bg-red-500";
    if (passwordStrength === 2) return "bg-orange-500";
    if (passwordStrength === 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return "No password";
    if (passwordStrength === 1) return "Weak";
    if (passwordStrength === 2) return "Fair";
    if (passwordStrength === 3) return "Good";
    return "Strong";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Brand/Logo Area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Create an account
          </h2>
          <p className="mt-2 text-slate-600">
            Join us and start your shopping journey
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-6 sm:p-8">
            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2 fade-in duration-200">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {verificationMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2 fade-in duration-200">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">{verificationMessage}</p>
                </div>
              </div>
            )}

            {/* Registration Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                  Full name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="name"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-slate-900 outline-none transition-colors focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    required
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-slate-900 outline-none transition-colors focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      checkPasswordStrength(event.target.value);
                    }}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-slate-900 outline-none transition-colors focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1 h-1.5">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`flex-1 rounded-full transition-all duration-300 ${
                            passwordStrength >= level ? getPasswordStrengthColor() : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-500">
                      Password strength: <span className="font-medium">{getPasswordStrengthText()}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Verification Section */}
              <div className="space-y-3">
                <div>
                  <label htmlFor="verification-code" className="block text-sm font-semibold text-slate-700 mb-2">
                    Verification code
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="verification-code"
                      type="text"
                      inputMode="numeric"
                      value={verificationCode}
                      onChange={(event) => setVerificationCode(event.target.value)}
                      placeholder="Enter 6-digit code"
                      required
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-center text-lg tracking-wider text-slate-900 outline-none transition-colors focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
                      maxLength={6}
                    />
                  </div>
                </div>
                
                <button
                  type="button" 
                  disabled={isRequestingVerification || !email}
                  onClick={handleRequestVerification}
                  className="h-11 w-full rounded-full border border-slate-200 bg-slate-100 font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-65"
                >
                  {isRequestingVerification ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
                      <span>Sending code...</span>
                    </div>
                  ) : (
                    "Send verification code"
                  )}
                </button>
              </div>

              <button
                type="submit" 
                disabled={isSubmitting || !verificationCode}
                className="h-11 w-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold text-white shadow-lg shadow-blue-200 transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-65"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  "Create account"
                )}
              </button>

              {/* Login Link */}
              <div className="text-center text-sm">
                <span className="text-slate-600">Already have an account? </span>
                <Link 
                  href="/login"
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </div>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-slate-500 font-medium">OR SIGN UP WITH</span>
              </div>
            </div>

            {/* Social Signup */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="inline-flex h-11 w-full items-center justify-center rounded-full border-2 border-slate-200 bg-white font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow"
            >
              <GoogleIcon />
              <span className="ml-2">Sign up with Google</span>
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-slate-500 mt-6">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="text-blue-600 hover:text-blue-700">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-blue-600 hover:text-blue-700">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
