"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import HamroPadhai from "./../../../../../../assets/images/HamroPadhai.png";
import { changePasswordAction } from "../../../../../../lib/actions/change-password-action";

import "./change-password.css";

/* ── Validation ── */
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters")
      .max(35, "Password must be under 35 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

type ChangePasswordData = z.infer<typeof changePasswordSchema>;

/* ── Eye Icon ── */
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

/* ── Password Strength ── */
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
    <div className="chpw-strength">
      <div className="chpw-strength-bars">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="chpw-strength-bar"
            style={{ background: i < score ? colors[score] : "#e5e7eb" }}
          />
        ))}
      </div>
      <span className="chpw-strength-label" style={{ color: colors[score] }}>
        {labels[score]}
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function ChangePasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onSubmit",
  });

  const newPwd = watch("newPassword", "");

  const onSubmit = async (values: ChangePasswordData) => {
    setIsLoading(true);
    try {
      const result = await changePasswordAction({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      if (!result.success) {
        toast.error(result.message || "Failed to change password");
        return;
      }
      toast.success(result.message || "Password changed successfully!");
      reset();
      setTimeout(() => router.push("/admin/dashboard/profile/settings"), 1500);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => router.push("/admin/dashboard/profile/settings");
  const goReset = () =>
    router.push("/admin/dashboard/profile/settings/reset-password");

  /* ── Spinner ── */
  const spinner = <span className="chpw-spinner" />;

  return (
    <div className="chpw-root">
      {/* ════════════════════════════════
          MOBILE  (< 1024px)
      ════════════════════════════════ */}
      <div className="chpw-mobile">
        {/* Mobile top bar */}
        <div className="chpw-mobile-topbar">
          <button type="button" className="chpw-mobile-back" onClick={goBack}>
            <svg
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="chpw-mobile-topbar-title">Change Password</h1>
          <div style={{ width: 40 }} />
        </div>

        <div className="chpw-mobile-body">
          {/* Info banner */}
          <div className="chpw-banner">
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ flexShrink: 0 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              Enter your current password to verify your identity, then set your
              new password.
            </span>
          </div>

          {/* ✅ FIX: submit button is now INSIDE the form, with type="submit" */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="chpw-mobile-card">
              {/* Current Password */}
              <div className="chpw-field-group">
                <span className="chpw-field-label">Current Password</span>
                <div className="password-input-wrapper">
                  <input
                    type={showCurrent ? "text" : "password"}
                    placeholder="Enter your current password"
                    className={`auth-input chpw-auth-input${errors.currentPassword ? " chpw-input-err" : ""}`}
                    maxLength={35}
                    {...register("currentPassword")}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowCurrent((v) => !v)}
                    tabIndex={-1}
                  >
                    <EyeIcon visible={showCurrent} />
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="chpw-err-msg">
                    {errors.currentPassword.message}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div className="chpw-field-group">
                <span className="chpw-field-label">New Password</span>
                <div className="password-input-wrapper">
                  <input
                    type={showNew ? "text" : "password"}
                    placeholder="Enter your new password"
                    className={`auth-input chpw-auth-input${errors.newPassword ? " chpw-input-err" : ""}`}
                    maxLength={35}
                    {...register("newPassword")}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowNew((v) => !v)}
                    tabIndex={-1}
                  >
                    <EyeIcon visible={showNew} />
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="chpw-err-msg">{errors.newPassword.message}</p>
                )}
                <PasswordStrength password={newPwd} />
              </div>

              {/* Confirm Password */}
              <div className="chpw-field-group">
                <span className="chpw-field-label">Confirm New Password</span>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter your new password"
                    className={`auth-input chpw-auth-input${errors.confirmPassword ? " chpw-input-err" : ""}`}
                    maxLength={35}
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirm((v) => !v)}
                    tabIndex={-1}
                  >
                    <EyeIcon visible={showConfirm} />
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="chpw-err-msg">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            {/* ✅ FIX: type="submit" inside <form>, no onClick needed */}
            <button
              type="submit"
              className="auth-btn chpw-mobile-submit"
              disabled={isLoading}
              style={{
                marginTop: 16,
                width: "100%",
                padding: "16px",
                background: isLoading
                  ? "#8c1acc"
                  : "linear-gradient(135deg, #a020f0 0%, #7c3aed 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "14px",
                fontSize: "16px",
                fontWeight: 600,
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.8 : 1,
                transition: "all 0.2s",
                fontFamily: "inherit",
                letterSpacing: "0.01em",
              }}
            >
              {isLoading ? (
                <>{spinner} Changing Password...</>
              ) : (
                "Change Password"
              )}
            </button>
          </form>

          {/* Forgot link */}
          <p className="chpw-forgot-text">
            Don&apos;t remember your current password?{" "}
            <button
              type="button"
              className="chpw-forgot-link"
              onClick={goReset}
            >
              Reset it
            </button>
          </p>
        </div>
      </div>

      {/* ════════════════════════════════
          DESKTOP  (≥ 1024px)
      ════════════════════════════════ */}
      <div className="chpw-desktop">
        {/* Desktop header */}
        <header className="chpw-desktop-header">
          <div className="chpw-desktop-header-inner">
            <button
              type="button"
              className="chpw-desktop-back"
              onClick={goBack}
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
              Back
            </button>
            <div className="chpw-desktop-brand">
              <Image src={HamroPadhai} alt="HamroPadhai" height={32} />
            </div>
          </div>
        </header>

        {/* Desktop two-column layout */}
        <div className="chpw-desktop-body">
          {/* Left — purple security panel */}
          <div className="chpw-desktop-panel">
            <div className="chpw-panel-icon-wrap">
              <svg
                width="44"
                height="44"
                fill="none"
                stroke="white"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="chpw-panel-title">Secure Your Account</h2>
            <p className="chpw-panel-desc">
              Changing your password will sign you out of all other active
              sessions across your devices.
            </p>
            <div className="chpw-panel-tips">
              <p className="chpw-tips-heading">Strong password tips</p>
              <ul className="chpw-tips-list">
                <li>At least 6 characters long</li>
                <li>Mix uppercase &amp; lowercase letters</li>
                <li>Include numbers or symbols</li>
                <li>Avoid common words or names</li>
              </ul>
            </div>
          </div>

          {/* Right — form card */}
          <div className="chpw-desktop-form-col">
            <div className="chpw-desktop-form-card">
              <div className="chpw-desktop-form-heading">
                <h1 className="chpw-desktop-form-title">Change Password</h1>
                <p className="chpw-desktop-form-sub">
                  Enter your current password to verify your identity, then set
                  your new password.
                </p>
              </div>

              <div className="chpw-banner">
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ flexShrink: 0, marginTop: 1 }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  After changing your password, all other sessions on your
                  devices will be signed out automatically.
                </span>
              </div>

              {/* ✅ Desktop has its own independent form with its own inputs */}
              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="chpw-desktop-form"
              >
                {/* Current Password */}
                <div className="chpw-field-group">
                  <span className="chpw-field-label">Current Password</span>
                  <div className="password-input-wrapper">
                    <input
                      type={showCurrent ? "text" : "password"}
                      placeholder="Enter your current password"
                      className={`auth-input chpw-auth-input${errors.currentPassword ? " chpw-input-err" : ""}`}
                      maxLength={35}
                      {...register("currentPassword")}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowCurrent((v) => !v)}
                      tabIndex={-1}
                    >
                      <EyeIcon visible={showCurrent} />
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="chpw-err-msg">
                      {errors.currentPassword.message}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div className="chpw-field-group">
                  <span className="chpw-field-label">New Password</span>
                  <div className="password-input-wrapper">
                    <input
                      type={showNew ? "text" : "password"}
                      placeholder="Enter your new password"
                      className={`auth-input chpw-auth-input${errors.newPassword ? " chpw-input-err" : ""}`}
                      maxLength={35}
                      {...register("newPassword")}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowNew((v) => !v)}
                      tabIndex={-1}
                    >
                      <EyeIcon visible={showNew} />
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="chpw-err-msg">{errors.newPassword.message}</p>
                  )}
                  <PasswordStrength password={newPwd} />
                </div>

                {/* Confirm Password */}
                <div className="chpw-field-group">
                  <span className="chpw-field-label">Confirm New Password</span>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Re-enter your new password"
                      className={`auth-input chpw-auth-input${errors.confirmPassword ? " chpw-input-err" : ""}`}
                      maxLength={35}
                      {...register("confirmPassword")}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowConfirm((v) => !v)}
                      tabIndex={-1}
                    >
                      <EyeIcon visible={showConfirm} />
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="chpw-err-msg">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="auth-btn"
                  disabled={isLoading}
                  style={{
                    marginTop: 8,
                    marginBottom: 0,
                    width: "100%",
                    padding: "16px",
                    background: isLoading
                      ? "#8c1acc"
                      : "linear-gradient(135deg, #a020f0 0%, #7c3aed 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "16px",
                    fontWeight: 600,
                    cursor: isLoading ? "not-allowed" : "pointer",
                    opacity: isLoading ? 0.8 : 1,
                    transition: "all 0.2s",
                    fontFamily: "inherit",
                    letterSpacing: "0.01em",
                  }}
                >
                  {isLoading ? (
                    <>{spinner} Changing Password...</>
                  ) : (
                    "Change Password"
                  )}
                </button>

                <p className="chpw-forgot-text" style={{ marginTop: 16 }}>
                  Don&apos;t remember your current password?{" "}
                  <button
                    type="button"
                    className="chpw-forgot-link"
                    onClick={goReset}
                  >
                    Reset it
                  </button>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
