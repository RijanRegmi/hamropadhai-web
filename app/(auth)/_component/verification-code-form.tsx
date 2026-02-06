"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AuthLayout from "./AuthLayout";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";

const verificationCodeSchema = z.object({
  code: z.string().length(6, "Verification code must be 6 digits"),
});

type VerificationCodeData = z.infer<typeof verificationCodeSchema>;

export default function VerificationCodeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<VerificationCodeData>({
    resolver: zodResolver(verificationCodeSchema),
    mode: "onSubmit",
  });

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  // Cooldown timer effect
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const onSubmit = async (values: VerificationCodeData) => {
    if (!email) {
      toast.error("Email missing. Please start again.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050"}/api/auth/verify-code`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            code: values.code,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        // Show error on the form field instead of just a toast
        setError("code", {
          type: "manual",
          message: result.message || "Invalid or expired verification code",
        });
        toast.error(result.message || "Invalid or expired verification code");
        setIsLoading(false);
        return;
      }

      // If verification is successful, redirect to reset password
      toast.success("Code verified! Redirecting...");
      setTimeout(() => {
        router.replace(
          `/reset-password?email=${encodeURIComponent(email)}&code=${values.code}`,
        );
      }, 500);
    } catch (error) {
      toast.error("Network error. Please try again.");
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) return toast.error("Email missing");

    setIsResending(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050"}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.message || "Failed to resend code");
        return;
      }

      toast.success("New code sent to your email!");
      setResendCooldown(60); // 60 second cooldown
    } catch {
      toast.error("Network error");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout
      title="VERIFY CODE"
      switchText="Remember your password?"
      switchLink="/login"
      switchLabel="Sign in"
      reverse
    >
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-2">
          {email ? (
            <>
              We've sent a 6-digit verification code to:
              <br />
              <span className="font-semibold text-gray-800">{email}</span>
            </>
          ) : (
            <>Please enter the 6-digit verification code sent to your email.</>
          )}
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Please check your email and enter the code below.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          className="auth-input"
          placeholder="Enter 6-Digit Code"
          maxLength={6}
          inputMode="numeric"
          onInput={(e) => {
            const input = e.target as HTMLInputElement;
            input.value = input.value.replace(/[^0-9]/g, "");
          }}
          style={{
            textAlign: "center",
            fontSize: "24px",
            letterSpacing: "8px",
            fontWeight: "bold",
          }}
          {...register("code")}
        />

        {errors.code?.message && (
          <p className="text-xs text-red-600 mt-1">{errors.code.message}</p>
        )}

        <button type="submit" className="auth-btn" disabled={isLoading}>
          {isLoading ? "Verifying..." : "Verify Code"}
        </button>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={handleResendCode}
            disabled={isResending || resendCooldown > 0}
            className="text-sm text-blue-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {isResending
              ? "Sending..."
              : resendCooldown > 0
                ? `Resend code in ${resendCooldown}s`
                : "Didn't receive code? Resend"}
          </button>
        </div>

        <div className="text-center mt-3">
          <button
            type="button"
            onClick={() => router.push("/forgot-password")}
            className="text-sm text-gray-600 hover:underline"
          >
            Change email address
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
