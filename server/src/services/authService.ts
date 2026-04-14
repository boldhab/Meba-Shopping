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
  verificationCode: string;
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

type EmailVerificationRequestInput = {
  email: string;
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
const emailVerificationStore = new Map<string, { code: string; expiresAt: number }>();

const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;
const EMAIL_VERIFICATION_TTL_MS = 10 * 60 * 1000;

function sanitizeUser(user: { passwordHash: string } & Record<string, unknown>) {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

function purgeExpiredOauthState() {
  const now = Date.now();

  for (const [key, expiresAt] of oauthStateStore.entries()) {
    if (expiresAt <= now) {
      oauthStateStore.delete(key);
    }
  }
}

function purgeExpiredEmailVerificationCode() {
  const now = Date.now();

  for (const [key, value] of emailVerificationStore.entries()) {
    if (value.expiresAt <= now) {
      emailVerificationStore.delete(key);
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
  async requestEmailVerification(input: EmailVerificationRequestInput) {
    purgeExpiredEmailVerificationCode();

    const normalizedEmail = input.email.toLowerCase();
    const existingUser = await userRepository.findByEmail(normalizedEmail);

    if (existingUser) {
      throw new ApiError(409, "An account with that email already exists.");
    }

    const code = `${Math.floor(100000 + Math.random() * 900000)}`;

    emailVerificationStore.set(normalizedEmail, {
      code,
      expiresAt: Date.now() + EMAIL_VERIFICATION_TTL_MS
    });

    return {
      message: "Verification code sent to your email.",
      expiresInSeconds: Math.floor(EMAIL_VERIFICATION_TTL_MS / 1000),
      devVerificationCode: env.isProduction ? undefined : code
    };
  },

  async register(input: RegisterInput) {
    purgeExpiredEmailVerificationCode();

    const normalizedEmail = input.email.toLowerCase();
    const existingUser = await userRepository.findByEmail(normalizedEmail);

    if (existingUser) {
      throw new ApiError(409, "An account with that email already exists.");
    }

    const verification = emailVerificationStore.get(normalizedEmail);

    if (!verification || verification.expiresAt < Date.now()) {
      throw new ApiError(401, "Verification code has expired. Please request a new one.");
    }

    if (verification.code !== input.verificationCode.trim()) {
      throw new ApiError(401, "Invalid verification code.");
    }

    emailVerificationStore.delete(normalizedEmail);

    const passwordHash = await hashPassword(input.password);

    const user = await userRepository.create({
      email: normalizedEmail,
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

  async getCurrentUser(userId: string) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    return sanitizeUser(user);
  }
};
