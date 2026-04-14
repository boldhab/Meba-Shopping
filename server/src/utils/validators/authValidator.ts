import { z } from "zod";

export const registerValidator = z.object({
  name: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().min(2).max(80).optional()
  ),
  email: z.email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128),
  verificationCode: z.string().trim().regex(/^\d{6}$/, "Verification code must be 6 digits.")
});

export const requestEmailVerificationValidator = z.object({
  email: z.email().transform((value) => value.toLowerCase())
});

export const loginValidator = z.object({
  email: z.email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128)
});

export const googleCallbackValidator = z.object({
  code: z.string().min(1),
  state: z.string().min(1)
});
