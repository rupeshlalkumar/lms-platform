
import { z } from "zod";

// Registration
export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(72),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// Login
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .max(254)
    .transform((value) => value.toLowerCase()),

  password: z.string().min(1).max(72),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Forget Password
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .max(254)
    .transform((value) => value.toLowerCase()),
});

export type ForgotPasswordInput = z.infer<
  typeof forgotPasswordSchema
>;

// Reset Password
export const resetPasswordSchema = z.object({
  token: z.string().min(1).max(512),
  newPassword: z.string().min(8).max(72),
});

export type ResetPasswordInput = z.infer<
  typeof resetPasswordSchema
>;
