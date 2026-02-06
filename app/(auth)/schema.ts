import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .min(3, "Enter a valid username")
    .max(20, "Username cannot exceed 20 characters")
    .transform((val) => val.toLowerCase()),
  password: z
    .string()
    .min(6, "Minimum 6 characters")
    .max(35, "Password cannot exceed 35 characters"),
  rememberMe: z.boolean().optional(),
});

export type LoginData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z.string().min(2, "Enter your full name"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username cannot exceed 20 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      )
      .transform((val) => val.toLowerCase()),
    email: z.string().email("Enter a valid email"),
    phone: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .max(15, "Phone number cannot exceed 15 digits")
      .regex(/^[0-9]+$/, "Phone number must contain only digits"),
    password: z
      .string()
      .min(6, "Minimum 6 characters")
      .max(35, "Password cannot exceed 35 characters"),
    confirmPassword: z
      .string()
      .min(6, "Minimum 6 characters")
      .max(35, "Password cannot exceed 35 characters"),
    gender: z.enum(["male", "female"], {
      message: "Please select your gender",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type RegisterData = z.infer<typeof registerSchema>;