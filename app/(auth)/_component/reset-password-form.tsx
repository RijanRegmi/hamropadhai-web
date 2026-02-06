"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AuthLayout from "./AuthLayout";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";

// Reset password validation schema
const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onSubmit",
  });

  // Get email and code from URL params
  useEffect(() => {
    const emailParam = searchParams.get("email");
    const codeParam = searchParams.get("code");

    if (!emailParam || !codeParam) {
      toast.error("Invalid access. Please start over.");
      router.push("/forgot-password");
      return;
    }

    setEmail(emailParam);
    setCode(codeParam);
  }, [searchParams, router]);

  const onSubmit = async (values: ResetPasswordData) => {
    if (!email || !code) {
      toast.error("Missing email or code. Please start over.");
      router.push("/forgot-password");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050"}/api/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            code: code,
            newPassword: values.newPassword,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.message || "Failed to reset password");
        setIsLoading(false);
        return;
      }

      toast.success("Password reset successfully! Redirecting to login...");

      // Redirect to login page
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast.error("Network error. Please check your connection and try again.");
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="RESET PASSWORD"
      switchText="Remember your password?"
      switchLink="/login"
      switchLabel="Sign in"
      reverse
    >
      <p className="text-sm text-gray-600 mb-6">
        Create a new password for your account.
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="password-input-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            className="auth-input"
            placeholder="New Password"
            maxLength={35}
            {...register("newPassword")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="password-toggle-btn"
          >
            {showPassword ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 5C7 5 2.73 8.11 1 12.5C2.73 16.89 7 20 12 20C17 20 21.27 16.89 23 12.5C21.27 8.11 17 5 12 5ZM12 17.5C9.24 17.5 7 15.26 7 12.5C7 9.74 9.24 7.5 12 7.5C14.76 7.5 17 9.74 17 12.5C17 15.26 14.76 17.5 12 17.5ZM12 9.5C10.34 9.5 9 10.84 9 12.5C9 14.16 10.34 15.5 12 15.5C13.66 15.5 15 14.16 15 12.5C15 10.84 13.66 9.5 12 9.5Z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 7.5C14.76 7.5 17 9.74 17 12.5C17 13.01 16.9 13.5 16.76 13.96L19.82 17.02C21.21 15.79 22.31 14.25 23 12.5C21.27 8.11 17 5 12 5C10.73 5 9.51 5.2 8.36 5.57L10.53 7.74C11 7.6 11.49 7.5 12 7.5ZM2.71 3.16C2.32 3.55 2.32 4.18 2.71 4.57L4.68 6.54C3.06 7.83 1.77 9.53 1 12.5C2.73 16.89 7 20 12 20C13.52 20 14.97 19.7 16.31 19.18L19.03 21.9C19.42 22.29 20.05 22.29 20.44 21.9C20.83 21.51 20.83 20.88 20.44 20.49L4.13 4.17C3.74 3.78 3.1 3.78 2.71 3.16ZM12 17.5C9.24 17.5 7 15.26 7 12.5C7 11.73 7.18 11 7.49 10.36L9.06 11.93C9.03 12.11 9 12.3 9 12.5C9 14.16 10.34 15.5 12 15.5C12.2 15.5 12.39 15.47 12.57 15.44L14.14 17.01C13.5 17.32 12.77 17.5 12 17.5ZM14.97 11.17C14.82 9.77 13.72 8.68 12.33 8.53L14.97 11.17Z"
                  fill="currentColor"
                />
              </svg>
            )}
          </button>
        </div>
        {errors.newPassword?.message && (
          <p className="text-xs text-red-600 mt-1">
            {errors.newPassword.message}
          </p>
        )}

        <div className="password-input-wrapper">
          <input
            type={showConfirmPassword ? "text" : "password"}
            className="auth-input"
            placeholder="Confirm New Password"
            maxLength={35}
            {...register("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="password-toggle-btn"
          >
            {showConfirmPassword ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 5C7 5 2.73 8.11 1 12.5C2.73 16.89 7 20 12 20C17 20 21.27 16.89 23 12.5C21.27 8.11 17 5 12 5ZM12 17.5C9.24 17.5 7 15.26 7 12.5C7 9.74 9.24 7.5 12 7.5C14.76 7.5 17 9.74 17 12.5C17 15.26 14.76 17.5 12 17.5ZM12 9.5C10.34 9.5 9 10.84 9 12.5C9 14.16 10.34 15.5 12 15.5C13.66 15.5 15 14.16 15 12.5C15 10.84 13.66 9.5 12 9.5Z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 7.5C14.76 7.5 17 9.74 17 12.5C17 13.01 16.9 13.5 16.76 13.96L19.82 17.02C21.21 15.79 22.31 14.25 23 12.5C21.27 8.11 17 5 12 5C10.73 5 9.51 5.2 8.36 5.57L10.53 7.74C11 7.6 11.49 7.5 12 7.5ZM2.71 3.16C2.32 3.55 2.32 4.18 2.71 4.57L4.68 6.54C3.06 7.83 1.77 9.53 1 12.5C2.73 16.89 7 20 12 20C13.52 20 14.97 19.7 16.31 19.18L19.03 21.9C19.42 22.29 20.05 22.29 20.44 21.9C20.83 21.51 20.83 20.88 20.44 20.49L4.13 4.17C3.74 3.78 3.1 3.78 2.71 3.16ZM12 17.5C9.24 17.5 7 15.26 7 12.5C7 11.73 7.18 11 7.49 10.36L9.06 11.93C9.03 12.11 9 12.3 9 12.5C9 14.16 10.34 15.5 12 15.5C12.2 15.5 12.39 15.47 12.57 15.44L14.14 17.01C13.5 17.32 12.77 17.5 12 17.5ZM14.97 11.17C14.82 9.77 13.72 8.68 12.33 8.53L14.97 11.17Z"
                  fill="currentColor"
                />
              </svg>
            )}
          </button>
        </div>
        {errors.confirmPassword?.message && (
          <p className="text-xs text-red-600 mt-1">
            {errors.confirmPassword.message}
          </p>
        )}

        <button type="submit" className="auth-btn" disabled={isLoading}>
          {isLoading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </AuthLayout>
  );
}
