"use client";

import Link from "next/link";
import AuthLayout from "./AuthLayout";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
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

  const [pending, setTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const submit = async (values: LoginData) => {
    setError(null);
    setTransition(async () => {
      try {
        const response = await handleLogin({ ...values, rememberMe });
        if (!response.success) {
          throw new Error(response.message);
        }
        router.push("/dashboard");
      } catch (err: any) {
        setError(err.message || "Login failed");
      }
    });
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
        placeholder="Email or Phone Number"
        type="email"
        {...register("email")}
      />
      {errors.email?.message && (
        <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
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
        disabled={isSubmitting || pending}
      >
        {isSubmitting || pending ? "Logging in..." : "Log in"}
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
        <span>Forgot Password</span>
      </div>
    </AuthLayout>
  );
}
