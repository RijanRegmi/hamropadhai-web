"use client";

import AuthLayout from "./AuthLayout";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterData, registerSchema } from ".././schema";
import { handleRegister } from "./../../../lib/actions/auth-action";

export default function RegisterForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit",
  });

  const [pending, setTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const submit = async (values: RegisterData) => {
    setError(null);
    setTransition(async () => {
      try {
        const response = await handleRegister(values);
        if (!response.success) {
          throw new Error(response.message);
        }
        alert("Account created successfully");
        router.push("/login");
      } catch (err: any) {
        let errorMessage = err.message || "Registration failed";

        // Parse specific error messages
        if (errorMessage.includes("Username already exists")) {
          errorMessage = "Username already exists";
        } else if (errorMessage.includes("Email already exists")) {
          errorMessage = "Email already exists";
        } else if (errorMessage.includes("Phone number already exists")) {
          errorMessage = "Phone number already exists";
        }

        setError(errorMessage);
      }
    });
  };

  return (
    <AuthLayout
      title="Sign up"
      switchText="Already have an account?"
      switchLink="/login"
      switchLabel="Sign in"
      reverse
    >
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <input
        className="auth-input"
        placeholder="Full Name"
        {...register("fullName")}
      />
      {errors.fullName?.message && (
        <p className="text-xs text-red-600 mt-1">{errors.fullName.message}</p>
      )}

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
        className="auth-input"
        placeholder="Email"
        type="email"
        {...register("email")}
      />
      {errors.email?.message && (
        <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
      )}

      <input
        className="auth-input"
        placeholder="Phone Number"
        {...register("phone")}
      />
      {errors.phone?.message && (
        <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>
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

      <input
        type="password"
        className="auth-input"
        placeholder="Confirm Password"
        {...register("confirmPassword")}
      />
      {errors.confirmPassword?.message && (
        <p className="text-xs text-red-600 mt-1">
          {errors.confirmPassword.message}
        </p>
      )}

      <div className="gender-group">
        <label>
          <input type="radio" value="male" {...register("gender")} /> Male
        </label>

        <label>
          <input type="radio" value="female" {...register("gender")} /> Female
        </label>
      </div>
      {errors.gender?.message && (
        <p className="text-xs text-red-600">{errors.gender.message}</p>
      )}

      <button
        onClick={handleSubmit(submit)}
        className="auth-btn"
        disabled={isSubmitting || pending}
      >
        {isSubmitting || pending ? "Signing up..." : "Sign up"}
      </button>
    </AuthLayout>
  );
}
