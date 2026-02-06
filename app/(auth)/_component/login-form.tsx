"use client";

import Link from "next/link";
import AuthLayout from "./AuthLayout";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginData, loginSchema } from "./../schema";
import { handleLogin } from "./../../../lib/actions/auth-action";
import toast from "react-hot-toast";

export default function LoginForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (values: LoginData) => {
    try {
      const response = await handleLogin({ ...values, rememberMe });

      if (!response.success) {
        toast.error(response.message || "Login failed");
        return;
      }

      toast.success("Login successful! Redirecting...");

      setTimeout(() => {
        if (response.data?.role === "admin") {
          window.location.href = "/admin/users";
        } else {
          window.location.href = "/dashboard";
        }
      }, 1000);
    } catch (err: any) {
      console.error("Login error:", err);
      toast.error(err.message || "Login failed. Please try again.");
    }
  };

  return (
    <AuthLayout
      title="LOGIN"
      switchText="Don't have an account?"
      switchLink="/register"
      switchLabel="Sign up"
    >
      <input
        className="auth-input"
        placeholder="Username"
        type="text"
        autoCapitalize="none"
        autoComplete="username"
        maxLength={20}
        onInput={(e) => {
          const input = e.target as HTMLInputElement;
          input.value = input.value.toLowerCase();
        }}
        {...register("username")}
      />

      {errors.username?.message && (
        <p className="text-xs text-red-600 mt-1">{errors.username.message}</p>
      )}

      <div className="password-input-wrapper">
        <input
          type={showPassword ? "text" : "password"}
          className="auth-input"
          placeholder="Password"
          maxLength={35}
          {...register("password")}
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
      {errors.password?.message && (
        <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
      )}

      <button
        onClick={handleSubmit(submit)}
        className="auth-btn"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Logging in..." : "Log in"}
      </button>

      <div className="auth-row">
        <label className="remember-me-label">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="remember-me-checkbox"
          />
          Remember me
        </label>
        <Link
          href="/forgot-password"
          className="text-sm text-blue-600 hover:underline"
        >
          Forgot Password?
        </Link>
      </div>
    </AuthLayout>
  );
}
