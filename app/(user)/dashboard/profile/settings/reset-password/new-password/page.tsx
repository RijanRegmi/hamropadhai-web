"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import toast from "react-hot-toast";
import HamroPadhai from "./../../../../../../../assets/images/HamroPadhai.png";
import { resetPasswordAction } from "./../../../../../../../lib/actions/reset-password-authenticated-action";
import "./../reset-password-authenticated.css";

const schema = z
  .object({
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(35),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

function EyeIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 5C7 5 2.73 8.11 1 12.5C2.73 16.89 7 20 12 20C17 20 21.27 16.89 23 12.5C21.27 8.11 17 5 12 5ZM12 17.5C9.24 17.5 7 15.26 7 12.5C7 9.74 9.24 7.5 12 7.5C14.76 7.5 17 9.74 17 12.5C17 15.26 14.76 17.5 12 17.5ZM12 9.5C10.34 9.5 9 10.84 9 12.5C9 14.16 10.34 15.5 12 15.5C13.66 15.5 15 14.16 15 12.5C15 10.84 13.66 9.5 12 9.5Z"
        fill="currentColor"
      />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 7.5C14.76 7.5 17 9.74 17 12.5C17 13.01 16.9 13.5 16.76 13.96L19.82 17.02C21.21 15.79 22.31 14.25 23 12.5C21.27 8.11 17 5 12 5C10.73 5 9.51 5.2 8.36 5.57L10.53 7.74C11 7.6 11.49 7.5 12 7.5ZM2.71 3.16C2.32 3.55 2.32 4.18 2.71 4.57L4.68 6.54C3.06 7.83 1.77 9.53 1 12.5C2.73 16.89 7 20 12 20C13.52 20 14.97 19.7 16.31 19.18L19.03 21.9C19.42 22.29 20.05 22.29 20.44 21.9C20.83 21.51 20.83 20.88 20.44 20.49L4.13 4.17C3.74 3.78 3.1 3.78 2.71 3.16ZM12 17.5C9.24 17.5 7 15.26 7 12.5C7 11.73 7.18 11 7.49 10.36L9.06 11.93C9.03 12.11 9 12.3 9 12.5C9 14.16 10.34 15.5 12 15.5C12.2 15.5 12.39 15.47 12.57 15.44L14.14 17.01C13.5 17.32 12.77 17.5 12 17.5ZM14.97 11.17C14.82 9.77 13.72 8.68 12.33 8.53L14.97 11.17Z"
        fill="currentColor"
      />
    </svg>
  );
}

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const checks = [
    password.length >= 6,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ["Too short", "Weak", "Fair", "Good", "Strong"];
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#10b981"];
  return (
    <div className="rpa-strength">
      <div className="rpa-strength-bars">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="rpa-strength-bar"
            style={{ background: i < score ? colors[score] : "#e5e7eb" }}
          />
        ))}
      </div>
      <span className="rpa-strength-label" style={{ color: colors[score] }}>
        {labels[score]}
      </span>
    </div>
  );
}

export default function NewPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const code = searchParams.get("code") || "";

  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
  });

  const newPwd = watch("newPassword", "");

  const onSubmit = async (values: FormData) => {
    if (!email || !code) {
      toast.error("Session expired. Please start over.");
      window.location.href = "/dashboard/profile/settings/reset-password";
      return;
    }
    setLoading(true);
    try {
      const result = await resetPasswordAction(email, code, values.newPassword);
      if (!result.success) {
        toast.error(result.message || "Failed to reset password");
        return;
      }
      toast.success("Password reset successfully! Please log in again.");
      // ✅ window.location.href instead of router.push (fixes stuck loading)
      setTimeout(() => {
        window.location.href = "/login";
      }, 1800);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rpa-page">
      <header className="rpa-header">
        <div className="rpa-header-inner">
          <button
            type="button"
            className="rpa-back-btn"
            onClick={() => router.push("/dashboard/profile/settings/")}
          >
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="rpa-back-text">Back</span>
          </button>
          <div className="rpa-brand">
            <Image src={HamroPadhai} alt="HamroPadhai" height={32} />
          </div>
        </div>
      </header>

      <main className="rpa-body">
        <div className="rpa-card">
          <div className="rpa-icon-wrap rpa-icon-purple">
            <svg
              width="32"
              height="32"
              fill="none"
              stroke="white"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>

          <h1 className="rpa-title">Create new password</h1>
          <p className="rpa-subtitle">
            Your new password must be different from your previous password.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="rpa-form"
          >
            <div className="rpa-field">
              <label className="rpa-field-label">New Password</label>
              <div className="rpa-input-wrap">
                <input
                  type={showNew ? "text" : "password"}
                  placeholder="Enter new password"
                  className={`rpa-input${errors.newPassword ? " rpa-input--error" : ""}`}
                  maxLength={35}
                  {...register("newPassword")}
                />
                <button
                  type="button"
                  className="rpa-eye-btn"
                  onClick={() => setShowNew((v) => !v)}
                  tabIndex={-1}
                >
                  <EyeIcon visible={showNew} />
                </button>
              </div>
              {errors.newPassword && (
                <p className="rpa-error">{errors.newPassword.message}</p>
              )}
              <PasswordStrength password={newPwd} />
            </div>

            <div className="rpa-field">
              <label className="rpa-field-label">Confirm Password</label>
              <div className="rpa-input-wrap">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm new password"
                  className={`rpa-input${errors.confirmPassword ? " rpa-input--error" : ""}`}
                  maxLength={35}
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  className="rpa-eye-btn"
                  onClick={() => setShowConfirm((v) => !v)}
                  tabIndex={-1}
                >
                  <EyeIcon visible={showConfirm} />
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="rpa-error">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="rpa-primary-btn"
              disabled={loading}
              style={{ marginTop: 8 }}
            >
              {loading ? (
                <>
                  <span className="rpa-spinner rpa-spinner--sm" /> Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
