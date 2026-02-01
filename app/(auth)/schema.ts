import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(3, "Enter a valid username"),
  password: z.string().min(6, "Minimum 6 characters"),
  rememberMe: z.boolean().optional(),
});

export type LoginData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(7, "Enter a valid phone number"),
  password: z.string().min(6, "Minimum 6 characters"),
  confirmPassword: z.string().min(6, "Minimum 6 characters"),
  gender: z.enum(["male", "female"], {
    message: "Please select your gender"
  }),
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
});

export type RegisterData = z.infer<typeof registerSchema>;