import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const emptyToUndefined = (value: unknown) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
};

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_URL: z.url(),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters long."),
  JWT_EXPIRES_IN: z.string().default("7d"),
  MAIL_FROM: z.preprocess(emptyToUndefined, z.string().min(1).default("no-reply@meba.local")),
  SMTP_HOST: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_SECURE: z.stringbool().default(false),
  SMTP_USER: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  SMTP_PASS: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  GOOGLE_CLIENT_ID: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  GOOGLE_CLIENT_SECRET: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  GOOGLE_REDIRECT_URI: z.preprocess(emptyToUndefined, z.union([z.string().url(), z.literal("")]).optional()),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(8).max(15).default(10)
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error(`Invalid server environment variables: ${parsedEnv.error.message}`);
}

const values = parsedEnv.data;

export const env = {
  nodeEnv: values.NODE_ENV,
  port: values.PORT,
  clientUrl: values.CLIENT_URL,
  databaseUrl: values.DATABASE_URL,
  jwtSecret: values.JWT_SECRET,
  jwtExpiresIn: values.JWT_EXPIRES_IN,
  mailFrom: values.MAIL_FROM,
  smtpHost: values.SMTP_HOST,
  smtpPort: values.SMTP_PORT,
  smtpSecure: values.SMTP_SECURE,
  smtpUser: values.SMTP_USER,
  smtpPass: values.SMTP_PASS,
  googleClientId: values.GOOGLE_CLIENT_ID,
  googleClientSecret: values.GOOGLE_CLIENT_SECRET,
  googleRedirectUri: values.GOOGLE_REDIRECT_URI,
  rateLimitWindowMs: values.RATE_LIMIT_WINDOW_MS,
  rateLimitMax: values.RATE_LIMIT_MAX,
  bcryptSaltRounds: values.BCRYPT_SALT_ROUNDS,
  isProduction: values.NODE_ENV === "production"
};
