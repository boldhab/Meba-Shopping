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
