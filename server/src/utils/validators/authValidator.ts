import { z } from "zod";

export const registerValidator = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: z.email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128)
});

export const loginValidator = z.object({
  email: z.email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128)
});

export const googleCallbackValidator = z.object({
  code: z.string().min(1),
  state: z.string().min(1)
});

export const phoneOtpRequestValidator = z.object({
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{7,14}$/, "Phone number must be a valid international number."),
  name: z.string().trim().min(2).max(80).optional()
});

export const phoneOtpVerifyValidator = z.object({
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{7,14}$/, "Phone number must be a valid international number."),
  otpCode: z.string().trim().regex(/^\d{6}$/, "OTP code must be 6 digits."),
  name: z.string().trim().min(2).max(80).optional()
});
