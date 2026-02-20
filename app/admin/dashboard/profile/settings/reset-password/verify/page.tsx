"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import HamroPadhai from "./../../../../../../../assets/images/HamroPadhai.png";
import {
  verifyResetCodeAction,
  sendResetCodeAction,
} from "./../../../../../../../lib/actions/reset-password-authenticated-action";
import "./../reset-password-authenticated.css";

export default function VerifyResetCodePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first box on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown((v) => v - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendCooldown]);

  // Redirect if no email
  useEffect(() => {
    if (!email)
      window.location.href = "/admin/dashboard/profile/settings/reset-password";
  }, [email]);

  const code = digits.join("");

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
    if (newDigits.join("").length === 6) verify(newDigits.join(""));
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    const newDigits = Array(6).fill("");
    pasted.split("").forEach((d, i) => {
      newDigits[i] = d;
    });
    setDigits(newDigits);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    if (pasted.length === 6) verify(pasted);
  };

  const verify = async (codeToVerify = code) => {
    if (codeToVerify.length < 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }
    setLoading(true);
    try {
      const result = await verifyResetCodeAction(email, codeToVerify);
      if (!result.success) {
        toast.error(result.message || "Invalid code");
        setDigits(Array(6).fill(""));
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
        return;
      }
      // ✅ window.location.href instead of router.replace (fixes stuck loading)
      window.location.href = `/admin/dashboard/profile/settings/reset-password/new-password?email=${encodeURIComponent(email)}&code=${encodeURIComponent(codeToVerify)}`;
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    try {
      const result = await sendResetCodeAction(email);
      if (result.success) {
        toast.success("Code resent successfully!");
        setResendCooldown(60);
        setDigits(Array(6).fill(""));
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      } else {
        toast.error(result.message || "Failed to resend code");
      }
    } catch {
      toast.error("Connection error. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="rpa-page">
      <header className="rpa-header">
        <div className="rpa-header-inner">
          <button
            type="button"
            className="rpa-back-btn"
            onClick={() => router.push("/admin/dashboard/profile/settings/")}
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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <h1 className="rpa-title">Check your email</h1>
          <p className="rpa-subtitle">
            We sent a 6-digit code to
            <br />
            <strong className="rpa-email">{email}</strong>
          </p>

          {/* 6-digit boxes */}
          <div className="rpa-otp-row" onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                className={`rpa-otp-box${digit ? " rpa-otp-box--filled" : ""}`}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
              />
            ))}
          </div>

          <button
            type="button"
            className="rpa-primary-btn"
            disabled={loading || code.length < 6}
            onClick={() => verify()}
          >
            {loading ? (
              <>
                <span className="rpa-spinner rpa-spinner--sm" /> Verifying...
              </>
            ) : (
              "Verify Code"
            )}
          </button>

          <p className="rpa-resend-text">
            Didn&apos;t receive the code?{" "}
            <button
              type="button"
              className="rpa-link-btn"
              disabled={resending || resendCooldown > 0}
              onClick={handleResend}
            >
              {resending
                ? "Sending..."
                : resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : "Resend"}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
