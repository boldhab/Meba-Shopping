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
  verificationCode: string;
};

type RequestEmailVerificationInput = {
  email: string;
};

export type RequestEmailVerificationResponse = {
  message: string;
  expiresInSeconds: number;
  devVerificationCode?: string;
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

export async function requestEmailVerification(input: RequestEmailVerificationInput): Promise<RequestEmailVerificationResponse> {
  return requestApi<RequestEmailVerificationResponse>("/auth/email/request-verification", {
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
