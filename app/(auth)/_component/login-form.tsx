"use client";

import Link from "next/link";
import AuthLayout from "./AuthLayout";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginData, loginSchema } from "./../schema";
import { handleLogin } from "./../../../lib/actions/auth-action";

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

  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const submit = async (values: LoginData) => {
    setError(null);

    try {
      const response = await handleLogin({ ...values, rememberMe });

      console.log("Login response:", response);

      if (!response.success) {
        setError(response.message || "Login failed");
        return;
      }

      // ✅ REDIRECT BASED ON ROLE
      if (response.data?.role === "admin") {
        window.location.href = "/admin/users";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please try again.");
    }
  };

  return (
    <AuthLayout
      title="LOGIN"
      switchText="Don't have an account?"
      switchLink="/register"
      switchLabel="Sign up"
    >
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <input
        className="auth-input"
        placeholder="Username"
        type="text"
        {...register("username")}
      />
      {errors.username?.message && (
        <p className="text-xs text-red-600 mt-1">{errors.username.message}</p>
      )}

      <input
        type="password"
        className="auth-input"
        placeholder="Password"
        {...register("password")}
      />
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
