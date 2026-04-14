import { apiClient, requestApi } from "./client";

export type AuthUser = {
  id: string;
  name: string | null;
  email: string;
  role: "CUSTOMER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  user: AuthUser;
  token: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type RegisterInput = {
  name?: string;
  email: string;
  password: string;
};

type PhoneOtpRequestInput = {
  phoneNumber: string;
  name?: string;
};

type PhoneOtpVerifyInput = {
  phoneNumber: string;
  otpCode: string;
  name?: string;
};

export type PhoneOtpRequestResponse = {
  message: string;
  expiresInSeconds: number;
  devOtpCode?: string;
};

export async function login(input: LoginInput): Promise<AuthResponse> {
  return requestApi<AuthResponse>("/auth/login", {
    method: "POST",
    body: input
  });
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
  return requestApi<AuthResponse>("/auth/register", {
    method: "POST",
    body: input
  });
}

export async function getCurrentUser(token: string): Promise<{ user: AuthUser }> {
  return requestApi<{ user: AuthUser }>("/auth/me", {
    token
  });
}

export function getGoogleAuthStartUrl() {
  return `${apiClient.baseUrl}/auth/google/start`;
}

export async function requestPhoneOtp(input: PhoneOtpRequestInput): Promise<PhoneOtpRequestResponse> {
  return requestApi<PhoneOtpRequestResponse>("/auth/phone/request-otp", {
    method: "POST",
    body: input
  });
}

export async function verifyPhoneOtp(input: PhoneOtpVerifyInput): Promise<AuthResponse> {
  return requestApi<AuthResponse>("/auth/phone/verify", {
    method: "POST",
    body: input
  });
}
