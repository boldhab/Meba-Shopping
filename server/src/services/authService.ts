import crypto from "node:crypto";
import { userRepository } from "../repositories/userRepository";
import { env } from "../config/env";
import { ApiError } from "../utils/apiError";
import { generateToken } from "../utils/generateToken";
import { hashPassword, verifyPassword } from "../utils/hashPassword";

type UserRole = "CUSTOMER" | "ADMIN";

type RegisterInput = {
  name?: string;
  email: string;
  password: string;
  role?: UserRole;
};

type LoginInput = {
  email: string;
  password: string;
};

type GoogleCallbackInput = {
  code: string;
  state: string;
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

type GoogleTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  id_token?: string;
};

type GoogleUserProfile = {
  email: string;
  email_verified: boolean;
  name?: string;
};

type AuthUserRecord = {
  id: string;
  email: string;
  role: UserRole;
  passwordHash: string;
} & Record<string, unknown>;

const oauthStateStore = new Map<string, number>();
const phoneOtpStore = new Map<string, { otpCode: string; expiresAt: number; name?: string }>();

const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;
const PHONE_OTP_TTL_MS = 5 * 60 * 1000;

function sanitizeUser(user: { passwordHash: string } & Record<string, unknown>) {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

function normalizePhoneNumber(phoneNumber: string) {
  return phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`;
}

function phoneNumberToEmail(phoneNumber: string) {
  return `${phoneNumber.replace(/[^\d]/g, "")}@phone.meba.local`;
}

function purgeExpiredOtp() {
  const now = Date.now();

  for (const [key, value] of phoneOtpStore.entries()) {
    if (value.expiresAt <= now) {
      phoneOtpStore.delete(key);
    }
  }
}

function purgeExpiredOauthState() {
  const now = Date.now();

  for (const [key, expiresAt] of oauthStateStore.entries()) {
    if (expiresAt <= now) {
      oauthStateStore.delete(key);
    }
  }
}

function createTokenResponse(user: AuthUserRecord) {
  const token = generateToken({
    sub: user.id,
    email: user.email,
    role: user.role
  });

  return {
    user: sanitizeUser(user),
    token
  };
}

async function exchangeGoogleCodeForToken(code: string) {
  if (!env.googleClientId || !env.googleClientSecret || !env.googleRedirectUri) {
    throw new ApiError(500, "Google auth is not configured on the server.");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      code,
      client_id: env.googleClientId,
      client_secret: env.googleClientSecret,
      redirect_uri: env.googleRedirectUri,
      grant_type: "authorization_code"
    })
  });

  if (!response.ok) {
    throw new ApiError(401, "Google authentication failed while exchanging authorization code.");
  }

  return (await response.json()) as GoogleTokenResponse;
}

async function fetchGoogleUserProfile(accessToken: string) {
  const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new ApiError(401, "Google authentication failed while loading user profile.");
  }

  return (await response.json()) as GoogleUserProfile;
}

async function getOrCreateUserByEmail(email: string, name?: string) {
  const existingUser = await userRepository.findByEmail(email);

  if (existingUser) {
    return existingUser;
  }

  const passwordHash = await hashPassword(crypto.randomUUID());

  return userRepository.create({
    email,
    name,
    passwordHash,
    role: "CUSTOMER"
  });
}

export const authService = {
  async register(input: RegisterInput) {
    const existingUser = await userRepository.findByEmail(input.email);

    if (existingUser) {
      throw new ApiError(409, "An account with that email already exists.");
    }

    const passwordHash = await hashPassword(input.password);

    const user = await userRepository.create({
      email: input.email,
      name: input.name,
      passwordHash,
      role: input.role ?? "CUSTOMER"
    });

    return createTokenResponse(user as AuthUserRecord);
  },

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);

    if (!user) {
      throw new ApiError(401, "Invalid email or password.");
    }

    const isPasswordValid = await verifyPassword(input.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid email or password.");
    }

    return createTokenResponse(user as AuthUserRecord);
  },

  createGoogleAuthUrl() {
    if (!env.googleClientId || !env.googleClientSecret || !env.googleRedirectUri) {
      throw new ApiError(500, "Google auth is not configured on the server.");
    }

    purgeExpiredOauthState();

    const state = crypto.randomUUID();
    oauthStateStore.set(state, Date.now() + OAUTH_STATE_TTL_MS);

    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", env.googleClientId);
    authUrl.searchParams.set("redirect_uri", env.googleRedirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "openid email profile");
    authUrl.searchParams.set("access_type", "offline");
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("prompt", "select_account");

    return authUrl.toString();
  },

  async googleCallback(input: GoogleCallbackInput) {
    purgeExpiredOauthState();

    const expiresAt = oauthStateStore.get(input.state);

    if (!expiresAt || expiresAt < Date.now()) {
      throw new ApiError(401, "Invalid or expired Google OAuth state.");
    }

    oauthStateStore.delete(input.state);

    const tokenResponse = await exchangeGoogleCodeForToken(input.code);
    const profile = await fetchGoogleUserProfile(tokenResponse.access_token);

    if (!profile.email || !profile.email_verified) {
      throw new ApiError(401, "Google account email is missing or not verified.");
    }

    const user = await getOrCreateUserByEmail(profile.email.toLowerCase(), profile.name);
    const auth = createTokenResponse(user as AuthUserRecord);

    const clientRedirect = new URL(`${env.clientUrl}/login`);
    clientRedirect.searchParams.set("token", auth.token);
    clientRedirect.searchParams.set("provider", "google");

    return clientRedirect.toString();
  },

  requestPhoneOtp(input: PhoneOtpRequestInput) {
    purgeExpiredOtp();

    const normalizedPhone = normalizePhoneNumber(input.phoneNumber);
    const otpCode = `${Math.floor(100000 + Math.random() * 900000)}`;
    const expiresAt = Date.now() + PHONE_OTP_TTL_MS;

    phoneOtpStore.set(normalizedPhone, {
      otpCode,
      expiresAt,
      name: input.name
    });

    return {
      message: "OTP sent successfully.",
      expiresInSeconds: Math.floor(PHONE_OTP_TTL_MS / 1000),
      devOtpCode: env.isProduction ? undefined : otpCode
    };
  },

  async verifyPhoneOtp(input: PhoneOtpVerifyInput) {
    purgeExpiredOtp();

    const normalizedPhone = normalizePhoneNumber(input.phoneNumber);
    const otp = phoneOtpStore.get(normalizedPhone);

    if (!otp || otp.expiresAt < Date.now()) {
      throw new ApiError(401, "OTP code has expired. Please request a new one.");
    }

    if (otp.otpCode !== input.otpCode) {
      throw new ApiError(401, "Invalid OTP code.");
    }

    phoneOtpStore.delete(normalizedPhone);

    const emailAlias = phoneNumberToEmail(normalizedPhone);
    const name = input.name ?? otp.name;
    const user = await getOrCreateUserByEmail(emailAlias, name);

    return createTokenResponse(user as AuthUserRecord);
  },

  async getCurrentUser(userId: string) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    return sanitizeUser(user);
  }
};
